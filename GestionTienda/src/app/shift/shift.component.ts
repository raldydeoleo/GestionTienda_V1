import { Component, OnInit } from '@angular/core';
import { ShiftService } from './shift.service';
import { AccountService } from '../account/account.service';
import { ToastrService } from 'ngx-toastr';
import { IShift } from './shift';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ModalService } from '../modals/modal/modal.service';

@UntilDestroy()
@Component({
      selector: 'app-shift',
      templateUrl: './shift.component.html',
      styleUrls: ['./shift.component.css']
    })
export class ShiftComponent implements OnInit {
  public shifts: IShift[];
  constructor(private shiftService: ShiftService, private accountService: AccountService, private toast: ToastrService, private modalService: ModalService) { }

  ngOnInit() {
    this.loadData();
    this.accountService.showSubMenu("configuracionMenu");
  }
  delete(shift: IShift) {
    let data = {
      title: 'Confirmación de eliminación',
      message: `¿Está seguro que desea eliminar el ${shift.descripcion.toLowerCase()}?`,
      btnText: 'Sí',
      btnCancelText: 'No',
      hasCancelOption: 'Si',
      okBtnClass: 'btn-danger'
    }
    this.modalService.open(data).pipe(
      untilDestroyed(this)
    ).subscribe(result => {
      if (result == "ok click") {
        shift.usuarioBorrado = this.accountService.getLoggedInUser();
        this.shiftService.deleteShift(shift).pipe(untilDestroyed(this)).subscribe(shift => this.loadData(), error => console.error(error), () => this.toast.success("Turno Eliminado!")); 
      }
    });
    
  }
  loadData(): void {
    this.shiftService.getShifts()
      .toPromise().then(shifts => this.shifts = shifts, error => console.error(error));
  }
}
