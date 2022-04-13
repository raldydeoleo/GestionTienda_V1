import { Component, OnInit, ViewChildren, QueryList, DoCheck} from '@angular/core';
import { SuplidoresService } from './suplidores.service';
import { AccountService } from '../account/account.service';
import { ToastrService } from 'ngx-toastr';
import { ISuplidores } from './suplidores';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { SortEvent, SortDirective } from '../directives/sort.directive';
import { ModalService } from '../modals/modal/modal.service';

@UntilDestroy()
@Component({
      selector: 'app-module',
      templateUrl: './suplidores.component.html',
      styleUrls: ['./suplidores.component.css']
    })
export class SuplidoresComponent implements OnInit {
  public suplidores: ISuplidores[];  
  suplidores$: Observable<ISuplidores[]>;
  total$: Observable<number>;
  faSort = faSort;
  @ViewChildren(SortDirective) headers: QueryList<SortDirective>;
  constructor(public suplidoresService: SuplidoresService, private accountService: AccountService, private toast: ToastrService, private modalService: ModalService) {
    this.suplidoresService.fillSuplidores();
    this.suplidoresService._search$.next();
    this.suplidores$ = suplidoresService.suplidores$;
    this.total$ = suplidoresService.total$;   
  }

  ngOnInit() {    
    this.loadData();
    this.suplidores$.subscribe(suplidores => this.suplidores = suplidores);    
  }
  
  loadData(): void {
      this.suplidoresService.getSuplidores()
      .toPromise().then(suplidores => this.suplidores = suplidores);
  }
 
   delete(suplidor: ISuplidores) {
    let data = {
      title: 'Confirmación de eliminación',
      message: `¿Está seguro que desea eliminar el suplidor ${suplidor.nombre} ?`,
      btnText: 'Sí',
      btnCancelText: 'No',
      hasCancelOption: 'Si',
      okBtnClass: 'btn-danger'
    }
    this.modalService.open(data).pipe(
      untilDestroyed(this)
    ).subscribe(result => {
      if (result == "ok click") {        
        this.suplidoresService.deleteSuplidor(suplidor).pipe(untilDestroyed(this)).subscribe(null, error => console.error(error), () => { this.suplidoresService.fillSuplidores(); this.toast.success("Suplidor Eliminado!"); });
      }
    });
    
  } 
}
