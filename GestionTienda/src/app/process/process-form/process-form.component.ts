import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcessService } from '../process.service';
import { IProcess } from '../process';

@Component({
  selector: 'app-process-form',
  templateUrl: './process-form.component.html',
  styleUrls: ['./process-form.component.css']
})
export class ProcessFormComponent implements OnInit {
  public modoEdicion: boolean = false;
  formGroup: FormGroup;
  id: number;
  process: IProcess;
  constructor(private processService: ProcessService, private toast: ToastrService, private activatedRoute: ActivatedRoute, private fb: FormBuilder,private router: Router) { }
  
  ngOnInit() {
    this.formGroup = this.fb.group({
      codigo: '',
      descripcion: '',
      codigoPermiso:''
    });
    this.activatedRoute.params.subscribe(params => {
      if (params['id'] == undefined) {
        return;
      }
      this.modoEdicion = true;
      //.formGroup.controls['codigo'].disable();
      this.id = params['id'];
      this.processService.getProcess(this.id).toPromise().then(process => this.cargarFormulario(process));
    });
  }

  cargarFormulario(process: IProcess): void {
      this.process = process;
      this.formGroup.patchValue({
        codigo: process.codigo,
        descripcion: process.descripcion,
        codigoPermiso: process.codigoPermiso
      });
  }
  save() {
    
    if (this.modoEdicion) {
      this.process.codigo = this.formGroup.controls['codigo'].value;
      this.process.descripcion = this.formGroup.controls['descripcion'].value;
      this.process.codigoPermiso = this.formGroup.controls['codigoPermiso'].value;
      this.process.usuarioModificacion = localStorage.getItem('username');
      this.processService.updateProcess(this.process).toPromise().then(process => this.onSaveSuccess());
    }
    else {
      let process: IProcess = Object.assign({}, this.formGroup.value);
      process.usuarioRegistro = localStorage.getItem('username');
      process.usuarioModificacion = process.usuarioRegistro;
      this.processService.createProcess(process).toPromise().then(process => this.onSaveSuccess());
    }
    
  }
  onSaveSuccess(): void {
    this.toast.success("Proceso guardado");
    this.router.navigate(["/process"]);
  }
}
