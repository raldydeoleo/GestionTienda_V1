import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { AccountService } from 'src/app/account/account.service';
import { ModalService as AppModalService} from '../../../app/modals/modal/modal.service';
import { IOrderDefault } from '../orders/interfaces/orderdefault';
import { OrderService } from '../orders/order.service';

@UntilDestroy()
@Component({
  selector: 'app-orders-config',
  templateUrl: './orders-config.component.html',
  styleUrls: ['./orders-config.component.css']
})
export class OrdersConfigComponent implements OnInit {
  formGroup: FormGroup;
  isSaving = false;
  constructor(private fb:FormBuilder, private orderService: OrderService, private appModalService: AppModalService, private accountService: AccountService, private toast: ToastrService) { }

  ngOnInit() {
    
    this.formGroup = this.fb.group({
      id:'',
      omsId:'',
      omsUrl:'',
      token:'',
      connectionId:'',
      contactPerson:'',
      createMethodType:'',
      factoryAddress:'',
      factoryCountry:'',
      factoryId:'',
      factoryName:'',
      productionLineId:'',
      releaseMethodType:'',
    });
    this.accountService.showSubMenu("dataMatrixMenu");
    this.orderService.getOrderDefaults().pipe(untilDestroyed(this)).subscribe(
      orderSettings=>{
        this.loadFormData(orderSettings);
      }
    );

  }

  loadFormData(orderSettings: IOrderDefault){
    this.formGroup.patchValue({
      id:orderSettings.id,
      omsId:orderSettings.omsId,
      omsUrl:orderSettings.omsUrl,
      token:orderSettings.token,
      connectionId:orderSettings.connectionId,
      contactPerson:orderSettings.contactPerson,
      createMethodType:orderSettings.createMethodType,
      factoryAddress:orderSettings.factoryAddress,
      factoryCountry:orderSettings.factoryCountry,
      factoryId:orderSettings.factoryId,
      factoryName:orderSettings.factoryName,
      productionLineId:orderSettings.productionLineId,
      releaseMethodType:orderSettings.releaseMethodType
    });
  }

  save(){
    if(this.formGroup.valid){
      let data = {
        title: 'Confirmación de actualización',
        message: '¿Está seguro que desea actualizar la información para la creación de órdenes?',
        btnText: 'Sí',
        btnCancelText: 'No',
        hasCancelOption: 'Si',
        okBtnClass: 'btn-danger'
      }
      
      this.appModalService.open(data).pipe(
        untilDestroyed(this)).subscribe(
        result=>{
          if (result == "ok click") {
            this.isSaving = true;
            let orderDefaults: IOrderDefault = Object.assign({}, this.formGroup.value);
            this.orderService.updateOrderDefaults(orderDefaults).pipe(untilDestroyed(this), finalize(()=>this.isSaving = false)).subscribe(
              result=>this.toast.success("Información actualizada de forma exitosa!"));
          }
        });
    }
    else{
      this.toast.warning("Favor de corregir errores en los campos indicados");
      this.validateAllFormFields(this.formGroup);
    }
    
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
