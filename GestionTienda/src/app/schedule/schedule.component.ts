import { Component, OnInit, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { ScheduleService } from './schedule.service';
import { ModalService } from '../modals/modal/modal.service';
import { AccountService } from '../account/account.service';
import { ChangeShiftService } from '../change-shift/change-shift.service';
import { ISchedule } from './schedule';
import {faSort} from '@fortawesome/free-solid-svg-icons';
import { SortScheduleDirective, SortEvent } from './sort-schedule.directive';
import { Observable } from 'rxjs';
import { IProcess } from '../process/process';
import { IModule } from '../module/module';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';



@UntilDestroy()
@Component({
      selector: 'app-schedule',
      templateUrl: './schedule.component.html',
      styleUrls: ['./schedule.component.css']
    })
export class ScheduleComponent implements OnInit, OnDestroy {
  displayForm:boolean;
  schedules:ISchedule[];
  schedules$: Observable<ISchedule[]>;
  total$: Observable<number>;
  faSort = faSort;
  selectedModule:string;
  public processes: IProcess[];
  public modules: IModule[];
  public optionModules: IModule[];
  @ViewChildren(SortScheduleDirective) headers: QueryList<SortScheduleDirective>;
  constructor(public scheduleService: ScheduleService, private modalService: ModalService, private accountService: AccountService, private changeShiftService: ChangeShiftService) { 
    this.schedules$ = this.scheduleService.schedules$;
    this.total$ = this.scheduleService.total$;
  }

  ngOnInit() {    
    this.scheduleService.displayScheduleForm.pipe(
      untilDestroyed(this)
    ).subscribe(v=>{
      this.displayForm = v;
    });
    
    this.scheduleService.addNewSchedule.pipe(
      untilDestroyed(this)
    ).subscribe(v => {
      (<HTMLInputElement>document.getElementById('todosCheck')).checked = true;
      this.scheduleService._estatus$.next("todos");
      this.scheduleService._search$.next();
    });

    this.scheduleService.schedules$.pipe(
      untilDestroyed(this)
    ).subscribe(schedules => this.schedules = schedules);
   /* this.scheduleService.getProcesses().toPromise().then(processes => {
      this.processes = processes;
      this.scheduleService.getModules().toPromise().then(modules => {
        this.modules = modules;
        this.checkForProcess();
      });
    });*/
    localStorage.removeItem("processFiltered");
    localStorage.removeItem("moduleFiltered");
    this.accountService.showSubMenu("scheduleMenu");
  }


  checkForProcess() {
    let processSelect = (<HTMLSelectElement>document.getElementById('idProceso'));
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
      processSelect.value = this.processes[0].id.toString();
      this.processChange();
      processSelect.disabled = true;
    }
  }
  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.scheduleService.sortColumn = column;
    this.scheduleService.sortDirection = direction;
  }
  /* loadData(): void {
    this.scheduleService.getSchedulesByDate()
      .subscribe(dataResponse => console.info(dataResponse));
  } */
  createSchedule(){
    this.displayForm = true;
  }
  edit(schedule: ISchedule){
    this.scheduleService.editSchedule.next(schedule);
    this.scheduleService.displayScheduleForm.next(true);
  }
  filter(value) {
    this.scheduleService._estatus$.next(value);
    this.scheduleService._search$.next();
  }
  filterByModule(processChange:boolean=false) {
    let processId: string = "";
    let moduleId: string = "";
    let processSelect = (<HTMLSelectElement>document.getElementById('idProceso'));
    let moduleSelect = (<HTMLSelectElement>document.getElementById('idModulo'));
    if (processChange) {
      moduleSelect.value = "";
    }
    if (processSelect) {
      processId = processSelect.value;
    }
    if (moduleSelect) {
      moduleId = moduleSelect.value;
      this.selectedModule = moduleId;
    }
    let finalizadosCheck = (<HTMLInputElement>document.getElementById('finalizadosCheck')).checked;
    let todosCheck = (<HTMLInputElement>document.getElementById('todosCheck')).checked;
    let value = 'activos';
    if (todosCheck) {
      value = 'todos';
    }
    else if (finalizadosCheck) {
      value = 'finalizados';
    }
    this.scheduleService._estatus$.next(value);
    this.scheduleService._processId$.next(processId);
    this.scheduleService._moduleId$.next(moduleId);
    this.scheduleService._search$.next();
    if (moduleId) {
      let module = this.modules.find(m => m.id == parseInt(moduleId));
      localStorage.setItem('moduleFiltered', JSON.stringify(module));
    }
    else {
      localStorage.removeItem('moduleFiltered');
    }
  }
  processChange() {
    let processSelect = (<HTMLSelectElement>document.getElementById('idProceso'));
    let idproceso = processSelect.value;
    if (this.modules) {
       this.populateModules(parseInt(idproceso));
    }
    if (idproceso) {
      let process = this.processes.find(p => p.id == parseInt(idproceso));
      localStorage.setItem('processFiltered', JSON.stringify(process));
    }
    else {
      localStorage.removeItem('processFiltered');
      localStorage.removeItem('moduleFiltered');
    }
    this.filterByModule(true);
    
  }
  populateModules(idProceso: number): void {
    this.optionModules = this.modules.filter(function (module) {
      return module.idProceso == idProceso
    });
  } 
  ngOnDestroy() {
    this.scheduleService._processId$.next("");
    this.scheduleService._moduleId$.next("");
  }
}
