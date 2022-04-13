import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbDateAdapter, NgbDateParserFormatter, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Observable} from 'rxjs';
import { AccountService } from 'src/app/account/account.service';
import { ModalService } from '../modals/modal.service';
import { ModalService as AppModalService} from '../../../app/modals/modal/modal.service';
import { IOrder } from './interfaces/order';
import { OrderService } from './order.service';
import {faSort} from '@fortawesome/free-solid-svg-icons';
import { SortEvent, SortOrdersDirective } from './sort-orders.directive';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { faCalendar} from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { IOrderDefault } from './interfaces/orderdefault';
import { Console } from 'console';
import { Router } from '@angular/router';
import { CustomAdapter, CustomDateParserFormatter } from 'src/app/services/custom-date.helpers';

@UntilDestroy()
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  providers: [
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})
export class OrdersComponent implements OnInit {
  faCalendar = faCalendar;
  orders:IOrder[];
  orders$: Observable<IOrder[]>;
  total$: Observable<number>;
  faSort = faSort;
  orderDefaults: IOrderDefault;
  isSupervisor = false;
  gettingCodesSpinnerArray = [];
  authPrintSpinner = 0;
  closingSpinnerArray = [];
  isLoadingOrders = false;
  @ViewChildren(SortOrdersDirective) headers: QueryList<SortOrdersDirective>;
  constructor(private accountService: AccountService, private modalService: ModalService, public orderService: OrderService, private toastr: ToastrService, private router: Router, private appModalService: AppModalService) { 
    //this.orderService.fillOrdersArray();
    this.orderService._search$.next();
    this.orders$ = this.orderService.orders$;
    this.total$ = this.orderService.total$;
  }

  ngOnInit(): void {
    this.isLoadingOrders = true;
    this.orderService.orders$.pipe(untilDestroyed(this)).subscribe(orders =>{ 
      this.isLoadingOrders = false;
      this.orders = orders;
    });
    this.accountService.showSubMenu("dataMatrixMenu");
    this.orderService.getOrderDefaults().toPromise().then(
      orderDefaults=>{
        this.orderDefaults = orderDefaults;
      }
    );
    this.checkPermissions();
  }

  showCreateModal(){
    let extendedOptions: NgbModalOptions = {
      size: 'lg',
      scrollable: true
    };
    this.modalService.open("OrderCreation",null,extendedOptions).toPromise().then(result=>{
      if(result == 'ok'){
           this.orderService._search$.next();
      }
    });
  }

  close(order: IOrder,i:number){
    let data = {
      title: 'Confirmación de cierre de orden',
      message: `¿Está seguro que desea cerrar esta orden?
                \n ID de orden: ${order.orderId} 
                \n Producto: ${order.productDescription}
                \n Códigos disponibles: ${(order.codes.filter(c=>!c.isPrinted)).length}`,
      btnText: 'Sí',
      btnCancelText: 'No',
      hasCancelOption: 'Si',
      okBtnClass: 'btn-danger'
    }
    let extendedOptions: NgbModalOptions = {
      size: 'lg'
    };
    this.appModalService.open(data,extendedOptions).pipe(
      untilDestroyed(this)
    ).subscribe(result => {
      if (result == "ok click") {
          order.omsId = this.orderDefaults.omsId;
          order.omsUrl = this.orderDefaults.omsUrl;
          order.token = this.orderDefaults.token;
          this.closingSpinnerArray.push(i);
          this.orderService.closeOrder(order).then(
            order=>{
              this.toastr.success("La Orden de Id "+order.orderId+" fue cerrada exitosamente","Cierre de orden");
              this.orderService._search$.next();
            }
          ).finally(()=>this.closingSpinnerArray = this.closingSpinnerArray.filter(o=>o != i ));
      }
    });
  }

  getCodes(order:IOrder, i:number){
    order.omsId = this.orderDefaults.omsId;
    order.omsUrl = this.orderDefaults.omsUrl;
    order.token = this.orderDefaults.token;
    this.gettingCodesSpinnerArray.push(i);
    this.checkAvailability(order).then(
      results=>{
        this.orders = results;
        this.toastr.success("La orden está lista","Verificación éxitosa");
        this.orderService.setOrders$(results);
        this.gettingCodesSpinnerArray.push(i);
        this.getCodesFromOms(order).then(
          codes=>{
             this.orderService._search$.next();
             this.showCodesModal(codes);
          }
        ).finally(()=>{
          this.gettingCodesSpinnerArray = this.gettingCodesSpinnerArray.filter(o=>o != i );
          console.log(this.gettingCodesSpinnerArray);
        });
      }
    ).catch(error=>{
      this.gettingCodesSpinnerArray = this.gettingCodesSpinnerArray.filter(o=>o != i );
      //this.manageError(error);
    }).finally(()=>{
      this.orderService._search$.next();
    });
  }

  manageError(error){
    if (error.status == 400) {
      this.toastr.error(error.error.globalErrors[0].error);
    }
  }

  getCodesFromOms(order:IOrder):Promise<any[]>{
    return this.orderService.getCodesForOrder(order).toPromise();
  }

  checkAvailability(order: IOrder):Promise<IOrder[]>{
    return this.orderService.checkCodesAvailability(order).toPromise();
  }

  showCodesModal(codes:any[]){
    let extendedOptions: NgbModalOptions = {
      size: 'lg',
      scrollable: true
    };
    let data = {codes: codes};
    this.modalService.open("CodesManagement",data,extendedOptions).toPromise().then();
  }

  showCodes(order: IOrder){
     this.showCodesModal(order.codes);
  }

  checkPermissions(){
    this.isSupervisor = this.accountService.canViewOption("DataMatrix_supervisor");
  }

  authorizePrint(order: IOrder,i:number){
    let data = {
      title: 'Confirmación de autorización de impresión',
      message: `¿Está seguro que desea autorizar la impresión de esta orden?
                \n ID de orden: ${order.orderId}
                \n Producto: ${order.productDescription}`,
      btnText: 'Sí',
      btnCancelText: 'No',
      hasCancelOption: 'Si',
      okBtnClass: 'btn-danger'
    }
    let extendedOptions: NgbModalOptions = {
      size: 'lg'
    };
    this.appModalService.open(data,extendedOptions).pipe(
      untilDestroyed(this)
    ).subscribe(result => {
      if (result == "ok click") {
        this.authPrintSpinner = i;
        this.orderService.authorizePrint(order).then(
          order=>{
            this.toastr.success("La orden de Id "+order.orderId+" fue autorizada exitosamente para impresión","Autorización de orden");
            this.orderService._search$.next();
          }
        ).finally(()=>this.authPrintSpinner = 0);
      }
    });
  }

  async print(order: IOrder,i:number){
    if(await this.orderService.canPrintOrder(order.id)){
        this.router.navigate(['/device'],
        {
          queryParams: {
            orderId: order.id
          }
        });
    }
  }
  
  onSort({ column, direction }: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.orderService.sortColumn = column;
    this.orderService.sortDirection = direction;
  }

}
