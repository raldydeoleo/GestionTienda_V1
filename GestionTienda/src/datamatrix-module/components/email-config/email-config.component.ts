import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AccountService } from 'src/app/account/account.service';
import { SpinnerLoaderService } from 'src/app/services/spinner-loader.service';
import { IEmailAccount } from '../orders/interfaces/emailAccount';
import { OrderService } from '../orders/order.service';
import { ModalService as AppModalService} from '../../../app/modals/modal/modal.service';

@UntilDestroy()
@Component({
  selector: 'app-email-config',
  templateUrl: './email-config.component.html',
  styleUrls: ['./email-config.component.css']
})
export class EmailConfigComponent implements OnInit {

  constructor(private accountService: AccountService, private fb: FormBuilder, private orderService:OrderService, private toast: ToastrService, private spinner: SpinnerLoaderService, private appModalService: AppModalService) {
    this.emails$ = this.orderService.getEmailAccounts();
   }
  formGroup: FormGroup;
  emails:IEmailAccount[];
  emails$:Observable<IEmailAccount[]>;
  deleteSpinnerArray = [];
  ngOnInit() {
   
    this.formGroup = this.fb.group({
      email:['',Validators.email],
      isCopy:''
    });
    this.formGroup.controls['isCopy'].setValue(true);
    this.accountService.showSubMenu("dataMatrixMenu");
    this.getEmails();
    
  }
  getEmails(){
    this.emails$.pipe(untilDestroyed(this)).subscribe(
      emails=>this.emails = emails
    );
  }
  save(){
    if(this.formGroup.valid){
      let dir: IEmailAccount = Object.assign({},this.formGroup.value);
      this.spinner.isLoading.next(true);
      this.orderService.createEmail(dir).pipe(untilDestroyed(this), finalize(()=>this.spinner.isLoading.next(false))).subscribe(
        dir=>{
          this.toast.success("El correo ha sigo agregado exitosamente.","Registro exitoso");
          this.emails$ = this.orderService.getEmailAccounts();
          this.getEmails();
          this.formGroup.controls['email'].reset();
        }
      );
    }
    else{
      this.toast.warning("Verifique la dirección de correo a añadir","Error de validación"); 
      this.validateAllFormFields(this.formGroup);
    }
  }
  delete(email: IEmailAccount,i){
    let data = {
      title: 'Confirmación de eliminación',
      message: `¿Está seguro que desea eliminar el correo: ${email.email}`,
      btnText: 'Sí',
      btnCancelText: 'No',
      hasCancelOption: 'Si',
      okBtnClass: 'btn-danger'
    }
    
    this.appModalService.open(data).pipe(
      untilDestroyed(this)).subscribe(
      result=>{
        if (result == "ok click") {
          this.deleteSpinnerArray.push(i);
          let emailId = email.id
          this.orderService.deleteEmail(email.id).pipe(untilDestroyed(this), finalize(()=>this.deleteSpinnerArray = this.deleteSpinnerArray.filter(r=>r != i ))).subscribe(
            result=>this.toast.success("Correo eliminado de forma exitosa!"));
            this.emails$ = this.orderService.getEmailAccounts();
            this.getEmails();
        }
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
