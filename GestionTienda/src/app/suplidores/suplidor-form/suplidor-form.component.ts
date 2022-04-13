import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SuplidoresService } from '../suplidores.service';
import { ToastrService } from 'ngx-toastr';
import { ISuplidores } from '../suplidores';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-producto-form',
  templateUrl: './suplidor-form.component.html',
  styleUrls: ['./suplidor-form.component.css']
})
export class SuplidorFormComponent implements OnInit {
  public modoEdicion: boolean = false;
  formGroup: FormGroup;
  id: number;
  suplidor: ISuplidores;  
  constructor(private suplidoresService: SuplidoresService, private toast: ToastrService, private activatedRoute: ActivatedRoute, private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      id: 0,
      nombre: '',
      precio: '',      
      rnc: '',
      direccion: '',
      telefono:''      
    });
    this.formGroup.controls['id'].disable();      
    this.activatedRoute.params.pipe(untilDestroyed(this)).subscribe(params => {
      if (params['id'] == undefined) {
        return;
      }
      this.modoEdicion = true;
      this.formGroup.controls['id'].disable();
      this.id = params['id'];
      this.suplidoresService.getSuplidor(this.id).toPromise().then(suplidor => this.cargarFormulario(suplidor));
      console.log(this.id);
    });
  }

  cargarFormulario(suplidor: ISuplidores): void {
    this.suplidor = suplidor;
    this.formGroup.patchValue({
      id: suplidor.id,
      nombre: suplidor.nombre,
      rnc: suplidor.rnc,      
      direccion: suplidor.direccion,
      telefono: suplidor.telefono      
    });
  }

  save() {
    if (this.modoEdicion) {
      this.suplidor.id = this.formGroup.controls['id'].value;     
      this.suplidor.nombre = this.formGroup.controls['nombre'].value;      
      this.suplidor.rnc = this.formGroup.controls['rnc'].value;
      this.suplidor.direccion = this.formGroup.controls['direccion'].value;
      this.suplidor.telefono = this.formGroup.controls['telefono'].value;      
      this.suplidoresService.updateSuplidor(this.suplidor).toPromise().then(suplidor => this.onSaveSuccess());
    }
    else {
      this.formGroup.controls['id'].enable();
      let suplidor: ISuplidores = Object.assign({}, this.formGroup.value);
      this.formGroup.controls['id'].disable();      
      this.suplidoresService.createSuplidor(suplidor).toPromise().then(suplidor => this.onSaveSuccess());
    }

  }
  onSaveSuccess(): void {
    this.toast.success("Suplidor guardado");
    this.router.navigate(["/listasuplidores"]);
  }

}
