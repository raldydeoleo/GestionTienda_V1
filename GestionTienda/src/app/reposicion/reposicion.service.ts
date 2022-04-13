import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { SortColumn, SortDirection } from '../schedule/sort-schedule.directive';
import { switchMap, debounceTime, map, catchError} from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { ISuplidores } from '../suplidores/suplidores';
import { IProductos } from '../productos/productos';
//import { IProcess } from '../process/process';
//import { IModule } from '../module/module';

interface SearchResult {
  suplidores: ISuplidores[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: Date;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

const compare = (v1: string, v2: string) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

/*function sort(schedules: ISuplidores[], column: SortColumn, direction: string): ISuplidores[] {
    if (direction === '' || column === '') {
      return suplidores;
    } else {
      return [...suplidores].sort((a, b) => {
        const res = compare(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }
  }*/

  export class ReposicionesService {

    private apiUrl = this.baseUrl + "api/Reposiciones/";    
    public displaySuplidoresForm = new BehaviorSubject(false);
    public addNewSuplidor = new BehaviorSubject<ISuplidores>(null);
    public _search$ = new Subject<void>();
    private _suplidores$ = new BehaviorSubject<ISuplidores[]>([]);
    private _total$ = new BehaviorSubject<number>(0);
    public _estatus$ = new BehaviorSubject<string>("activos");
    //public _processId$ = new BehaviorSubject<string>("");
    //public _moduleId$ = new BehaviorSubject<string>("");
    private SUPLIDORES: ISuplidores[];
    public editSuplidor = new BehaviorSubject<ISuplidores>(null);
    private _state: State = {
      page: 1,
      pageSize: 6,
      searchTerm: new Date(),
      sortColumn: 'finalizado',
      sortDirection: 'asc'
    };
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { 
      this.SUPLIDORES = [];
      this._search$.pipe(switchMap(() => this.getSuplidoresByDate()), debounceTime(200)).subscribe(result => {
          this.SUPLIDORES = result;
          this._search().subscribe(
            result=>{
              this._suplidores$.next(result.suplidores);
              this._total$.next(result.total);
            }
          );  
      });
      //this._search$.next();
    }

    getSuplidoresByDate():Observable<ISuplidores[]>{
        let fechaRec = new DatePipe('en-Us').transform(this.searchTerm, 'MM/dd/yyyy');
        let fechaRecepcion = new Date(fechaRec);
        return this.http.get<ISuplidores[]>(this.apiUrl+"getsuplidoresbydate?fecha_entrada="+fechaRecepcion.toDateString());//+"&estatus="+this._estatus$.getValue()+"&idproceso="+this._processId$.getValue()+"&idmodulo="+this._moduleId$.getValue());
    }

    getProductos(): Observable<IProductos[]> {
        return this.http.get<IProductos[]>(this.apiUrl + "getproductos").pipe(map(data => data));
    }

    getSuplidoresByCantidad(cantidad: number): Observable<any[]> {
        if (cantidad == 0) {
          cantidad = null;
        }
        return this.http.get<any>(this.apiUrl + "getsuplidoresbycantidad/" + cantidad).pipe(
          catchError(() => of(({ items: [] }))),
          map(response => response)
        );
    }

    get suplidores$() { return this._suplidores$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get page() { return this._state.page; }
    get pageSize() { return this._state.pageSize; }
    get searchTerm() { return this._state.searchTerm; }
  
    set page(page: number) { this._set({ page }); }
    set pageSize(pageSize: number) { this._set({ pageSize }); }
    set searchTerm(searchTerm: Date) { this._set({ searchTerm }); }
    set sortColumn(sortColumn: SortColumn) { this._set({ sortColumn }); }
    set sortDirection(sortDirection: SortDirection) { this._set({ sortDirection }); }
  
    private _set(patch: Partial<State>) {
      Object.assign(this._state, patch);
      this._search$.next();
    }
  
    private _search(): Observable<SearchResult> {
      const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;
  
      // 1. sort
      let suplidores; //= sort(this.SUPLIDORES, sortColumn, sortDirection);
  
      // 2. filter
        /* labels = labels.filter(label => matches(label, searchTerm));*/
        const total = suplidores.length; 
  
      // 3. paginate
      suplidores = suplidores.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
      return of({ suplidores, total });
    }
}  