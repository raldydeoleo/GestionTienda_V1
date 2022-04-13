import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './modal.component';
import { Observable, from} from 'rxjs';
import { ModuleConfirmationComponent } from '../module-confirmation/module-confirmation.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private modalService: NgbModal) { }
  
  open(data, options?:NgbModalOptions, moduleConfirmation?:boolean): Observable<any> {
    let modalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };
    for (var prop in options) {
        modalOptions[prop] = options[prop]; 
    }
    
    let modalRef: NgbModalRef
    

    if (moduleConfirmation == true) {
        modalRef = this.modalService.open(ModuleConfirmationComponent, modalOptions);
    } else {
      modalRef = this.modalService.open(ModalComponent, modalOptions);
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
