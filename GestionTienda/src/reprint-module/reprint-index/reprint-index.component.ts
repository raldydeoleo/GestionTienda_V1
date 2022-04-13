import { Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateAdapter, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { IProducts, LabelService } from 'src/app/label-printing/label.service';
import { CustomAdapter, CustomDateParserFormatter, invalidDateValidator } from 'src/app/services/custom-date.helpers';
import { faCalendar, faPrint } from '@fortawesome/free-solid-svg-icons';
import { ILabelReprint } from '../interfaces/label-reprint';
import { Observable } from 'rxjs';
import { LabelReprintService, SortDirective, SortEvent } from '../services/label-reprint.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ScheduleService } from 'src/app/schedule/schedule.service';
import { AccountService } from 'src/app/account/account.service';
import { ShiftService } from 'src/app/shift/shift.service';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from 'src/app/services/global-service.service';
import { PrintLabelRequest } from 'src/app/label-printing/label-printing.component';
import { IModule } from 'src/app/module/module';


@Component({
  selector: 'app-reprint-index',
  templateUrl: './reprint-index.component.html',
  styleUrls: ['./reprint-index.component.css'],
  providers: [
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})
@UntilDestroy()
export class ReprintIndexComponent implements OnInit, OnDestroy {
  modules = [];
  processes = [];
  optionModules = [];
  shifts = [];
  products  = [];
  productsLoading: boolean;
  isLoadingLabels: boolean;
  labels: ILabelReprint[];
  labels$: Observable<ILabelReprint[]>;
  total$: Observable<number>;
  formGroup: FormGroup;
  faCalendar = faCalendar;
  faPrint = faPrint;
  @ViewChildren(SortDirective) headers: QueryList<SortDirective>;
  constructor(private fb: FormBuilder,private ngbCalendar: NgbCalendar, private dateAdapter: NgbDateAdapter<string>, public labelReprintService: LabelReprintService, private scheduleService: ScheduleService, private accountService: AccountService, private shiftService: ShiftService, private toast: ToastrService, private globalService:GlobalService, private labelService: LabelService, @Inject('BASE_URL') private baseUrl: string) { 
    this.labelReprintService._search$.next();
    this.labels$ = this.labelReprintService.labels$;
    this.total$ = this.labelReprintService.total$;
  }
  
  ngOnInit() {
    this.formGroup = this.fb.group({
      idProceso:'',
      idModulo:'',
      idTurno:'',
      idProducto:'',
      fechaProduccion:[this.dateAdapter.toModel(this.ngbCalendar.getToday()),[Validators.required, invalidDateValidator]]
    });
    this.isLoadingLabels = true;
    this.labelReprintService.labels$.pipe(untilDestroyed(this)).subscribe(labels =>{ 
      this.isLoadingLabels = false;
      this.labels = labels;
      console.log(this.labels);
    });
    
    this.processChangeSubscription();
    this.scheduleService.getProcesses().toPromise().then(processes => {
        this.processes = processes;
        this.scheduleService.getModules().toPromise().then(modules => {
          this.modules = modules;
          this.formGroup.controls['idProducto'].reset();
          this.shiftService.getShifts().toPromise().then(shifts=>{
            this.shifts = shifts;
            this.shiftService.getCurrentShift().toPromise().then(shift => {
              this.formGroup.controls['idTurno'].setValue(shift.id);
              this.populateProductsControl().then(products => {
                this.products = products;
                //this.formGroup.controls['idProducto'].setValue(products[0].codigoMaterial);
                this.setProductsFullDescription();
                this.productsLoading = false;
              });
          });
        });
      });
    });
    
  }


  reprint(labelRecordIndex,labelRecord){
     let labelRecordInput = <HTMLInputElement> document.getElementById(labelRecordIndex);
     if(!(labelRecordInput.value == '') && parseInt(labelRecordInput.value) > 0){
         this.imprimir(labelRecord,labelRecordInput);
     }else{
        this.toast.warning("Se debe especificar una cantidad mayor a cero");
        labelRecordInput.focus();
     }
  }
  imprimir(labelRecord:ILabelReprint,labelRecordInput: HTMLInputElement) {
    let labelType = labelRecord.labelConfig.tipoEtiqueta == "BOX" ? "Box": "Individual";
    console.log(labelRecord);
    let product = this.products.find(p => p.codigoMaterial == labelRecord.codigoSap); 
    console.log("product",product); 
    if(labelType == "Individual" && !product.codigoEanCigarro){
      this.toast.error("Producto registrado sin código de barras para cigarro individual");
      return;
    }
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
        this.printRequest(labelRecord,labelRecordInput, labelType, product);
      }
    });
    
  }

  printRequest(labelRecord:ILabelReprint,labelRecordInput:HTMLInputElement, labelType: string, product) {
      let printLabelRequest: PrintLabelRequest;
      printLabelRequest = new PrintLabelRequest();
      let module: IModule = this.modules.filter(m => m.id == labelRecord.idModulo)[0];
      printLabelRequest.cantidadEtiquetas = parseInt(labelRecordInput.value);
      printLabelRequest.descripcionProducto = labelRecord.descripcionProducto;
      printLabelRequest.idAlmacenamiento = labelRecord.almacenamiento;
      printLabelRequest.idModulo = module.id;  //todo: enviar fecha y hora de la etiqueta anterior, y asignarla en el api si es reimpresion, probar reimpresion con impresora
      //printLabelRequest.idProceso = this.labelService.getProcess().id;
      printLabelRequest.idProducto = labelRecord.codigoSap;
      printLabelRequest.cantidadCigarros = labelRecord.cantidadCigarros;
      printLabelRequest.numeroModulo = module.numeroModulo;
      printLabelRequest.textoModulo = module.textoModulo;
      printLabelRequest.codigoEan = labelType=="Box" ? product.codigoEan: product.codigoEanCigarro;
      printLabelRequest.centro = product.centro;
      printLabelRequest.pesoNeto = product.pesoNeto;
      printLabelRequest.unidadPeso = product.unidadPeso;
      printLabelRequest.usuario = this.accountService.getLoggedInUserFromToken();
      printLabelRequest.idProduccion = labelRecord.produccionId;
      printLabelRequest.tipoEtiqueta = labelType;
      printLabelRequest.esReimpresion = true;
      printLabelRequest.idEtiquetaReimpresa = labelRecord.id;
      printLabelRequest.fechaHoraReimpresion = labelRecord.fechaHoraCalendario;
      printLabelRequest.lleva_Logo_TextoInferior = labelRecord.labelConfig.llevaLogo || labelRecord.labelConfig.llevaTextoInferior;
      labelRecordInput.value = "";
      let url = this.baseUrl + "api/Label/printlabels";
      this.globalService.getBlob(url, printLabelRequest, true,labelType!="Box",printLabelRequest)
        .pipe(untilDestroyed(this))
        .subscribe(()=>this.labelReprintService._search$.next(),error => {
           if (error.status == 400) {
            (new Response(error.error)).text().then(errorText => {
                errorText = errorText.replace(/[\])}[{(":]/g, '');
                this.toast.error(errorText);
            });
          }
        });
  }

  checkForProcess() {
    let processSelect = this.formGroup.controls['idProceso'];
    let allowedAreasPermissions = this.accountService.getAllowedAreas();
    let filteredProcesses = [];
    allowedAreasPermissions.forEach(c => {
      let filteredProcess = this.processes.find(p => p.codigoPermiso == c);
      if (filteredProcess) {
        filteredProcesses.push(filteredProcess);
      }
    });
    this.processes = filteredProcesses;
    if (this.processes.length == 1) {
      processSelect.setValue(this.processes[0].id.toString());
      processSelect.disable();
    }
  }

  populateProductsControl():Promise<any> {
    this.productsLoading = true;
    let products_promise = this.scheduleService.getProducts().toPromise();
    return products_promise;
  }

  setProductsFullDescription() {
    this.products.map(product => {
      product.fullDescripcion = product.descripcion + " (" + product.codigoMaterial+")";
    });
  }

  processChangeSubscription(){
     this.formGroup.controls['idProceso'].valueChanges.pipe(untilDestroyed(this)).subscribe(
       process=>{
        let idproceso = process;
        if (this.modules) {
           this.populateModules(parseInt(idproceso));
           this.formGroup.controls['idModulo'].setValue('');
        }
        //this.filterByModule(true);
       }
     );
  }

  populateModules(idProceso: number): void {
    this.optionModules = this.modules.filter(function (module) {
      return module.idProceso == idProceso
    });
    // if( this.optionModules.length > 0){
    //     this.formGroup.controls['idModulo'].setValue(this.optionModules[0].id);
    // }
  }
  customSearchFn(term: string, item: IProducts) {
    term = term.toLowerCase();
    return item.descripcion.toLowerCase().indexOf(term) > -1 || item.codigoMaterial.toLowerCase() === term;
  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.labelReprintService.sortColumn = column;
    this.labelReprintService.sortDirection = direction;
  }
  ngOnDestroy(){
    this.formGroup.controls["fechaProduccion"].reset();
    this.formGroup.controls["fechaProduccion"].setValue(this.dateAdapter.toModel(this.ngbCalendar.getToday()));
  }

}
