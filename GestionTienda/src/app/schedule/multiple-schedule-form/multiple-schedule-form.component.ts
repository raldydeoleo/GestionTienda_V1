import { Component, OnInit} from '@angular/core';
import * as XLSX from 'xlsx';
import {faUpload, faArrowLeft, faPlus} from '@fortawesome/free-solid-svg-icons';
import { ISchedule } from '../schedule';
import { AccountService } from 'src/app/account/account.service';
import { ScheduleService } from '../schedule.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ModalService } from '../../modals/modal/modal.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { IProcess } from '../../process/process';
import { IModule } from '../../module/module';
import { IShift } from '../../shift/shift';
import { ShiftService } from '../../shift/shift.service';
import { IProducts } from '../../label-printing/label.service';
import { DatePipe } from '@angular/common';

type AOA = any[][];

@Component({
  selector: 'app-multiple-schedule-form',
  templateUrl: './multiple-schedule-form.component.html',
  styleUrls: ['./multiple-schedule-form.component.css']
})
export class MultipleScheduleFormComponent implements OnInit {
  faUpload = faUpload;
  faArrowLeft = faArrowLeft;
  faPlus = faPlus;
  schedules: ISchedule[] = [];
  controls: FormArray;
  processes: IProcess[];
  modules: IModule[];
  optionModules: IModule[];
  shifts: IShift[];
  currentShift: IShift;
  productionDate: Date;
  products = [];
  canShowForm = false;
  selectedProduct = null;
  constructor(private accountService: AccountService, private fb: FormBuilder, private scheduleService: ScheduleService, private toast: ToastrService, private router: Router, private modalService: ModalService, private shiftService: ShiftService) { }

  ngOnInit() {
    this.productionDate = new Date();
    this.scheduleService.getProcesses().toPromise().then(processes => {
      this.processes = processes;
      this.scheduleService.getModules().toPromise().then(modules => {
        this.modules = modules;
        this.optionModules = modules;
        this.shiftService.getShifts().toPromise().then(shifts => {
          this.shifts = shifts;
          this.shiftService.getCurrentShift().toPromise().then(shift => {
            this.currentShift = shift;
            this.scheduleService.getProducts().toPromise().then(products => {
              this.products = products;
              this.setProductsFullDescription();
            });
          });
        });
      });
    });
    

  }

  //processChange(event) {
  //  if (this.modules) {
  //    this.populateModules(event.target.value);
  //  }
  //}
  //populateModules(idProceso: number): void {
  //  this.optionModules = this.modules.filter(function (module) {
  //    return module.idProceso == idProceso  
  //  });
  //}
  
  onFileChange(evt: any) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true});

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /*Formatting date range*/
      let ws_range = XLSX.utils.decode_range(ws['!ref']);
      let colQuantity = (ws_range.e.c - ws_range.s.c) + 1; //To Check for correct sheet
      let refToCheck = XLSX.utils.encode_cell({r:ws_range.s.r, c:ws_range.e.c}); //To Check for correct sheet
      if(!this.isGoodSheet(colQuantity,refToCheck,ws)){//Check for good sheet
        (<HTMLInputElement>document.getElementById('excelfileinput')).value = "";
        this.toast.warning("El archivo que intenta subir tiene un formato desconocido");
        return;
      }
       
      /* save data */
      let data = <AOA>(XLSX.utils.sheet_to_json(ws, { header:1, raw:false }));
      data.shift();
      let userSchedule = this.accountService.getLoggedInUser();
      let self = this;
      this.schedules = data.map(function (x) {
        return { 
          fechaProduccion: x[0],
          idProceso: x[1],
          idModulo: x[2],
          idTurno: x[3],
          idProducto: x[4],
          usuarioProgramacion: userSchedule,
          process: self.processes.find(p=>p.id == x[1]), 
          module: self.modules.find(m => m.id == x[2]),
          shift: self.shifts.find(s => s.id == x[3]),
          product: self.products.find(p => p.codigoMaterial == x[4]),
          finalizado: false,
          usuarioFinalizado: null,
          fechaHoraFinalizado: null,
          id:0
        };
      });
      this.schedules = this.schedules.filter(s => !(s.fechaProduccion == undefined || s.idModulo == undefined || s.idModulo == 0 || s.idProceso == undefined || s.idProceso == 0 || s.idTurno == undefined || s.idTurno == 0 || s.idProducto == undefined || s.idProducto == ""));
      if (this.schedules.length > 0) {
        this.mapFormControls();
      }
    };
    
    reader.readAsBinaryString(target.files[0]);
    (<HTMLInputElement>document.getElementById('excelfileinput')).value = "";
  }
  
  isGoodSheet(cq:number,ref:string, ws:XLSX.WorkSheet):Boolean{
    if(cq == 5){
      if(ws[ref].v == "Producto"){
         return true;
      }else{
        return false;
      }
   }else{
     return false;
   }
  }

  upload() {
    this.scheduleService.insertOrUpdateSchedules(this.schedules).subscribe(response => {
      if (response.length == 0) {
        this.toast.success("Programación registrada exitosamente");
        this.router.navigate(["schedule"]);
      }
      else {
        let conflictResponse: ISchedule[] = Object.assign([], response);
        let self = this;
        conflictResponse.forEach(function (schedule) {
          schedule.process = self.processes.find(p => p.id == schedule.idProceso);
          schedule.module = self.modules.find(m => m.id == schedule.idModulo);
          schedule.shift = self.shifts.find(s => s.id == schedule.idTurno);
          schedule.product = self.products.find(p => p.codigoMaterial == schedule.idProducto);
        });
        let data = {
          title: 'Operación completada con errores',
          message: 'No se pudieron guardar los siguientes registros, debido a que los módulos especificados ya tienen productos programados:',
          btnText: 'Aceptar',
          conflicData: conflictResponse
        }
        let extendedOptions: NgbModalOptions = {
          size: 'lg',
          scrollable: true
        };
        this.modalService.open(data, extendedOptions).subscribe(result => {
          if (result == "ok click") {
            this.router.navigate(["schedule"]);
          }
        });
      }
      
    });
  }
  cleanTable(){
    this.schedules = [];
    (<HTMLInputElement>document.getElementById('excelfileinput')).value = "";
  }
  mapFormControls() {
    const toGroups = this.schedules.map(schedule => {
      return new FormGroup({
        fechaProduccion: new FormControl(schedule.fechaProduccion, Validators.required),
        idModulo: new FormControl(schedule.idModulo, Validators.required),
        idProceso: new FormControl(schedule.idProceso, Validators.required),
        idTurno: new FormControl(schedule.idTurno, Validators.required),
        idProducto: new FormControl(schedule.idProducto, Validators.required),
      });
    });
    this.controls = new FormArray(toGroups);
  }
  getControl(index: number, field: string): FormControl {
    //if (field === "idModulo") {
    //  let processControl = this.controls.at(index).get("idProceso") as FormControl;
    //  let idProceso = processControl.value;
    //  this.filterModules(idProceso);
    //}
    return this.controls.at(index).get(field) as FormControl;
  }
  updateField(index: number, field: string) {
    const control = this.getControl(index, field); 
    if (control.valid) {
      this.schedules = this.schedules.map((e, i) => {
        if (index === i) {
          return {
            ...e,
            [field]: control.value
          }
        }
        return e;
      });
      if (field === "idProceso") {
        this.updateObjectInSource(index,control,"process",this.processes,"id","idProceso");
      } else if (field === "idModulo") {
        this.updateObjectInSource(index, control, "module", this.modules, "id", "idModulo");
        this.optionModules = this.modules;
      } else if (field === "idTurno") {
        this.updateObjectInSource(index, control, "shift", this.shifts, "id","idTurno");
      } else if (field === "idProducto") {
        this.updateObjectInSource(index, control, "product", this.products, "codigoMaterial", "idProducto");
      }
    }
    if (field === "idModulo") {
      this.optionModules = this.modules;
    }
  }
  updateObjectInSource(index:number, control: FormControl, objectText: string, entitys:Object[], id:string, foreignId:string) {
    this.schedules = this.schedules.map((e, i) => {
      if (index === i) {
        return {
          ...e,
          [objectText]: entitys.find(v => v[id] == e[foreignId])
        }
      }
      return e;
    });
  }
  setProductsFullDescription() {
    this.products.map(product => {
      product.fullDescripcion = product.descripcion + " (" + product.codigoMaterial + ")";
    });
  }
  customSearchFn(term: string, item: IProducts) {
    term = term.toLowerCase();
    return item.descripcion.toLowerCase().indexOf(term) > -1 || item.codigoMaterial.toLowerCase() === term;
  }
  filterModules(idProceso: number): void {
    this.optionModules = this.modules;
    this.optionModules = this.modules.filter(function (module) {
      return module.idProceso == idProceso
    });
  }
  selectModuleOnClick(index: number) {
    let processControl = this.controls.at(index).get("idProceso") as FormControl;
    let idProceso = processControl.value;
    this.filterModules(idProceso);
  }
  delete(schedule: ISchedule) {
    const index: number = this.schedules.indexOf(schedule);
    if (index !== -1) {
      this.schedules.splice(index, 1);
    } 
  }
  addNewRow() {
    let dateInput = (<HTMLInputElement>document.getElementById('fechaProduccion'));
    let processSelect = (<HTMLSelectElement>document.getElementById('idProceso'));
    let moduleSelect = (<HTMLSelectElement>document.getElementById('idModulo'));
    let shiftSelect = (<HTMLSelectElement>document.getElementById('idTurno'));
    let productSelect = (<HTMLInputElement>document.getElementById('idProducto'));
    let userSchedule = this.accountService.getLoggedInUser();
    let productionDateText = new DatePipe('en-Us').transform(dateInput.value, 'MM/dd/yyyy');
    let productionDate = new Date(productionDateText);
    if (!this.validFields()) {
      return;
    }
    let newSchedule = {
      idProceso: parseInt(processSelect.value),
      idModulo: parseInt(moduleSelect.value),
      fechaProduccion: productionDate,
      idTurno: parseInt(shiftSelect.value),
      idProducto: this.selectedProduct,
      usuarioProgramacion: userSchedule,
      process: this.processes.find(p => p.id == parseInt(processSelect.value)), 
      module: this.modules.find(m => m.id == parseInt(moduleSelect.value)),
      shift: this.shifts.find(s => s.id == parseInt(shiftSelect.value)),
      product: this.products.find(p=>p.codigoMaterial == this.selectedProduct),
      finalizado: false,
      usuarioFinalizado: null,
      fechaHoraFinalizado: null,
      id: 0
    };
    this.schedules.push(newSchedule);
    this.mapFormControls();
    this.clearFields();
  }
  clearTrForm() {
    this.canShowForm = false;
    this.clearFields();
  }
  clearFields() {
    let dateInput = (<HTMLInputElement>document.getElementById('fechaProduccion'));
    let processSelect = (<HTMLSelectElement>document.getElementById('idProceso'));
    let moduleSelect = (<HTMLSelectElement>document.getElementById('idModulo'));
    let shiftSelect = (<HTMLSelectElement>document.getElementById('idTurno'));
    dateInput.value = new DatePipe("en-US").transform(this.productionDate, 'yyyy-MM-dd');
    processSelect.value = "";
    moduleSelect.value = "";
    shiftSelect.value = this.currentShift.id.toString();
    this.selectedProduct = null;
  }
  showForm() {
    this.canShowForm = true;
    let dateInput = (<HTMLInputElement>document.getElementById('fechaProduccion'));
    dateInput.value = new DatePipe("en-US").transform(this.productionDate, 'yyyy-MM-dd');
    let shiftSelect = (<HTMLSelectElement>document.getElementById('idTurno'));
    shiftSelect.value = this.currentShift.id.toString();
  }
  processChanged() {
    let processSelect = (<HTMLSelectElement>document.getElementById('idProceso'));
    let idProceso = processSelect.value;
    this.filterModules(parseInt(idProceso));
  }
  validFields(): boolean {
    let dateInput = (<HTMLInputElement>document.getElementById('fechaProduccion'));
    let processSelect = (<HTMLSelectElement>document.getElementById('idProceso'));
    let moduleSelect = (<HTMLSelectElement>document.getElementById('idModulo'));
    let shiftSelect = (<HTMLSelectElement>document.getElementById('idTurno'));
    let validationResult = true;
    let dateValue = dateInput.value.trim();
    let processValue = processSelect.value.trim();
    let moduleValue = moduleSelect.value.trim();
    let shiftValue = shiftSelect.value.trim();
    let productValue = this.selectedProduct;
    if (productValue) {
      productValue = productValue.trim();
    }
    if (!dateValue || !processValue || !moduleValue || !shiftValue || !productValue) {
      this.toast.warning("Favor de completar todos los campos");
      validationResult = false;
    } 
   
    return validationResult;
  }
  productChanged() {
    if (this.selectedProduct) {
      if (!this.productHasEan(this.selectedProduct)) {
        this.selectedProduct = "";
      }
    }
  }
  productRowChanged(index: number) {
    let productControl = this.controls.at(index).get("idProducto") as FormControl;
    let idProducto = productControl.value;
    if (idProducto) {
      if (!this.productHasEan(idProducto)) {
        productControl.setValue("");
      }
    }
  }
  productHasEan(idProducto: string): boolean {
    let product = this.products.find(p => p.codigoMaterial == idProducto);
    if (product.codigoEan && product.codigoEanCigarro) {
      return true;
    }
    if(!product.codigoEan){
      this.toast.error("Producto registrado sin código de barras");
    }else if(!product.codigoEanCigarro){
      this.toast.error("Producto registrado sin código de barras para cigarro individual");
    }
    return false;
  }
  
}
