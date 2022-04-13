import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IProcess } from 'src/app/process/process';
import { IModule } from 'src/app/module/module';
import { DeviceService } from 'src/app/device/device.service';
import { ShiftService } from 'src/app/shift/shift.service';
import { IShift } from 'src/app/shift/shift';

@UntilDestroy()
@Component({
      selector: 'reprint-filter',
      templateUrl: './reprint-filter.component.html',
      styleUrls: ['./reprint-filter.component.css']
    })
export class ReprintFilterComponent implements OnInit {
  public processes: IProcess[];
  public modules: IModule[];
  public optionModules: IModule[];
  public shifts: IShift[];
  constructor(private fb: FormBuilder, private router: Router, private deviceService: DeviceService, private shiftService: ShiftService) { }
  formGroup: FormGroup;
  ngOnInit() {
    this.formGroup = this.fb.group({
      idProceso: '',
      idModulo: '',
      idTurno: '',
      fechaProduccion: '',
    });
    this.loadData();
  }
  gotoreprint() {
    if (this.formGroup.valid) {
      let idModule = this.formGroup.controls['idModulo'].value;
      let idProcess = this.formGroup.controls['idProceso'].value;
      let module = this.modules.find(m => m.id == idModule).descripcion;
      let process = this.processes.find(p => p.id == idProcess).descripcion;
      this.router.navigate(['reprint/print'],
        {
          queryParams: {
            process: process,
            module: module,
            idProceso: idProcess,
            idModulo: idModule,
            idTurno: this.formGroup.controls['idTurno'].value,
            fechaProduccion: this.formGroup.controls['fechaProduccion'].value,
          }
        });
    }
    else {
      this.validateAllFormFields(this.formGroup);
    }
  }

  loadData(): void {
    this.deviceService.getProcesses()
      .toPromise().then(processes => this.processes = processes);

    this.deviceService.getModules()
      .toPromise().then(modules => this.modules = modules);

    this.shiftService.getShifts()
      .toPromise().then(shifts => this.shifts = shifts);

    this.formGroup.controls['idProceso'].valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe((idProceso) => {
      if (this.modules) {
        this.populateModules(idProceso);
      }

    });

  }

  populateModules(idProceso: number): void {
    this.optionModules = this.modules.filter(function (module) {
      return module.idProceso == idProceso
    });
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
