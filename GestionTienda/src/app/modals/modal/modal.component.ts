import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountService } from 'src/app/account/account.service';
import { ISchedule } from '../../schedule/schedule';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  title: string;
  message: string;
  btnOkText: string;
  btnCancelText: string = "Cancelar";
  hasCancelOption: boolean;
  okBtnClass: string = 'btn-primary';
  conflictItems: ISchedule[];
  @Input() fromParent;
  constructor( public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    let data = this.fromParent;
    this.title = data.title;
    this.message = data.message;
    this.btnOkText = data.btnText;
    if (data.hasCancelOption) {
      this.hasCancelOption = true;
    }
    if (data.conflicData) {
      this.conflictItems = data.conflicData;
    }
    if(data.okBtnClass){
      this.okBtnClass = data.okBtnClass;
    }
    if(data.btnCancelText){
      this.btnCancelText = data.btnCancelText;
    }
    
  }
  
  ok(result){
    this.activeModal.close(result);
  }

  cancel() {
    this.activeModal.close("");
  }


}
