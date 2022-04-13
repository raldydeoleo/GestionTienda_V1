import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { LabelService } from '../label.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-qrcancellabels',
  templateUrl: './qrcancellabels.component.html',
  styleUrls: ['./qrcancellabels.component.css']
})
export class QrcancellabelsComponent implements OnInit {
  formGroup: FormGroup;
  constructor(private fb: FormBuilder, private labelService: LabelService) { }

  ngOnInit() {
    $("#qrCode").focus();
    this.formGroup = this.fb.group({
      qrCode: ''
    });
  }

  onKeyUpEnter(event){
    let qrInput =  this.formGroup.controls['qrCode'];
    if(qrInput.value.length === 54){
      this.labelService.cancelLabelByQr(qrInput.value);
      qrInput.setValue("");
    }

  }

}
