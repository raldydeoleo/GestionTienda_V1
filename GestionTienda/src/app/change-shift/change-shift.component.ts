import { Component, OnInit } from '@angular/core';
import { ChangeShiftService } from './change-shift.service';
import { GlobalService, IProduction } from '../services/global-service.service';
import { AccountService } from '../account/account.service';
import { ToastrService } from 'ngx-toastr';
import { LabelService } from '../label-printing/label.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
      selector: 'app-change-shift',
      templateUrl: './change-shift.component.html',
      styleUrls: ['./change-shift.component.css']
    })
export class ChangeShiftComponent implements OnInit {
  changeShiftRequired: boolean;
  constructor(private changeShiftService: ChangeShiftService, private globalService: GlobalService, private accountService: AccountService, private toast: ToastrService, private labelService: LabelService) {
    this.changeShiftService.isChangeRequired.pipe(
      untilDestroyed(this)
    ).subscribe((v) => {
      this.changeShiftRequired = v;
    });
  }

  ngOnInit() {
  }

  closeShift(){
     let production: IProduction;
     production = this.globalService.getLocalProduction();
     let usuario = this.accountService.getLoggedInUser();
     production.usuarioCierreTurno = usuario;
    this.globalService.closeShift(production).pipe(
      untilDestroyed(this)
    ).subscribe(null,error => console.error(error),
     ()=>{
        this.toast.success("El turno fue cerrado exitosamente");
        localStorage.removeItem("production");
        localStorage.removeItem("product");
        this.changeShiftRequired = false;
        this.labelService.isShiftClosed.next(true);
     });
  }
}
