import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Productos_ProvService } from '../productos.service';
import { ToastrService } from 'ngx-toastr';
import { IProductos } from './productos';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-producto-form',
  templateUrl: './producto_prov-form.component.html',
  styleUrls: ['./producto_prov-form.component.css']
})
export class Producto_provFormComponent implements OnInit {
  public modoEdicion: boolean = false;
  formGroup: FormGroup;
  id: number;
  producto: IProductos;  
  constructor(private productosService: Productos_ProvService, private toast: ToastrService, private activatedRoute: ActivatedRoute, private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      id: 0,
      nombre: '',
      precio: '',      
      cantidad: '',
      fecha_entrada:''      
    });
    this.formGroup.controls['id'].disable();      
    this.activatedRoute.params.pipe(untilDestroyed(this)).subscribe(params => {
      if (params['id'] == undefined) {
        return;
      }
      this.modoEdicion = true;
      this.formGroup.controls['id'].disable();
      this.id = params['id'];
      this.productosService.getProducto(this.id).toPromise().then(producto => this.cargarFormulario(producto));      
    });
  }

  cargarFormulario(producto: IProductos): void {
    this.producto = producto;
    this.formGroup.patchValue({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,      
      cantidad: producto.cantidad,
      fecha_entrada: producto.fecha_entrada          
    });
  }

  save() {
    if (this.modoEdicion) {
      this.producto.id = this.formGroup.controls['id'].value;     
      this.producto.nombre = this.formGroup.controls['nombre'].value;      
      this.producto.precio = this.formGroup.controls['precio'].value;
      this.producto.cantidad = this.formGroup.controls['cantidad'].value;  
      this.producto.fecha_entrada = this.formGroup.controls['fecha_entrada'].value;      
      this.productosService.updateProducto(this.producto).toPromise().then(producto => this.onSaveSuccess());
    }
    else {
      this.formGroup.controls['id'].enable();
      let producto: IProductos = Object.assign({}, this.formGroup.value);
      this.formGroup.controls['id'].disable();      
      this.productosService.createProducto(producto).toPromise().then(producto => this.onSaveSuccess());
    }

  }
  onSaveSuccess(): void {
    this.toast.success("Producto guardado");
    this.router.navigate(["/listadeproductossuplidor"]);
  }

}
