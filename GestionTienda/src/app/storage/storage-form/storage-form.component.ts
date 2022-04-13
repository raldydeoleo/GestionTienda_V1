import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { StorageService } from '../storage.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { IStorage } from '../storage';

@Component({
  selector: 'app-storage-form',
  templateUrl: './storage-form.component.html',
  styleUrls: ['./storage-form.component.css']
})
export class StorageFormComponent implements OnInit {
  public modoEdicion: boolean = false;
  formGroup: FormGroup;
  idStorage: number;
  storage: IStorage;
  constructor(private storageService: StorageService, private toast: ToastrService, private activatedRoute: ActivatedRoute, private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      codigo: '',
      descripcion: ''
    });
    this.activatedRoute.params.subscribe(params => {
      if (params['id'] == undefined) {
        return;
      }
      this.modoEdicion = true;
      this.idStorage = params['id'];
      this.storageService.getStorage(this.idStorage).toPromise().then(storage => this.cargarFormulario(storage), error => console.error(error));
    });
  }
  cargarFormulario(storage: IStorage): void {
    this.storage = storage;
    this.formGroup.patchValue({
      codigo: storage.codigo,
      descripcion: storage.descripcion
    });
  }
  save() {

    if (this.modoEdicion) {
      this.storage.codigo = this.formGroup.controls['codigo'].value;
      this.storage.descripcion = this.formGroup.controls['descripcion'].value;
      this.storage.usuarioModificacion = localStorage.getItem('username');
      this.storageService.updateStorage(this.storage).toPromise().then(storage => this.onSaveSuccess(), error => console.error(error));
    }
    else {
      let storage: IStorage = Object.assign({}, this.formGroup.value);
      storage.usuarioRegistro = localStorage.getItem('username');
      storage.usuarioModificacion = storage.usuarioRegistro;
      this.storageService.createStorage(storage).toPromise().then(shift => this.onSaveSuccess(), error => console.error(error));
    }

  }
  onSaveSuccess(): void {
    this.toast.success("Almacenamiento guardado");
    this.router.navigate(["/storage"]);
  }

}
