import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModuleService } from '../module.service';
import { ToastrService } from 'ngx-toastr';
import { IModule } from '../module';
import { ActivatedRoute, Router } from '@angular/router';
import { IProcess } from '../../process/process';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-module-form',
  templateUrl: './module-form.component.html',
  styleUrls: ['./module-form.component.css']
})
export class ModuleFormComponent implements OnInit {
  public modoEdicion: boolean = false;
  formGroup: FormGroup;
  id: number;
  module: IModule;
  processes: IProcess[];
  constructor(private moduleService: ModuleService, private toast: ToastrService, private activatedRoute: ActivatedRoute, private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      codigo: '',
      descripcion: '',
      idProceso: '',
      numeroModulo: ['', [Validators.minLength(2), Validators.maxLength(2)]],
      textoModulo: ''
    });
    this.formGroup.controls['codigo'].disable();
    this.loadProcesses();
    this.activatedRoute.params.pipe(untilDestroyed(this)).subscribe(params => {
      if (params['id'] == undefined) {
        return;
      }
      this.modoEdicion = true;
      this.formGroup.controls['idProceso'].disable();
      this.id = params['id'];
      this.moduleService.getModule(this.id).toPromise().then(module => this.cargarFormulario(module));
    });
  }

  loadProcesses() {
    this.moduleService.getProcesses().toPromise().then(processes => {
      this.processes = processes;
      this.setOnProcessChangeEvent();
    });
  }

  setOnProcessChangeEvent() {
    this.formGroup.controls['idProceso'].valueChanges.pipe(untilDestroyed(this)).subscribe(idProceso => {
      if (idProceso != "") {
        if (!this.modoEdicion) {
          this.moduleService.getNextModuleCode(parseInt(idProceso)).pipe(untilDestroyed(this)).subscribe(result => {
            this.formGroup.controls['codigo'].enable();
            this.formGroup.controls['codigo'].setValue(result.code);
            this.formGroup.controls['codigo'].disable();
          });
        }
      } else {
        this.formGroup.controls['codigo'].reset();
      }
    });
  }

  cargarFormulario(module: IModule): void {
    this.module = module;
    this.formGroup.patchValue({
      codigo: module.codigo,
      descripcion: module.descripcion,
      idProceso: module.idProceso,
      numeroModulo: module.numeroModulo,
      textoModulo: module.textoModulo
    });
  }
  save() {
    if (this.modoEdicion) {
      this.module.codigo = this.formGroup.controls['codigo'].value;
      this.module.idProceso = this.formGroup.controls['idProceso'].value;
      this.module.descripcion = this.formGroup.controls['descripcion'].value;
      this.module.usuarioModificacion = localStorage.getItem('username');
      this.module.numeroModulo = this.formGroup.controls['numeroModulo'].value;
      this.module.textoModulo = this.formGroup.controls['textoModulo'].value;
      this.module.process = null;
      this.moduleService.updateModule(this.module).toPromise().then(module => this.onSaveSuccess());
    }
    else {
      this.formGroup.controls['codigo'].enable();
      let module: IModule = Object.assign({}, this.formGroup.value);
      this.formGroup.controls['codigo'].disable();
      module.usuarioRegistro = localStorage.getItem('username');
      module.usuarioModificacion = module.usuarioRegistro;
      this.moduleService.createModule(module).toPromise().then(module => this.onSaveSuccess());
    }

  }
  onSaveSuccess(): void {
    this.toast.success("Módulo guardado");
    this.router.navigate(["/module"]);
  }

}
