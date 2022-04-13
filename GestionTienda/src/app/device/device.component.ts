import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { IModule } from '../module/module';
import { IProcess } from '../process/process';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute} from '@angular/router';
import { DeviceService } from './device.service';
//import { ProductosService } from '../productos/productos.service';
//import { IProductos } from '../productos/productos';
import { GlobalService, IProduction } from '../services/global-service.service';
import { AccountService } from '../account/account.service';
import { LabelService } from '../label-printing/label.service';
import { environment } from '../../environments/environment';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { ModalService } from '../modals/modal/modal.service';


@UntilDestroy()
@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit {
  //public productos: IProductos[];
  public processes: IProcess[];
  public modules: IModule[];
  public optionModules: IModule[];
  formGroup: FormGroup;
  returnUrl: string;
  buttonText: string;
  public productionObj: IProduction;
  modulesLoading = false;
  dataMatrixOrderId = 0;
  constructor(private deviceService: DeviceService,private router: Router, 
             private activatedRoute: ActivatedRoute,private toast: ToastrService, private fb: FormBuilder,
             private globalService: GlobalService, private accountService: AccountService,
             private labelService: LabelService, private modalService: ModalService) 
  { 
  }

  
  async ngOnInit() {
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '';
    this.formGroup = this.fb.group({
      idProceso: '',
      idModulo: ''
    });
    let orderId = this.activatedRoute.snapshot.queryParams['orderId'];
    if(orderId){
      this.dataMatrixOrderId = orderId;
      let production = await this.checkProductionByOrder();
      if(production){
        this.printForExistingOrder(production);
      }
    }
    this.loadData(); 
    
    this.buttonText = this.returnUrl == '' ? "Continuar" : "Continuar";
    this.accountService.showSubMenu("labelMenu");
  }

 /* addtoCart() : void {
    let data = {
      title: 'Confirmación de reposición',
      message: `¿Está seguro que desea realizar reposición  lel producto ?`,
      btnText: 'Sí',
      btnCancelText: 'No',
      hasCancelOption: 'Si',
      okBtnClass: 'btn-danger'
    }
    this.modalService.open(data).pipe(
      untilDestroyed(this)
    ).subscribe(result => {
      if (result == "ok click") {        
        this.toast.success("Producto agregado al carrito!"); 
      }
    });   

  }*/

  loadData(): void {
    this.productionObj = this.globalService.getLocalProduction();
    this.deviceService.getProcesses().pipe(untilDestroyed(this))
      .subscribe(processes => this.processes = processes, error => console.log(error), () => {
        this.modulesLoading = true;
        this.deviceService.getModules().pipe(untilDestroyed(this))
          .subscribe(modules => { this.modules = modules; this.modulesLoading = false; }, error => console.log(error), () => this.checkForSelection());
      });
    //si ya hay una produccion con esa orden, ir directamente a la pantalla de impresión

    //this.processes = this.deviceService.getProcesses();
    //this.modules = this.deviceService.getModules();
    //this.checkForSelection();    

    this.formGroup.controls['idProceso'].valueChanges.pipe(untilDestroyed(this)).subscribe((idprocess) => {
      if (this.modules) {
        this.populateModules(idprocess);
      }
   });
  }

  checkForSelection() {
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
      this.formGroup.controls['idProceso'].setValue(this.processes[0].id);
      this.formGroup.controls['idProceso'].disable();
      let module = localStorage.getItem("module");
      if(module){
        module = JSON.parse(module);
        this.formGroup.controls['idModulo'].setValue(module["id"]);
      }
    }
    else if (this.processes.length > 1) {
      let process = localStorage.getItem("process");
      if (process) {
        let module = localStorage.getItem("module");
        process = JSON.parse(process);
        module = JSON.parse(module); 
        this.formGroup.controls['idProceso'].setValue(process["id"]);
        this.populateModules(process['id']);
        this.formGroup.controls['idModulo'].setValue(module["id"]);
      }
    }
  }

  populateModules(idProceso:number): void{
    this.optionModules = this.modules.filter(function (module){
       return module.idProceso == idProceso
    });
    //this.optionModules = this.modules.pipe(map(modules => modules.filter(function (module) {
    //  return module.idProceso == idProceso;
    //})));
  }

  save():void{
    if(this.formGroup.valid){
      let idmodule = this.formGroup.controls['idModulo'].value;
      let idprocess = this.formGroup.controls['idProceso'].value;
      if(this.dataMatrixOrderId == 0){
        this.openShift(idprocess, idmodule);
      }
      else{
        this.openDataMatrixShift(idprocess, idmodule, this.dataMatrixOrderId);
      }
      
    }
    else{
      this.validateAllFormFields(this.formGroup);
    }
  }
  openShift(idProcess:number, idModule:number){
        this.globalService.openShift(idProcess, idModule, this.accountService.getLoggedInUser()).pipe(untilDestroyed(this))
        .subscribe(response => {
                    this.storeSelecction(idModule,idProcess);
                    localStorage.setItem("production", JSON.stringify(response.body));
                    localStorage.setItem("version", environment.appVersion);
                    this.productionObj = response.body;
                    if (!sessionStorage.getItem("closetimer")) {
                      this.globalService.checkForShiftChangeEvent();
                    }
                    if(response.status == 201){
                      this.toast.success("Apertura del "+ this.productionObj.shift.descripcion+" del "+this.labelService.getModule().descripcion + " De "+this.labelService.getProcess().descripcion);
                    }
                  },
                  error=>{
                    console.error(error);
                  },
                  ()=>{
                    if(this.returnUrl != ''){
                      this.router.navigateByUrl(this.returnUrl);
                    }
                    else{
                      this.router.navigate(['label']);
                    }
          });
  }
  storeSelecction(idModule:number, idProcess:number) {
    let module = this.modules.find(m=>m.id == idModule);
    let process = this.processes.find(p => p.id == idProcess);

    localStorage.setItem('module', JSON.stringify(module));
    localStorage.setItem('process', JSON.stringify(process));
    sessionStorage.setItem('sessionModule', JSON.stringify(module));
    sessionStorage.setItem('sessionProcess', JSON.stringify(process));
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
  checkProductionByOrder():Promise<IProduction>{
    return this.deviceService.checkProductionByOrder(this.dataMatrixOrderId);
  }
  async printForExistingOrder(production: IProduction){
    if(!this.processes){
      let processes = await this.deviceService.getProcesses().toPromise();
      let modules = await this.deviceService.getModules().toPromise();
      this.processes = processes;
      this.modules = modules;
    }
    this.storeSelecction(production.idModulo,production.idProceso);
    localStorage.setItem("production", JSON.stringify(production));
    localStorage.setItem("version", environment.appVersion);
    if (!sessionStorage.getItem("closetimer")) {
      this.globalService.checkForShiftChangeEvent();
    }
    if(this.returnUrl != ''){
      this.router.navigateByUrl(this.returnUrl);
    }
    else{
      this.router.navigate(['label']);
    }
  }
  openDataMatrixShift(idProcess:number, idModule:number, orderId:number){
    this.deviceService.openShiftByOrder(idProcess, idModule, this.accountService.getLoggedInUser(), orderId).then(
      response=>{
        if(response.status == 201){
          this.printForExistingOrder(response.body);
        } 
      }
    );
  }
}
