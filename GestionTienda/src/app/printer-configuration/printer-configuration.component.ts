import { Component, DoCheck, OnInit } from '@angular/core';
import { PrinterService } from './printer.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-printer-configuration',
  templateUrl: './printer-configuration.component.html',
  styleUrls: ['./printer-configuration.component.css']
})
export class PrinterConfigurationComponent implements OnInit, DoCheck {
  public printers: any[];
  constructor(private printerService: PrinterService, private toast: ToastrService) { }

  ngOnInit() {
    this.printerService.getPrinters().toPromise().then(
      printers => {
        this.printers = printers;
      }
    );
  }

  ngDoCheck(){
    if(this.printers && this.printers.length > 0){
      this.setPrintersFromStorage();
      this.setLabelsDimensions();
    }

  }
  

  printerBoxChange() {
    let printerSelect = <HTMLSelectElement>document.getElementById('printerBox');
    if (printerSelect.value) {
      localStorage.setItem("printer_box", printerSelect.value);
      this.toast.success("Impresora seleccionada!")
    } else {
      localStorage.removeItem("printer_box");
      this.toast.warning("Debe seleccionar una impresora!")
    }
  }
  printerCigarsChange(){
    let printerSelect = <HTMLSelectElement>document.getElementById('printerCigars');
    if (printerSelect.value) {
      localStorage.setItem("printer_cigars", printerSelect.value);
      this.toast.success("Impresora seleccionada!")
    } else {
      localStorage.removeItem("printer_cigars");
      this.toast.warning("Debe seleccionar una impresora!")
    }
  }

  setPrintersFromStorage(){
     let printerBox = localStorage.getItem("printer_box");
     let printerCigars = localStorage.getItem("printer_cigars");
     if(printerBox){
       let printerBoxSelect = <HTMLSelectElement>document.getElementById('printerBox');
       printerBoxSelect.value = printerBox; 
     }
     if(printerCigars){
      let printerCigarSelect = <HTMLSelectElement>document.getElementById('printerCigars');
      printerCigarSelect.value = printerCigars; 
     }
  }
  saveDimensions(){
    let boxWidth = parseInt((<HTMLInputElement>document.getElementById('boxWidth')).value) || 0; 
    let boxHeight = parseInt((<HTMLInputElement>document.getElementById('boxHeight')).value) || 0;
    let boxMarginT = parseInt((<HTMLInputElement>document.getElementById('boxMarginT')).value) || 0;
    let boxMarginB = parseInt((<HTMLInputElement>document.getElementById('boxMarginB')).value) || 0;
    let boxMarginL = parseInt((<HTMLInputElement>document.getElementById('boxMarginL')).value) || 0;
    let boxMarginR = parseInt((<HTMLInputElement>document.getElementById('boxMarginR')).value) || 0;
    let cigarWidth = parseInt((<HTMLInputElement>document.getElementById('cigarWidth')).value) || 0; 
    let cigarHeight = parseInt((<HTMLInputElement>document.getElementById('cigarHeight')).value) || 0;
    let cigarMarginT = parseInt((<HTMLInputElement>document.getElementById('cigarMarginT')).value) || 0;
    let cigarMarginB = parseInt((<HTMLInputElement>document.getElementById('cigarMarginB')).value) || 0;
    let cigarMarginL = parseInt((<HTMLInputElement>document.getElementById('cigarMarginL')).value) || 0;
    let cigarMarginR = parseInt((<HTMLInputElement>document.getElementById('cigarMarginR')).value) || 0;
    let boxDimensions = {
      "Width":boxWidth,
      "Height":boxHeight,
      "MarginT":boxMarginT,
      "MarginB":boxMarginB,
      "MarginL":boxMarginL,
      "MarginR":boxMarginR
    };
    let cigarDimensions = {
      "Width":cigarWidth,
      "Height":cigarHeight,
      "MarginT":cigarMarginT,
      "MarginB":cigarMarginB,
      "MarginL":cigarMarginL,
      "MarginR":cigarMarginR
    };
    localStorage.setItem("boxDimensions",JSON.stringify(boxDimensions));
    localStorage.setItem("cigarDimensions",JSON.stringify(cigarDimensions));
    this.toast.success("Dimensiones actualizadas");
  }
  setLabelsDimensions() {
    let boxDimensions = localStorage.getItem("boxDimensions");
    let cigarDimensions = localStorage.getItem("cigarDimensions");
    if(boxDimensions){
      let dimensions = JSON.parse(boxDimensions);
      (<HTMLInputElement>document.getElementById('boxWidth')).value = dimensions.Width;
      (<HTMLInputElement>document.getElementById('boxHeight')).value = dimensions.Height;
      (<HTMLInputElement>document.getElementById('boxMarginT')).value = dimensions.MarginT;
      (<HTMLInputElement>document.getElementById('boxMarginB')).value = dimensions.MarginB;
      (<HTMLInputElement>document.getElementById('boxMarginL')).value = dimensions.MarginL;
      (<HTMLInputElement>document.getElementById('boxMarginR')).value = dimensions.MarginR;
    }
    if(cigarDimensions){
      let dimensions = JSON.parse(cigarDimensions);
      (<HTMLInputElement>document.getElementById('cigarWidth')).value = dimensions.Width;
      (<HTMLInputElement>document.getElementById('cigarHeight')).value = dimensions.Height;
      (<HTMLInputElement>document.getElementById('cigarMarginT')).value = dimensions.MarginT;
      (<HTMLInputElement>document.getElementById('cigarMarginB')).value = dimensions.MarginB;
      (<HTMLInputElement>document.getElementById('cigarMarginL')).value = dimensions.MarginL;
      (<HTMLInputElement>document.getElementById('cigarMarginR')).value = dimensions.MarginR;
    }
  }

}
