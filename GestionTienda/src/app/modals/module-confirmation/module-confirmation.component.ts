import { Component, OnInit, Input } from '@angular/core';
import { IModule } from '../../module/module';
import { ModuleService } from '../../module/module.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder } from '@angular/forms';
import { LabelService } from '../../label-printing/label.service';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';

@Component({
  selector: 'app-module-confirmation',
  templateUrl: './module-confirmation.component.html',
  styleUrls: ['./module-confirmation.component.css']
})
export class ModuleConfirmationComponent implements OnInit {
  modules: IModule[];
  optionModules: IModule[];
  formGroup: FormGroup;
  title: string;
  modulesLoading = false;
  @Input() fromParent;
  constructor(private moduleService: ModuleService, public activeModal: NgbActiveModal, private fb: FormBuilder, private labelService: LabelService) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      idModulo: ''
    });
    this.formGroup.controls['idModulo'].reset();
    this.modulesLoading = true;
    this.moduleService.getModules().toPromise().then(modules => {
      this.modules = modules;
      let processId = this.labelService.getProcess().id;
      this.populateModules(processId);
      this.modulesLoading = false;
    });
    let data = this.fromParent;
    this.title = data.title;
  }
  confirm() {
    let moduleConfig = this.labelService.getModule();
    let moduleSelectedId = this.formGroup.controls['idModulo'].value;
    if (moduleSelectedId == moduleConfig.id) {
      this.activeModal.close("");
    }
    else {
      this.activeModal.close("confirmError");
    }
  }
  cancel() {
    this.activeModal.close("cancel");
  }
  populateModules(idProceso: number): void {
    this.optionModules = this.modules.filter(function (module) {
      return module.idProceso == idProceso
    });
  }
  customSearchFn(term: string, item: IModule) {
    term = term.toLowerCase();
    return item.descripcion.toLowerCase().indexOf(term) > -1 || item.codigo.toLowerCase() === term;
  }
}
