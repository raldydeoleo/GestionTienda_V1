import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {faQrcode} from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import { KEY_CODE } from './key-code';

@Component({
  selector: 'code-scanner',
  templateUrl: './code-scanner.component.html',
  styleUrls: ['./code-scanner.component.css']
})
export class CodeScannerComponent implements OnInit, OnDestroy {
  faQrcode = faQrcode;
  private code: string = "";
  private timer;
  //private conteo: number = 0;
  private ms: number = 100;

  //@Input() minLenght: number = 4;
  //@Input() maxLength: number = 5;
  @Input() loading: boolean = false;
  //@Input() errorMessage: string = '';

  @Output() scan = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
    this.ms = environment.production ? 100 : 1000;
  }
  ngOnDestroy(){
    if (this.timer) clearInterval(this.timer);
  }
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.loading) return;

    let _len: number = this.code.trim().length;
    let isSend: boolean = (event.keyCode === KEY_CODE.Enter || event.keyCode == KEY_CODE.Tab || event.code == 'Enter');
    if (isSend && _len ) { //>= this.minLenght
      this.scan.emit(this.code);
      this.code = "";
    }
    else{
      this.code += `${event.key}`;
    }

    if (this.timer != null) clearInterval(this.timer);

    if (this.code.trim() != "'") {
      this.timer = setInterval(() => {
        this.code = "";
      }, this.ms);
    }
  }

  get label() {
    let result: string;
    if (!this.loading) result = "Lector de códigos";
    else result = "Procesando...";
    return result;
  }

  simulateScanner() {
    const s = '07465603170599fI/1SkLAAAAdGVz';
    for (let i = 0; i < s.length; i++) {
      const e = new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: s[i], shiftKey: false });
      setTimeout(() => document.dispatchEvent(e));
    }
    const xe = new KeyboardEvent('keyup', { bubbles: true, cancelable: true, code: 'Enter' });
    setTimeout(() => document.dispatchEvent(xe));
  }

}
