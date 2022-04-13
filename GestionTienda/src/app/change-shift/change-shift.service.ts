import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ModalService } from '../modals/modal/modal.service';
import { AccountService } from '../account/account.service';
import { IProduction } from '../services/global-service.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChangeShiftService {
  public isChangeRunningOut = new BehaviorSubject({time:'',value:false});
  public isChangeRequired = new BehaviorSubject(false);
  public isChangeOptionAvailable = new BehaviorSubject(false);
  constructor(private modalService: ModalService, private accountService: AccountService, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }
  setChangeShiftTime(closeTime: Date){
    let now = new Date();
    /*  console.log("now date:"+now);
    console.log("now:"+now.getTime());
    console.log("close date:"+closeTime);
    console.log("close:"+closeTime.getTime());
    console.log("now < close:"+(now.getTime() < closeTime.getTime()));  */
    let closeTimer;
    if(now.getTime() < closeTime.getTime()){
      closeTimer = setTimeout(()=>{
                    //this.isChangeRequired.next(true);
                    this.tryCloseShift();
                    let data = {
                      title: 'Cambio de turno',
                      message: 'La aplicación cerrará la sesión para realizar el proceso de cambio de turno',
                      btnText: 'Aceptar'
                    }
                    this.modalService.open(data).subscribe(result => {
                      if (result == "ok click") {
                        //this.tryCloseShift();
                        this.accountService.logout();
                      }
                    });
                  },closeTime.getTime()-now.getTime());
      sessionStorage.setItem("closetimer",closeTimer);
    }
     
  }
  setChangeShiftReminder(closeTimeReminder: Date, closeTime: Date){
    let now = new Date();
    let reminderTimer;
    if(now.getTime() < closeTime.getTime()){
      let timeReminder = new DatePipe('en-Us').transform(closeTime, 'HH:mm'); 
      reminderTimer = setTimeout(()=>{
        this.isChangeRunningOut.next({time:timeReminder,value:true});
      },closeTimeReminder.getTime()-now.getTime());
      sessionStorage.setItem("remindertimer",reminderTimer);
    }
    
  }
  setChangeShiftOption(changeOptionTime: Date, closeTime: Date){
    let now = new Date();
    let changeoptionTimer;
    if(now.getTime() < closeTime.getTime()){
      changeoptionTimer = setTimeout(()=>{
        this.isChangeOptionAvailable.next(true);
      },changeOptionTime.getTime()-now.getTime());
      sessionStorage.setItem("changeoptiontimer",changeoptionTimer);
    }
  }

  tryCloseShift() {
    let productionObj: IProduction;
    productionObj = JSON.parse(localStorage.getItem("production"));
    if (productionObj) {
      let usuario = this.accountService.getLoggedInUser(true);
      productionObj.usuarioCierreTurno = usuario;
      this.closeShift(productionObj).toPromise().then(result => {
        localStorage.removeItem("production");
        localStorage.removeItem("product");
        //this.accountService.logout();
      }).catch(error => {
        //this.accountService.logout();
      });
    }
    else {
      //this.accountService.logout();
    }
  }
  closeShift(production: IProduction): Observable<any> {
    return this.http.put<IProduction>(this.baseUrl + "api/production/closeshift", production);
  }

}
