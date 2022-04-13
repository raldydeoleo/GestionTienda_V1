import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from 'src/app/account/account.service';
import { OrderService } from '../orders/order.service';


@Component({
  selector: 'app-code-validation',
  templateUrl: './code-validation.component.html',
  styleUrls: ['./code-validation.component.css']
})
export class CodeValidationComponent implements OnInit {
  constructor(private orderService:OrderService, private toast: ToastrService, private accountService: AccountService) { }
  loading = false;
  ngOnInit() {
    this.accountService.showSubMenu("dataMatrixMenu");
  }
  codeScan(codeValue){
     this.loading = true;
     this.orderService.confirmCode(codeValue).then(
       result =>{
         if(result.responseType == "200"){
           this.toast.success("Código confirmado: "+result.response,"Confirmación de código");
         }else{
           this.toast.warning(result.response,"Confirmación de código");
         }
       }
     ).catch(error=>console.log(error))
     .finally(()=>this.loading = false);
  }
}
