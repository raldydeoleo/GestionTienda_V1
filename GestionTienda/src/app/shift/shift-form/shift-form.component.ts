import { Component, OnInit } from '@angular/core';
import { ShiftService } from '../shift.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IShift } from '../shift';

@Component({
  selector: 'app-shift-form',
  templateUrl: './shift-form.component.html',
  styleUrls: ['./shift-form.component.css']
})
export class ShiftFormComponent implements OnInit {
  public modoEdicion: boolean = false;
  formGroup: FormGroup;
  id: number;
  shift: IShift;
  constructor(private shiftService: ShiftService, private toast: ToastrService, private activatedRoute: ActivatedRoute, private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      codigo: '',
      descripcion: '',
      letraRepresentacion: '',
      horaInicio: '',
      horaFin: ''
    });
    this.activatedRoute.params.subscribe(params => {
      if (params['id'] == undefined) {
        return;
      }
      this.modoEdicion = true;
      //this.formGroup.controls['codigo'].disable();
      this.id = params['id'];
      this.shiftService.getShift(this.id).toPromise().then(shift => this.cargarFormulario(shift), error => console.error(error));
    });
  }

  cargarFormulario(shift: IShift): void {
    this.shift = shift;
    this.formGroup.patchValue({
      codigo: shift.codigo,
      descripcion: shift.descripcion,
      letraRepresentacion: shift.letraRepresentacion,
      horaInicio: shift.horaInicio,
      horaFin: shift.horaFin
    });
  }
  save() {

    if (this.modoEdicion) {
      this.shift.codigo = this.formGroup.controls['codigo'].value;
      this.shift.descripcion = this.formGroup.controls['descripcion'].value;
      this.shift.letraRepresentacion = this.formGroup.controls['letraRepresentacion'].value;
      this.shift.horaInicio = this.formGroup.controls['horaInicio'].value;
      this.shift.horaFin = this.formGroup.controls['horaFin'].value;
      this.shift.usuarioModificacion = localStorage.getItem('username');
      this.shiftService.updateShift(this.shift).toPromise().then(shift => this.onSaveSuccess());
    }
    else {
      let shift: IShift = Object.assign({}, this.formGroup.value);
      shift.usuarioRegistro = localStorage.getItem('username');
      shift.usuarioModificacion = shift.usuarioRegistro;
      this.shiftService.createShift(shift).toPromise().then(shift => this.onSaveSuccess());
    }

  }
  onSaveSuccess(): void {
    this.toast.success("Turno guardado");
    this.router.navigate(["/shift"]);
  }

}
