import { Component, Injectable, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveModal, NgbCalendar, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { faCalendar} from '@fortawesome/free-solid-svg-icons';
import { ScheduleService } from 'src/app/schedule/schedule.service';
import { IProducts } from 'src/app/label-printing/label.service';
import { ToastrService } from 'ngx-toastr';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';
import { OrderService } from '../../orders/order.service';
import { IOrder } from '../../orders/interfaces/order';
import { IOrderDefault } from '../../orders/interfaces/orderdefault';
import { CustomAdapter, CustomDateParserFormatter, invalidDateValidator } from 'src/app/services/custom-date.helpers';


@UntilDestroy()
@Component({
  selector: 'app-orderCreate',
  templateUrl: './orderCreate.component.html',
  styleUrls: ['./orderCreate.component.css'],
  providers: [
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})
export class OrderCreateComponent implements OnInit{

  constructor(private ngbCalendar: NgbCalendar, private dateAdapter: NgbDateAdapter<string>, public activeModal: NgbActiveModal, private fb: FormBuilder, private scheduleService: ScheduleService, private toast: ToastrService, private orderService: OrderService) { }
  faCalendar = faCalendar;
  formGroup: FormGroup;
  products = [];
  productsLoading = false;
  orderDefaults: IOrderDefault;
  isCreating: boolean;
  ngOnInit() {
    this.formGroup = this.fb.group({
      contactPerson:'',
      createMethodType:'',
      expectedStartDateForm:[this.dateAdapter.toModel(this.ngbCalendar.getToday()),[Validators.required, invalidDateValidator]],
      factoryAddress:'',
      factoryCountry:'',
      factoryId: '',
      factoryName: '',
      poNumber: '',
      productCode: '',
      productDescription: '',
      productionLineId: '',
      productionOrderId: null,
      releaseMethodType: '',
      serviceProviderId: null,
      cisType: '',
      gtin: '',
      mrp: '',
      quantity: '',
      stickerId: '',
      sapOrderReference: ''
    });
    this.populateProductsControl().then(products => {
      this.products = products;
      this.setProductsFullDescription();
      this.productsLoading = false;
    });
    this.orderService.getOrderDefaults().toPromise().then(
      orderDefaults=>{
        this.orderDefaults = orderDefaults;
        this.showOrderDefaults();
      }
    );
    this.formGroup.controls['productCode'].valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe((id_producto) => {
      if (id_producto) {
        if (!this.productHasEan(id_producto)) {
          this.formGroup.controls['productCode'].reset();
        }
      }
    });
  }
  showOrderDefaults(){
       //.setValue(new DatePipe("en-US").transform(new Date(), 'yyyy-MM-dd'));
    //this.formGroup.controls["expectedStartDate"].setValue(new Date());
    this.formGroup.controls["contactPerson"].setValue(this.orderDefaults.contactPerson);
    this.formGroup.controls["createMethodType"].setValue(this.orderDefaults.createMethodType);
    this.formGroup.controls["factoryAddress"].setValue(this.orderDefaults.factoryAddress);
    this.formGroup.controls["factoryCountry"].setValue(this.orderDefaults.factoryCountry);
    this.formGroup.controls["factoryId"].setValue(this.orderDefaults.factoryId);
    this.formGroup.controls["factoryName"].setValue(this.orderDefaults.factoryName);
    this.formGroup.controls["productionLineId"].setValue(this.orderDefaults.productionLineId);
    this.formGroup.controls["releaseMethodType"].setValue(this.orderDefaults.releaseMethodType);
    this.formGroup.controls["cisType"].setValue("UNIT");
  }
  save(){
    if(this.formGroup.valid){
      let order: IOrder = Object.assign({},this.formGroup.value);
      let product: IProducts = this.products.find(p=>p.codigoMaterial == order.productCode);
      let cisType = this.formGroup.controls["cisType"].value;
      let templateId = cisType == "UNIT" ? 15:14;
      order.templateId = templateId;
      order.gtin = product.codigoEan;
      order.productDescription = product.descripcion;
      order.omsId = this.orderDefaults.omsId; 
      order.omsUrl = this.orderDefaults.omsUrl;
      order.token = this.orderDefaults.token;
      let dateArray = order.expectedStartDateForm.toString().split("/")
      order.expectedStartDate = new Date(parseInt(dateArray[2]),parseInt(dateArray[1])-1,parseInt(dateArray[0]));
      //console.log("date",  order.expectedStartDate);
     // return;
      this.isCreating = true;
      this.orderService.createOrder(order).toPromise().then(
        order=>{
          this.toast.success("La orden de id: "+order.orderId+" fue creada con éxito!");
          this.activeModal.close("ok");
        }).finally(()=>this.isCreating=false);
      
    }else{
      this.toast.warning("Favor de corregir errores en los campos indicados");
      this.validateAllFormFields(this.formGroup);
    }
  }
  close(){
    this.activeModal.close("");
  }

  populateProductsControl():Promise<any> {
    this.productsLoading = true;
    let products_promise = this.scheduleService.getProducts().toPromise();
    return products_promise;
  }
  setProductsFullDescription() {
    this.products.map(product => {
      product.fullDescripcion = product.descripcion + " (" + product.codigoMaterial+")";
    });
  }
  customSearchFn(term: string, item: IProducts) {
    term = term.toLowerCase();
    return item.descripcion.toLowerCase().indexOf(term) > -1 || item.codigoMaterial.toLowerCase() === term;
  }

  productHasEan(idProducto: string): boolean {
    let product = this.products.find(p => p.codigoMaterial == idProducto);
    if (product.codigoEan) { // && product.codigoEanCigarro
      return true;
    }
    if(!product.codigoEan){
      this.toast.error("Producto registrado sin código de barras");
    }
    // else if(!product.codigoEanCigarro){
    //   this.toast.error("Producto registrado sin código de barras para cigarro individual");
    // }
    return false;
  }
  
  
  validateAllFormFields(formGroup: FormGroup) {         
    Object.keys(formGroup.controls).forEach(field => {  
      const control = formGroup.get(field);             
      if (control instanceof FormControl) {             
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        
        this.validateAllFormFields(control);           
      }
    });
  }
}



