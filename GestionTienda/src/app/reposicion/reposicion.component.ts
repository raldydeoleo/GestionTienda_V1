import { Component, OnInit, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { SuplidoresService } from '../suplidores/suplidores.service';
import { ReposicionesService } from '../reposicion/reposicion.service';
import { ModalService } from '../modals/modal/modal.service';
import { AccountService } from '../account/account.service';
import { ChangeShiftService } from '../change-shift/change-shift.service';
import { ISuplidores } from '../suplidores/suplidores';
import {faSort} from '@fortawesome/free-solid-svg-icons';
//import { SortScheduleDirective, SortEvent } from './sort-schedule.directive';
import { Observable } from 'rxjs';
//import { IProductos} from '../productos/productos';
import { IProductos } from '../productos_prov/productos';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';


@Component({
  selector: 'app-reposicion',
  templateUrl: './reposicion.component.html',
  styleUrls: ['./reposicion.component.css']
})
export class ReposicionComponent implements OnInit {

  displayForm:boolean;
  suplidores:ISuplidores[];
  suplidores$: Observable<ISuplidores[]>;
  total$: Observable<number>;
  faSort = faSort;
  selectedSuplidor:string;
  public productos_prov: IProductos[];
  //public modules: IModule[];
  //public optionModules: IModule[];
  //@ViewChildren(SortScheduleDirective) headers: QueryList<SortScheduleDirective>;
  constructor(public reposicionesService: ReposicionesService, public suplidoresService: SuplidoresService, private modalService: ModalService, private accountService: AccountService, private changeShiftService: ChangeShiftService) { 
  this.suplidores$ = this.suplidoresService.suplidores$;
   this.total$ = this.suplidoresService.total$;
  }

  ngOnInit(): void {
   /* this.reposicionesService.displaySuplidoresForm.pipe(
      untilDestroyed(this)
    ).subscribe(v=>{
      this.displayForm = v;
    });*/

    this.suplidoresService.suplidores$.pipe(
      untilDestroyed(this)
    ).subscribe(suplidores => this.suplidores = suplidores);
  }

}
