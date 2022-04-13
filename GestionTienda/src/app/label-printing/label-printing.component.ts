import { Component, OnInit, Inject, EventEmitter, ChangeDetectorRef} from '@angular/core';
import { LabelService, IProducts, IPrintLabelRequest} from './label.service';
import { FormBuilder, FormControl, FormGroup, FormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { IProcess } from '../process/process';
import { IModule } from '../module/module';
import { ToastrService } from 'ngx-toastr';
import { GlobalService, IProduction } from '../services/global-service.service';
import { debounceTime, switchMap} from 'rxjs/operators';
import { Observable, of} from 'rxjs';
import { AccountService } from '../account/account.service';
import { ShiftService } from '../shift/shift.service';
import { ChangeShiftService } from '../change-shift/change-shift.service';
import * as $ from 'jquery';
import { Label } from './label';
import {NgSelectModule, NgOption} from '@ng-select/ng-select';
import { StorageService } from '../storage/storage.service';
import { IStorage } from '../storage/storage';
import { ModalService } from '../modals/modal/modal.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfigurationService } from '../configuration-app/configuration.service';
import { faPrint, faFilePdf, faImage } from '@fortawesome/free-solid-svg-icons';


export class PrintLabelRequest implements IPrintLabelRequest{
  idModulo: number;
  idProceso: number;
  idAlmacenamiento: string;
  idProducto: string;
  descripcionProducto: string;
  cantidadEtiquetas: number;
  cantidadCigarros: number;
  numeroModulo: string;
  almacenamiento: string;
  codigoEan: string;
  centro: string;
  pesoNeto: number;
  unidadPeso: string;
  usuario: string;
  idProduccion: number;
  cliente: object;
  esUsa: boolean;
  textoModulo: string;
  tipoEtiqueta: string;
  lleva_Logo_TextoInferior: boolean;
  dataMatrixOrderId: number;
  token: string;
  apiUrl:string;
  printerName:string;
  esReimpresion: boolean;
  fechaHoraReimpresion: Date;
  idEtiquetaReimpresa: number;
}


@UntilDestroy()
@Component({
      selector: 'app-label-printing',
      templateUrl: './label-printing.component.html',
      styleUrls: ['./label-printing.component.css']
    })
export class LabelPrintingComponent implements OnInit{

  faPrint = faPrint;
  faFilePdf = faFilePdf;
  faImage = faImage;
  formGroup: FormGroup;
  public module: string;
  public process: string;
  public processObj: IProcess;
  public moduleObj: IModule;
  public storages: IStorage[];
  public processes: IProcess[];
  public modules: IModule[];
  public optionModules: IModule[];
  public productScanned: IProducts;
  public selectedStorage: string;
  public selectedCountry: string;
  public productionObj: IProduction;
  dataMatrixReturnUrl = "";
  selectedClientId: string;
  customers = [];
  typeahead = new EventEmitter<string>();
  constructor(private fb: FormBuilder,private labelService: LabelService, private globalService: GlobalService, private storageService: StorageService, 
    private router: Router, private toast: ToastrService, @Inject('BASE_URL') private baseUrl: string, private configurationService: ConfigurationService,
    private accountService: AccountService, private shiftService: ShiftService, private changeShift: ChangeShiftService, private cd: ChangeDetectorRef, private modalService: ModalService) {  
      this.typeahead
      .pipe(
          debounceTime(200),
        switchMap(term => this.labelService.getCustomersByTerm(term)),
          untilDestroyed(this)
      )
      .subscribe(items => {
         console.log("items:");
         console.log(items);
          this.customers = items;
          this.cd.markForCheck();
      }, (err) => {
          console.log('error', err);
          this.customers = [];
          this.cd.markForCheck();
      });
    }
  
 
  ngOnInit() {
    //this.goToConfiguration();
    this.selectedStorage = "X";
    //this.selectedCountry = "DO";
    this.formGroup = this.fb.group({
      idProceso: '',
      idModulo: '',
      IdProducto: '',
      IdDescripcion: '',
      storage:'',
      quantity: '',
      printedQuantity: '',
      address: 'La Aurora,  S.A. Tamboril, Santiago, Rep. Dom.',
      customer: '',
      country: '',
      tipoEtiqueta: '',
      logoDirCheck: ''
    });
    this.formGroup.controls['tipoEtiqueta'].setValue('Box');
    this.formGroup.controls['country'].setValue(false);
    this.formGroup.controls['logoDirCheck'].setValue(true);
    this.formGroup.controls['IdProducto'].disable();
    this.formGroup.controls['IdDescripcion'].disable();
    //this.formGroup.controls['customer'].reset();
    this.moduleObj = this.labelService.getModule();
    this.processObj = this.labelService.getProcess();
    this.productionObj = this.globalService.getLocalProduction();
    this.dataMatrixReturnUrl = this.productionObj.dataMatrixOrderId ? "?orderId="+this.productionObj.dataMatrixOrderId.toString():"";
    this.productScanned = this.labelService.getLocalProduct();
    if(this.processObj){
      this.module = this.moduleObj['descripcion'];
      this.process = this.processObj['descripcion'];
    }
    this.storageService.getStorages().pipe(
      untilDestroyed(this)
    ).subscribe(storages => {
      this.storages = storages;
    });
    //this.verifyProductSchedule();
    this.verifyProductSchedule().pipe(
      untilDestroyed(this)
    ).subscribe(error=>this.manageError(error));
    this.labelService.isShiftClosed.pipe(
      untilDestroyed(this)
    ).subscribe(v=>{
      if(v==true){
        this.formGroup.controls['IdProducto'].setValue("");
        this.formGroup.controls['IdDescripcion'].setValue("");
        $("#IdProducto").focus();
        this.labelService.isShiftClosed.next(false);
      }
    });
    this.checkForConfiguration();
    this.showPrintedQuantity();
    
  }

  /* loadCustomers(){
    this.labelService.getCustomers().subscribe(customers=>this.customers = customers);
  } */
  
  checkForConfiguration(){
    if (this.productionObj) {
      this.globalService.checkForOpenShiftEvent();
    }
    /* else{
      let closeDate = this.globalService.getCloseShiftDate(this.productionObj);
      let now = new Date();
      if(now < closeDate){
        this.loadCustomers();
      }
    } */
  }

  //goToConfiguration(){
  //   this.router.navigate(['device'], { queryParams: { returnUrl: this.router.url }});
  //}

  //onKeyUpEnter(event){
  //  let productInput =  this.formGroup.controls['IdProducto'];
  //  //let descriptionInput = this.formGroup.controls['IdDescripcion'];
  //  if(productInput.value.length >= 9 && productInput.value.length <= 13){
  //    this.labelService.getProduct(productInput.value).subscribe(product=>this.productScanned = product,error=>this.manageError(error),()=>this.productRegistration());
  //  }
  //}
  showScannedProduct(){
    let descriptionInput = this.formGroup.controls['IdDescripcion'];
    let codeInput = this.formGroup.controls['IdProducto'];
    if(this.productScanned.codigoMaterial){
      descriptionInput.setValue(this.productScanned.descripcion);
      codeInput.setValue(this.productScanned.codigoMaterial);
      localStorage.setItem("product",JSON.stringify(this.productScanned));
    }
  }
  manageError(error){
    if(error.status ==  400){
      if(error.error[""] == "Código de producto incorrecto"){
        let codeInput = this.formGroup.controls['IdProducto'];
        codeInput.setValue("");
      }
    }
  }

  imprimir() {
    let directPrintingChecked = (<HTMLInputElement>document.getElementById('directPrinting')).checked;
    let labelType = this.formGroup.controls['tipoEtiqueta'].value;
    if(labelType == "Individual" && !this.productScanned.codigoEanCigarro){
      this.toast.error("Producto registrado sin código de barras para cigarro individual");
      return;
    }
    if(directPrintingChecked){
      let labelDimensions = labelType != "Box" ?localStorage.getItem("cigarDimensions"):localStorage.getItem("boxDimensions");
      if(labelDimensions === null){
        this.toast.error("Dimensiones del label no configuradas");
        return;
      }
      let printerName=null;
      if(labelType=="Box"){
        printerName = localStorage.getItem("printer_box");
      }else{
        
        printerName = localStorage.getItem("printer_cigars");
      }
      if(printerName==null){
        this.toast.error("Impresora no configurada para el tipo de etiqueta seleccionada");
        return;
      }
      this.globalService.verifyPrinterService().toPromise().then(printerServiceOk=>{
        if(printerServiceOk){
          this.generateLabels(directPrintingChecked);
        }
      });
    }else{
      this.generateLabels();
    } 
  }

  generateLabels(directPrintingChecked?:boolean){
    if(this.formGroup.valid){
      this.configurationService.isModuleConfirmationActive().then(
        result => {
          if (result) {
            let data = {
              title: 'Confirmación de módulo (' +this.labelService.getProcess().descripcion+ ')',
            }
            this.modalService.open(data,undefined,true).pipe(
              untilDestroyed(this)
            ).subscribe(result => {
              if (result == "confirmError") {
                this.toast.error("Módulo incorrecto, favor de cambiar el módulo a el que desea trabajar");
              } else if (result == "cancel") {
                return;
              } else {
                this.printRequest(directPrintingChecked);
              }
            });
          } else {
            this.printRequest(directPrintingChecked);
          }
        }
      );
    }else{
      this.validateAllFormFields(this.formGroup);
    }
  }

  printRequest(directPrintingChecked?:boolean) {
    let labelQuantity = this.formGroup.controls['quantity'].value;
    if (labelQuantity > 0) {
      let printLabelRequest: PrintLabelRequest;
      printLabelRequest = new PrintLabelRequest();
      let idstorage = this.formGroup.controls['storage'].value;
      let module: IModule = this.labelService.getModule();
      let labelType = this.formGroup.controls['tipoEtiqueta'].value;
      printLabelRequest.cantidadEtiquetas = this.formGroup.controls['quantity'].value;
      printLabelRequest.descripcionProducto = this.productScanned.descripcion;//this.formGroup.controls['IdDescripcion'].value;
      printLabelRequest.idAlmacenamiento = idstorage;
      printLabelRequest.idModulo = module.id;
      printLabelRequest.idProceso = this.labelService.getProcess().id;
      printLabelRequest.idProducto = this.productScanned.codigoMaterial;
      printLabelRequest.cantidadCigarros = this.productScanned.cigarrosPorCaja;
      printLabelRequest.numeroModulo = module.numeroModulo;
      printLabelRequest.textoModulo = module.textoModulo;
      printLabelRequest.almacenamiento = this.storages.find(s => s.codigo == idstorage).descripcion;
      printLabelRequest.codigoEan = labelType=="Box" ? this.productScanned.codigoEan: this.productScanned.codigoEanCigarro;
      printLabelRequest.centro = this.productScanned.centro;
      printLabelRequest.pesoNeto = this.productScanned.pesoNeto;
      printLabelRequest.unidadPeso = this.productScanned.unidadPeso;
      printLabelRequest.usuario = this.accountService.getLoggedInUserFromToken();
      printLabelRequest.idProduccion = this.productionObj.id;
      /* let idcliente = this.formGroup.controls['customer'].value;
      printLabelRequest.cliente = this.customers.find(c=>c.idCliente == idcliente); */
      printLabelRequest.esUsa = this.formGroup.controls['country'].value;
      printLabelRequest.tipoEtiqueta = this.formGroup.controls['tipoEtiqueta'].value;
      printLabelRequest.lleva_Logo_TextoInferior = this.formGroup.controls['logoDirCheck'].value;
      printLabelRequest.dataMatrixOrderId = this.productionObj.dataMatrixOrderId;
      this.formGroup.controls['quantity'].setValue("");
      let url = this.baseUrl + "api/Label/printlabels";
      this.globalService.getBlob(url, printLabelRequest, directPrintingChecked,labelType!="Box",printLabelRequest)
        .pipe(untilDestroyed(this))
        .subscribe((res: any) => {
          // let printerName ="";
          // if(directPrintingChecked){
          //   if(labelType=="Box"){
          //     printerName = localStorage.getItem("printer_box");
          //   }else{
          //     printerName = localStorage.getItem("printer_cigars");
          //   }
          // }
         // this.globalService.getFileBlob(res, directPrintingChecked, printerName,labelType!="Box"); 
          if(!directPrintingChecked){
            this.globalService.getFileBlob(res,false);
          }
          this.showPrintedQuantity();
        }, error => {
          if (error.status == 409) {//se hizo un cambio de producto desde otra estación
            //refrescar producto en objeto producción
            let module = this.labelService.getModule();
            let process = this.labelService.getProcess();
            this.globalService.openShift(process.id, module.id, this.accountService.getLoggedInUser()).pipe(
              untilDestroyed(this)
            ).subscribe(response => {
              localStorage.setItem("production", JSON.stringify(response.body));
              this.productionObj = response.body;
              if (!sessionStorage.getItem("closetimer")) {
                this.globalService.checkForShiftChangeEvent();
              }
              this.verifyProductSchedule().pipe(
                untilDestroyed(this)
              ).subscribe(product => {
                let data = {
                  title: 'Cambio de producto',
                  message: 'Hubo un cambio de producto en el módulo, ¿Desea imprimir las etiquetas con el nuevo producto (' + product.descripcion + ') ?',
                  btnText: 'Sí',
                  btnCancelText: 'No',
                  hasCancelOption: 'Si'
                }
                this.modalService.open(data).pipe(
                  untilDestroyed(this)
                ).subscribe(result => {
                  if (result == "ok click") {
                    this.formGroup.controls['quantity'].setValue(printLabelRequest.cantidadEtiquetas);
                    this.imprimir();
                  }
                });
              },
                error => this.manageError(error)
              );
            });
          } else if (error.status == 400) {
            (new Response(error.error)).text().then(errorText => {
              let errorObject = JSON.parse(errorText);
              if (errorObject.Finalizado) {
                this.toast.error(errorObject.Finalizado[0]);
                this.router.navigate(['device']);
              } else {
                errorText = errorText.replace(/[\])}[{(":]/g, '');
                this.toast.error(errorText);
              }

            });

          }else if(error.status == 452){
            this.handle452Error();
          }else if(error.status == 453){
            (new Response(error.error)).text().then(errorValue => {
              this.toast.error("Cantidad de códigos disponibles: "+errorValue,"Códigos insuficientes");
            });   
          }
        });
    }
    else {
      this.toast.error("La cantidad de etiquetas debe ser mayor a cero");
      $("#quantity").focus();
    } 
  }
handle452Error(){
  let data = {
    title: 'Cambio de módulo',
    message: 'Se ha cambiado el módulo desde otra pestaña, la ventana se actualizará con la información actual',
    btnText: 'Ok'
  }
  this.modalService.open(data).pipe(
    untilDestroyed(this)
  ).subscribe(result => {
    if (result == "ok click") {
      window.location.reload();
    }
  });
}

verifyProductSchedule():Observable<IProducts> {
  if (this.productionObj) {
    //this.labelService.getProduct(this.productionObj.idProducto).subscribe(product => {
    //  this.productScanned = product;
    //  this.showScannedProduct();
    //}, error => this.manageError(error));
    return this.labelService.getProduct(this.productionObj.idProducto).pipe(
      switchMap((product) => {
        this.productScanned = product;
        this.showScannedProduct();
        return of(product);
      })
    );
  }
  
}

checkForShiftCloseEvent(){
  if(this.productionObj){  
    let prodDate = new Date(this.productionObj.fechaProduccion);
    let closeHour = this.productionObj.shift.horaFin;
    let closeHourArray = closeHour.split(":");
    let closeDate = new Date(prodDate.getFullYear(),prodDate.getMonth(),prodDate.getDate(),parseInt(closeHourArray[0]),parseInt(closeHourArray[1]),parseInt(closeHourArray[2],0));
    //let closeDate = new Date(prodDate.getFullYear(),prodDate.getMonth(),prodDate.getDate(),15,43,30,0);
    this.changeShift.setChangeShiftTime(closeDate);
  }
}

showPrintedQuantity(){
   if(this.productionObj){
     this.globalService.refreshProductionObj(this.productionObj.id).pipe(
       untilDestroyed(this)
     ).subscribe(production => {
        this.productionObj = production; 
        localStorage.setItem("production",JSON.stringify(production))
      },null,
      ()=>{
        this.updatePrintedQuantity();
      });
   }else{
    this.formGroup.controls['printedQuantity'].setValue('0');
   } 
}

updatePrintedQuantity(){
  let labels:Label[];
  if(this.productionObj.labels){
    labels = this.productionObj.labels;
    if(labels.length > 0){
      let lastLabel = labels[labels.length-1];
      this.formGroup.controls['printedQuantity'].setValue(lastLabel.secuenciaInicial + lastLabel.cantidadImpresa - 1);
    }else{
      this.formGroup.controls['printedQuantity'].setValue('0');
    }
  }else{
    this.formGroup.controls['printedQuantity'].setValue('0');
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

return(){
  this.router.navigateByUrl('/device'); //+this.dataMatrixReturnUrl
}

tipoEtiquetaChange(){
  let tipoEtiquetaSelect = (<HTMLSelectElement>document.getElementById('tipoEtiqueta'));
  let tipoEtiqueta = tipoEtiquetaSelect.value;
  if (tipoEtiqueta == "Individual" && this.productionObj.dataMatrixOrderId != 0) {
    this.toast.warning("Los códigos data matrix se incluyen en las etiquetas Box","Tipo de etiqueta incorrecto");
    this.formGroup.controls['tipoEtiqueta'].setValue("Box");
  }
}

  //productRegistration(){
//  let previousProduct;
//  if(this.productionObj.idProducto){
//    previousProduct = this.productionObj.idProducto;
//  }
//  this.productionObj.idProducto = this.productScanned.codigoMaterial;
//  this.globalService.productRegistration(this.productionObj,previousProduct)
//  .subscribe(production => {
//    localStorage.setItem("production",JSON.stringify(production)); 
//    this.productionObj = production;
//  },
//  error=>{
//    let codeInput = this.formGroup.controls['IdProducto'];
//    codeInput.setValue("");
//    this.verifyProductSchedule();
//  },
//  ()=>{
//    this.toast.success("Lectura de producto "+this.productionObj.idProducto+" correcta!");
//    this.showScannedProduct();
//    this.checkForShiftCloseEvent();
//    this.updatePrintedQuantity();
//  });
//}



  /* getDayOfYear(){
    let now = new Date();
    let start = new Date(now.getFullYear(), 0, 0);
    let diff = (now.valueOf() - start.valueOf()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    let oneDay = 1000 * 60 * 60 * 24;
    let day = Math.floor(diff / oneDay);
    return day;
  } */

  

}
