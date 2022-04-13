import { Component, OnInit, ViewChildren, QueryList, DoCheck} from '@angular/core';
import { ProductosService } from './productos.service';
import { AccountService } from '../account/account.service';
import { ToastrService } from 'ngx-toastr';
import { IProductos } from './productos';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { SortEvent, SortDirective } from '../directives/sort.directive';
import { IProcess } from '../process/process';
import { ModalService } from '../modals/modal/modal.service';
import { RouterLink } from '@angular/router';

@UntilDestroy()
@Component({
      selector: 'app-module',
      templateUrl: './productos.component.html',
      styleUrls: ['./productos.component.css']
    })
export class ProductosComponent implements OnInit {
  public productos: IProductos[];
  //public processes: IProcess[];
  productos$: Observable<IProductos[]>;
  total$: Observable<number>;
  faSort = faSort;
  @ViewChildren(SortDirective) headers: QueryList<SortDirective>;
  constructor(public productosService: ProductosService, private accountService: AccountService, private toast: ToastrService, private modalService: ModalService) {
    this.productosService.fillProductos();
    this.productosService._search$.next();
    this.productos$ = productosService.productos$;
    this.total$ = productosService.total$;   
  }

  ngOnInit() {    
    this.loadData();
    this.productos$.subscribe(productos => this.productos = productos);
    //this.accountService.showSubMenu("configuracionMenu"); //DESPLEGAR MENU CONFIGURACION AL INICIAR
  }
  
  loadData(): void {
      this.productosService.getProductos()
      .toPromise().then(productos => this.productos = productos);
  }
 
  reponer(producto: IProductos) {
    let data = {
      title: 'Confirmación de reposición',
      message: `¿Está seguro que desea realizar reposición  lel producto ${producto.nombre} ?`,
      btnText: 'Sí',
      btnCancelText: 'No',
      hasCancelOption: 'Si',
      okBtnClass: 'btn-danger'
    }
    this.modalService.open(data).pipe(
      untilDestroyed(this)
    ).subscribe(result => {
      if (result == "ok click") {        
        this.productosService.deleteProducto(producto).pipe(untilDestroyed(this)).subscribe(null, error => console.error(error), () => { this.productosService.fillProductos(); this.toast.success("Producto Eliminado!"); });
      }
    });
    

  }
   delete(producto: IProductos) {
    let data = {
      title: 'Confirmación de eliminación',
      message: `¿Está seguro que desea eliminar el producto ${producto.nombre} ?`,
      btnText: 'Sí',
      btnCancelText: 'No',
      hasCancelOption: 'Si',
      okBtnClass: 'btn-danger'
    }
    this.modalService.open(data).pipe(
      untilDestroyed(this)
    ).subscribe(result => {
      if (result == "ok click") {        
        this.productosService.deleteProducto(producto).pipe(untilDestroyed(this)).subscribe(null, error => console.error(error), () => { this.productosService.fillProductos(); this.toast.success("Producto Eliminado!"); });
      }
    });
    
  } 
}
