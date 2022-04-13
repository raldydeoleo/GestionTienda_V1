import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, from} from 'rxjs';
import { CodesManagementComponent } from './codesManagement/codesManagement.component';
import {OrderCreateComponent} from './orderCreate/orderCreate.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private modalService: NgbModal) { }
  
  open(component:string, data?, options?:NgbModalOptions): Observable<any> {
    let modalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };
    for (var prop in options) {
        modalOptions[prop] = options[prop]; 
    }
    let modalRef: NgbModalRef;
    if (component === Components.OrderCreation){
        modalRef = this.modalService.open(OrderCreateComponent, modalOptions);
    }else if(component == Components.CodesManagement){
        modalRef = this.modalService.open(CodesManagementComponent, modalOptions);
    } 
    modalRef.componentInstance.fromParent = data;
    return from(
        modalRef.result.then((result) => {
          return result;
        }, (reason) => {
          return reason;
        })
    );
    
  }
}

enum Components{ 
  OrderCreation = "OrderCreation",
  CodesManagement = "CodesManagement"
}
