
import { Component, OnInit, QueryList, ViewChildren, Inject } from '@angular/core';
import { Observable} from 'rxjs';
import { Label } from '../../app/label-printing/label';
import { LabelService } from '../../app/label-printing/label.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global-service.service';
import { ToastrService } from 'ngx-toastr';
import {faSort} from '@fortawesome/free-solid-svg-icons';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SortablereprintDirective, SortEvent } from '../directives/sortablereprint.directive';

@UntilDestroy()
@Component({
      selector: 'app-reprint',
      templateUrl: './reprint.component.html',
      styleUrls: ['./reprint.component.css']
    })
export class ReprintComponent implements OnInit{
  labels$: Observable<Label[]>;
  total$: Observable<number>;
  module: string;
  process: string;
  //product: string;
  labels: Label[];
  labelsToPrint: Label[];
  faSort = faSort;
  @ViewChildren(SortablereprintDirective) headers: QueryList<SortablereprintDirective>;
  
  constructor(public labelService: LabelService, private activatedRoute: ActivatedRoute,  @Inject('BASE_URL') private baseUrl: string, private globalService: GlobalService, private toast: ToastrService, private router: Router) {
    this.labels$ = labelService.labels$;
    this.total$ = labelService.total$;
    
  }

  ngOnInit() { 
    this.process = this.activatedRoute.snapshot.queryParams['process'];
    this.module =  this.activatedRoute.snapshot.queryParams['module'];
    let idproceso = this.activatedRoute.snapshot.queryParams['idProceso'];
    let idmodulo = this.activatedRoute.snapshot.queryParams['idModulo'];
    let idturno = this.activatedRoute.snapshot.queryParams['idTurno'];
    let fechaproduccion= this.activatedRoute.snapshot.queryParams['fechaProduccion'];
    this.labelService.getlabelsFromApi(idproceso, idmodulo, idturno, fechaproduccion); 
    //this.labelService.product$.subscribe(value=>this.product=value); 
    this.labelService.labels$.pipe(
      untilDestroyed(this)
    ).subscribe(labels=>this.labels = labels);
    this.labelsToPrint = [];
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.labelService.sortColumn = column;
    this.labelService.sortDirection = direction;
  }

  print() {
    if(this.labelsToPrint.length > 0){
      let url = this.baseUrl + "api/Label/reprintlabels";
      this.globalService.getBlob(url, this.labelsToPrint)
        .pipe(untilDestroyed(this))
        .subscribe((res: any) => {
        this.globalService.getFileBlob(res,true);
      }, error => console.log(error)); 
    }
    else{
      this.toast.error("Debe seleccionar al menos 1 etiqueta");
    } 
  }

  cancelLabels(){
    this.labelService.cancelLabels(this.labelsToPrint).pipe(
      untilDestroyed(this)
    ).subscribe(()=>{this.toast.success("Las etiquetas seleccionadas fueron anuladas"); window.location.reload(); })//mientras tanto
  }

  checkBoxChange(id: any, checked: any){
    let label = this.labels.find(l=>l.id == id);
     if(checked){
        this.labelsToPrint.push(label);
        console.log(this.labelsToPrint);
     }
     else{
       let index = this.labelsToPrint.indexOf(label);
       this.labelsToPrint.splice(index,1);
       console.log(this.labelsToPrint);
     }
  }
}
