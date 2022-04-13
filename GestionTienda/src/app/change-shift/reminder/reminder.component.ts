import { Component, OnInit } from '@angular/core';
import { ChangeShiftService } from '../change-shift.service';
import { AccountService } from 'src/app/account/account.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
      selector: 'app-reminder',
      templateUrl: './reminder.component.html',
      styleUrls: ['./reminder.component.css']
    })
export class ReminderComponent implements OnInit {
  changeShiftReminder: boolean;
  changeHour: string;
  closeReminder: boolean;
  constructor(private changeShiftService: ChangeShiftService, private accountService: AccountService, private globalService: GlobalService) { 
    this.changeShiftService.isChangeRunningOut.pipe(
      untilDestroyed(this)
    ).subscribe((v) => {
      this.changeShiftReminder = v.value;
      this.changeHour = v.time;
    });
    this.accountService.isLoggingOut.subscribe(v =>{
       if(v==true){
         this.closeMessage();
       }
    });
    this.changeShiftService.isChangeOptionAvailable.pipe(
      untilDestroyed(this)
    ).subscribe(v=>{
      this.closeReminder = v;
    });
  }

  ngOnInit() {
  }

  closeMessage(){
    this.changeShiftService.isChangeRunningOut.next({time:'',value:false});
  }

  closeAndOpenShift(){
    this.globalService.closeAndOpenShiftProcess();
  }
}
