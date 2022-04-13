import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-codesManagement',
  templateUrl: './codesManagement.component.html',
  styleUrls: ['./codesManagement.component.css']
})
export class CodesManagementComponent implements OnInit {
  codes = [];
  @Input() fromParent;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
    let data = this.fromParent;
    this.codes = data.codes;
  }

  close() {
    this.activeModal.close("");
  }

}
