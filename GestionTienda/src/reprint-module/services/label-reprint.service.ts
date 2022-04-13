import { DatePipe } from '@angular/common';
import { HttpClient} from '@angular/common/http';
import { Directive, EventEmitter, Inject, Injectable, Input, Output } from '@angular/core';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { ILabelReprint } from '../interfaces/label-reprint';

@Injectable({
  providedIn: 'root'
})
export class LabelReprintService{
  private _labesl$ = new BehaviorSubject<ILabelReprint[]>([]);
  private LABELS = [];
  public _search$ = new Subject<void>();
  private _total$ = new BehaviorSubject<number>(0);
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private ngbCalendar: NgbCalendar ) {
    this._search$.pipe(
      switchMap(() => this.getPrintedLabels())
    ).subscribe(result => {
        this.LABELS = result;
        this._search().subscribe(
          search_result=>{
            this._labesl$.next(search_result.labels);
            this._total$.next(search_result.total);
          }
        );
    });
  }

   private _state: State = {
    page: 1,
    pageSize: 6,
    dateTerm: ("0" + this.ngbCalendar.getToday().day).slice(-2)+"/"+("0" + this.ngbCalendar.getToday().month).slice(-2)+"/"+this.ngbCalendar.getToday().year,
    shiftTerm: '',
    moduleTerm: '',
    processTerm: '',
    productTerm: '',
    sortColumn: 'fechaProduccion',
    sortDirection: 'desc'
  };

  getPrintedLabels():Observable<ILabelReprint[]>{
    let dateArray = this.dateTerm.split('/');
    let date = new Date(parseInt(dateArray[2]),parseInt(dateArray[1])-1,parseInt(dateArray[0]));
    let filterDate = new DatePipe('en-Us').transform(date, 'MM/dd/yyyy');
    let params = {
      idTurno: this.shiftTerm,
      idModulo: this.moduleTerm,
      idProceso: this.processTerm,
      fechaProduccion: filterDate,
      idProducto: this.productTerm
    };
    // if(!(this.shiftTerm && this.moduleTerm && this.processTerm))
    //   return of([]);
    return this.http.get<ILabelReprint[]>(this.baseUrl+"api/Label/reprintlabelrequest", {params:params}).pipe(
      catchError(error=>{ //atrapamos el error para que no finalize el stream y cancele la subscripción al observable
      return of([]);
    }));
  }
  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }
  get dateTerm() { return this._state.dateTerm; }
  set dateTerm(dateTerm: string) { this._set({ dateTerm }); }

  get shiftTerm() { return this._state.shiftTerm; }
  set shiftTerm(shiftTerm: string) { this._set({ shiftTerm }); }

  get moduleTerm() { return this._state.moduleTerm; }
  set moduleTerm(moduleTerm: string) { this._set({ moduleTerm }); }

  get processTerm() { return this._state.processTerm; }
  set processTerm(processTerm: string) { this._set({ processTerm }); }

  get productTerm() { return this._state.productTerm; }
  set productTerm(productTerm: string) { this._set({ productTerm }); }

  get labels$() { return this._labesl$.asObservable(); }
  get total$() { return this._total$.asObservable(); }

  get page() { return this._state.page; }
  set page(page: number) { this._set({ page }); }

  get pageSize() { return this._state.pageSize; }
  set pageSize(pageSize: number) { this._set({ pageSize }); }

  set sortColumn(sortColumn: SortColumn) { this._set({ sortColumn }); }
  set sortDirection(sortDirection: SortDirection) { this._set({ sortDirection }); }
  
  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page} = this._state;
    let labels = sort(this.LABELS, sortColumn, sortDirection);
    const total = labels.length; 
    labels = labels.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({ labels, total });
  }

}

interface State {
  page: number;
  pageSize: number;
  dateTerm: string;
  shiftTerm: string;
  moduleTerm: string;
  processTerm: string;
  productTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

interface SearchResult {
  labels: ILabelReprint[];
  total: number;
}

function sort(elements: any[], column: SortColumn, direction: string): any[] {
  if (direction === '' || column === '') {
    return elements;
  } else {
    return [...elements].sort((a, b) => {
      const res = compare(`${a[column]}`, `${b[column]}`);
      return direction === 'asc' ? res : -res;
    });
  }
}

const compare = (v1: string, v2: string) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

//sort directive
export type SortColumn = keyof ILabelReprint | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = { 'asc': 'desc', 'desc': '', '': 'asc' };
export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}
@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction  === "asc"',
    '[class.desc]': 'direction  === "desc"',
    '(click)': 'rotate()'
  }
})
export class SortDirective {
  constructor() {  
  }
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable, direction: this.direction });
  }
}

