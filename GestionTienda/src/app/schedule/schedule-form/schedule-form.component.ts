import { Component, OnInit, EventEmitter, ChangeDetectorRef, Input} from '@angular/core';
import { ScheduleService } from '../schedule.service';
import { IProcess } from 'src/app/process/process';
import { IModule } from 'src/app/module/module';
import { IShift } from 'src/app/shift/shift';
import { DeviceService } from 'src/app/device/device.service';
import { ShiftService } from 'src/app/shift/shift.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ISchedule } from '../schedule';
import { AccountService } from 'src/app/account/account.service';
import { DatePipe } from '@angular/common';
import { ModalService } from '../../modals/modal/modal.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';
import { RolesEnum } from '../../rolesEnum';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IProducts } from '../../label-printing/label.service';
import { promise } from 'protractor';
import { GlobalService } from '../../services/global-service.service';
import { SpinnerLoaderService } from 'src/app/services/spinner-loader.service';


@UntilDestroy()
@Component({
      selector: 'app-schedule-form',
      templateUrl: './schedule-form.component.html',
      styleUrls: ['./schedule-form.component.css']
    })
export class ScheduleFormComponent implements OnInit{

  public processes: IProcess[];
  public modules: IModule[];
  public optionModules: IModule[];
  public shifts: IShift[];
  formGroup: FormGroup;
  schedule: ISchedule;
  typeahead = new EventEmitter<string>();
  products = [];
  productsLoading = false;
  @Input() selectedModule:string;
  constructor(private scheduleService: ScheduleService, private deviceService: DeviceService, private shiftService: ShiftService, private fb: FormBuilder, private toast: ToastrService, private accountService: AccountService, private globalService: GlobalService, private modalService: ModalService, private cd: ChangeDetectorRef, private loaderService: SpinnerLoaderService) {
    //this.typeahead
    //  .pipe(
    //    debounceTime(200),
    //    switchMap(term => this.scheduleService.getProductsByName(term)),
    //    untilDestroyed(this)
    //  )
    //  .subscribe(items => {
    //    this.products = items;
    //    this.setProductsFullDescription();
    //    if (items.length <= 0) {
    //      let productsSelect = (<HTMLSelectElement>document.getElementById('idProducto'));
    //      if (productsSelect.innerText.indexOf("Buscar productos") >= 0) {
    //        this.populateProductsControl();
    //      }
    //    }
    //    this.cd.markForCheck();
    //  }, (err) => {
    //    console.log('error', err);
    //    this.products = [];
    //    this.cd.markForCheck();
    //  });
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      idProceso: '',
      idModulo: '',
      idTurno: '',
      fechaProduccion: '',
      idProducto: ''
    });
    this.formGroup.controls['fechaProduccion'].setValue(new DatePipe("en-US").transform(new Date(), 'yyyy-MM-dd'));
    this.formGroup.controls['idProducto'].reset();
    //this.loadData();
    this.scheduleService.editSchedule.pipe(
      untilDestroyed(this)
    ).subscribe(schedule=>{
        if(!this.modules){
          this.schedule = schedule;
          this.loadData();
        }else if(schedule){
          this.populateForm(schedule);
        }
    });
    //this.populateProductsControl();
    this.formGroup.controls['idProducto'].valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe((id_producto) => {
      if (id_producto) {
        if (!this.productHasEan(id_producto)) {
          this.formGroup.controls['idProducto'].reset();
        }
      }
    });
  }
  populateProductsControl():Promise<any> {
    this.productsLoading = true;
    this.loaderService.isLoading.next(true);
    let products_promise = this.scheduleService.getProducts().toPromise();
    return products_promise;
  }
  setProductsFullDescription() {
    this.products.map(product => {
      product.fullDescripcion = product.descripcion + " (" + product.codigoMaterial+")";
    });
  }
  customSearchFn(term: string, item: IProducts) {
    term = term.toLowerCase();
    return item.descripcion.toLowerCase().indexOf(term) > -1 || item.codigoMaterial.toLowerCase() === term;
  }
  populateForm(schedule: ISchedule):void{
    this.schedule = schedule;
    this.populateModules(schedule.id);
    this.formGroup.patchValue({
      idProceso: schedule.idProceso,
      idModulo: schedule.idModulo,
      idTurno: schedule.idTurno,
      fechaProduccion: new DatePipe("en-US").transform(schedule.fechaProduccion,'yyyy-MM-dd'),
      idProducto: schedule.idProducto
    });
    this.disablePrimaryFields(true);
  }
  cancel(){
    this.scheduleService.displayScheduleForm.next(false);
    this.schedule = undefined;
    this.formGroup.reset();
    this.disablePrimaryFields(false);
    this.scheduleService.editSchedule.next(undefined);
  }
  save(){
    if (this.formGroup.valid) {
      if(this.schedule){
          this.schedule.idProceso = this.formGroup.controls['idProceso'].value;
          this.schedule.idModulo = this.formGroup.controls['idModulo'].value;
          this.schedule.idTurno = this.formGroup.controls['idTurno'].value;
          this.schedule.fechaProduccion = this.formGroup.controls['fechaProduccion'].value;
          this.schedule.idProducto = this.formGroup.controls['idProducto'].value;;
        this.schedule.usuarioProgramacion = this.accountService.getLoggedInUser();
          this.scheduleService.updateSchedule(this.schedule).subscribe(schedule=>{
            this.scheduleService.addNewSchedule.next(this.schedule);
            this.toast.success("Programación actualizada");
            this.storeModuleSchedule(this.schedule.idProceso, this.schedule.idModulo);
            this.cancel();
          }, error => {
              if (error.status == 409) {
                this.changeProductSchedule(this.schedule);
              }
              else {
                this.scheduleService.addNewSchedule.next(this.schedule);
                this.cancel();
              }
          });
      } else {
        let processdisabled = this.formGroup.controls['idProceso'].disabled;
        if (processdisabled) {
          this.formGroup.controls['idProceso'].enable();
        }
        let schedule: ISchedule = Object.assign({}, this.formGroup.value);
        if (processdisabled) {
          this.formGroup.controls['idProceso'].disable();
        }
        schedule.usuarioProgramacion = this.accountService.getLoggedInUser();
        this.scheduleService.create(schedule).pipe(
          untilDestroyed(this)
        ).subscribe(
          scheduleAdded =>{
            this.scheduleService.addNewSchedule.next(scheduleAdded);
            this.toast.success("Programación agregada");
            this.storeModuleSchedule(schedule.idProceso, schedule.idModulo);
            this.cancel();
          },
          error => {
            if (error.status == 409) {
              this.changeProductSchedule(schedule); 
            }
            else {
              this.scheduleService.addNewSchedule.next(schedule);
              this.cancel();
            }
          }
        );
      }
    }else{
      this.validateAllFormFields(this.formGroup);
    }
    
    
  }
  changeProductSchedule(schedule: ISchedule) {
    let message = "Ya existe un producto programado en este módulo, ¿Desea realizar un cambio de producto?";
    if (this.schedule) {
      message = "Ya existe un producto programado en este módulo con etiquetas impresas, ¿Desea realizar un cambio de producto?";
    }
    let data = {
      title: 'Cambio de producto',
      message: message,
      btnText: 'Sí',
      btnCancelText:'No',
      okBtnClass:'btn-danger',
      hasCancelOption: 'Si'
    }
    this.modalService.open(data).pipe(
      untilDestroyed(this)
    ).subscribe(result => {
      if (result == "ok click") {
        this.scheduleService.changeSchedule(schedule).subscribe(
          response => {
            this.scheduleService.addNewSchedule.next(schedule);
            this.toast.success("Cambio de producto realizado con éxito");
            if (this.schedule) {
              //luego actualizamos el producto actual de nuestro registro de producción, esto es en caso de que tuviera etiquetas generadas
              this.globalService.openShift(schedule.idProceso, schedule.idModulo, this.accountService.getLoggedInUser()).toPromise().then(production => console.log('producción actualizada'));
            }
            this.cancel();
          }
        );
      }
    });
  }
  productHasEan(idProducto: string): boolean {
    let product = this.products.find(p => p.codigoMaterial == idProducto);
    if (product.codigoEan) { // && product.codigoEanCigarro
      return true;
    }
    if(!product.codigoEan){
      this.toast.error("Producto registrado sin código de barras");
    }
    // }else if(!product.codigoEanCigarro){
    //   this.toast.error("Producto registrado sin código de barras para cigarro individual");
    // }
    return false;
  }
  loadData(): void {
    if(!this.processes){
      this.scheduleService.getProcesses().toPromise().then(processes=>{
           this.processes = processes;
        this.scheduleService.getModules().toPromise().then(modules=>{
              this.modules = modules;
              this.shiftService.getShifts().toPromise().then(shifts=>{
                 this.shifts = shifts;
                this.formGroup.controls['idProceso'].valueChanges.pipe(
                  untilDestroyed(this)
                ).subscribe((idProceso) => {
                    if (this.modules) {
                      this.populateModules(idProceso);
                    }
                 });
                this.checkForProcess();
              }).then(shifts => {
                this.shiftService.getCurrentShift().toPromise().then(shift => {
                  this.formGroup.controls['idTurno'].setValue(shift.id);
                  this.populateProductsControl().then(products => {
                    this.products = products;
                    this.setProductsFullDescription();
                    this.productsLoading = false;
                    this.loaderService.isLoading.next(false);
                    if (this.schedule) {
                      this.populateForm(this.schedule);
                    }
                  });
                },
                error => {
                  if (this.schedule) {
                    this.populateForm(this.schedule);
                  }
                });
                
              });
           });
        });
    }
  }
  finish() {
    if (this.schedule) {
      let data = {
        title: 'Confirmación de finalización',
        message: `¿Está seguro que desea finalizar esta programación?`,
        btnText: 'Sí',
        btnCancelText: 'No',
        hasCancelOption: 'Si',
        okBtnClass: 'btn-danger'
      }
      this.modalService.open(data).pipe(
        untilDestroyed(this)
      ).subscribe(result => {
        if (result == "ok click") {
          this.schedule.usuarioFinalizado = this.accountService.getLoggedInUser();
          this.scheduleService.finishSchedule(this.schedule).pipe(
            untilDestroyed(this)
          ).subscribe(
            result => {
              this.scheduleService.addNewSchedule.next(result);
              this.toast.success("Producto Finalizado Exitosamente!");
              this.cancel();
            }
          );
        }
      });
    }
  }
  populateModules(idProceso: number): void {
    this.optionModules = this.modules.filter(function (module) {
      return module.idProceso == idProceso
    });
    if(this.selectedModule){ //verificando si se seleccionó un módulo en el select de filtrado
      let foundedModule = this.modules.find(m=>m.id == parseInt(this.selectedModule));
      if (foundedModule){
        let moduleSelect = this.formGroup.controls['idModulo'];
        moduleSelect.setValue(this.selectedModule);
      }
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

  disablePrimaryFields(option:boolean){
    if(option){
      this.formGroup.controls['idProceso'].disable();
      this.formGroup.controls['idModulo'].disable();
      this.formGroup.controls['idTurno'].disable();
      this.formGroup.controls['fechaProduccion'].disable();
    }else{
      this.formGroup.controls['idProceso'].enable();
      this.formGroup.controls['idModulo'].enable();
      this.formGroup.controls['idTurno'].disable();
      this.formGroup.controls['fechaProduccion'].enable();
    }
  }
  checkForProcess() {
    let processSelect = this.formGroup.controls['idProceso'];
    let allowedAreasPermissions = this.accountService.getAllowedAreas();
    let filteredProcesses: IProcess[] = [];
    allowedAreasPermissions.forEach(c => {
      let filteredProcess = this.processes.find(p => p.codigoPermiso == c);
      if (filteredProcess) {
        filteredProcesses.push(filteredProcess);
      }
    });
    this.processes = filteredProcesses;
    if (this.processes.length == 1) {
      processSelect.setValue(this.processes[0].id.toString());
      this.processChange();
      processSelect.disable();
    } else {
      this.checkForProcessSelection();
        
    }
  }

  processChange() {
    let processSelect = (<HTMLSelectElement>document.getElementById('idProceso'));
    let idproceso = processSelect.value;
    if (this.modules) {
      this.populateModules(parseInt(idproceso));
    }

  }

  checkForProcessSelection() {
    let processSelect = this.formGroup.controls['idProceso'];
    let process = localStorage.getItem("processFiltered");
    if (process) {
      process = JSON.parse(process);
      processSelect.setValue(process["id"]);
      let module = localStorage.getItem("moduleFiltered");
      if (module) {
        module = JSON.parse(module);
        let moduleSelect = this.formGroup.controls['idModulo'];
        moduleSelect.setValue(module["id"]);
      }
    }
  }

  storeModuleSchedule(idproceso,idmodulo) {
    let process = this.processes.find(p => p.id == idproceso);
    localStorage.setItem('process', JSON.stringify(process));
    let module = this.modules.find(m => m.id == idmodulo);
    localStorage.setItem('module', JSON.stringify(module));
  }
}
