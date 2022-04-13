import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { IModule } from '../module/module';
import { IProcess } from '../process/process';
import { Label } from './label';
import { SortColumn, SortDirection } from '../../reprint-module/directives/sortablereprint.directive';
import { switchMap, debounceTime, map, catchError} from 'rxjs/operators'; 
import { DatePipe } from '@angular/common';
import { AccountService } from '../account/account.service';
import { ToastrService } from 'ngx-toastr';

interface SearchResult {
  labels: Label[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

const compare = (v1: string, v2: string) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(labels: Label[], column: SortColumn, direction: string): Label[] {
  if (direction === '' || column === '') {
    return labels;
  } else {
    return [...labels].sort((a, b) => {
      const res = compare(`${a[column]}`, `${b[column]}`);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(label: Label, term: string) {
  return label.codigoQr.toLowerCase().includes(term.toLowerCase());
}

export interface IProducts{
  codigoMaterial: string; 
  codigoEan: string;
  codigoEanCigarro:string;
  descripcion: string; 
  centro: string;
  cigarrosPorCaja: number; 
  pesoNeto: number; 
  unidadPeso: string; 
}


export interface ICountry{ //esto es temporal
  id: string;
  descripcion: string;
}

export interface IPrintLabelRequest{
  idModulo: number,
  numeroModulo: string,
  idProceso: number,
  idAlmacenamiento: string,
  idProducto: string,
  descripcionProducto: string,
  cantidadEtiquetas: number,
  cantidadCigarros: number,
  almacenamiento: string,
  codigoEan: string,
  centro: string,
  pesoNeto: number,
  unidadPeso: string,
  usuario: string,
  idProduccion: number,
  cliente: object,
  esUsa: boolean,
  textoModulo: string,
  tipoEtiqueta: string,
  lleva_Logo_TextoInferior: boolean,
  dataMatrixOrderId: number,
  token:string,
  apiUrl:string,
  printerName:string,
  esReimpresion:boolean,
  fechaHoraReimpresion: Date,
  idEtiquetaReimpresa: number
}

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  

  private apiUrl = this.baseUrl + "api/Label/";
  public isShiftClosed = new BehaviorSubject(false);

  private _search$ = new Subject<void>();
  private _labels$ = new BehaviorSubject<Label[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  //private _product$ = new BehaviorSubject<string>("");
  private LABELS: Label[];


  private _state: State = {
    page: 1,
    pageSize: 4,
    searchTerm: '',
    sortColumn: 'fechaHoraCalendario',
    sortDirection: 'desc'
  };

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private accountService: AccountService, private toast: ToastrService) {
    this.LABELS = [];
    this._search$.pipe(switchMap(() => this._search()), debounceTime(200)).subscribe(result => {
        this._labels$.next(result.labels);
        this._total$.next(result.total);
      });
    this._search$.next();
  }
  
  getModule():IModule{
    return JSON.parse(localStorage.getItem("module"));
  }

  getProcess():IProcess{
    return JSON.parse(localStorage.getItem("process"));
  }

  getProducts(): Observable<IProducts[]> {
    return this.http.get<IProducts[]>(this.apiUrl +"getproducts");
  }

  getProduct(codigo: string): Observable<IProducts>{
    return this.http.get<IProducts>(this.apiUrl+"getproduct/"+codigo);
  }
  getLocalProduct(){
    return JSON.parse(localStorage.getItem("product"));
  }
  getProcesses(): Observable<IProcess[]> {
    return this.http.get<IProcess[]>(this.apiUrl+"getprocesses");
  }
  getModules(): Observable<IModule[]> {
    return this.http.get<IModule[]>(this.apiUrl+"getmodules");
  }

  getlabelsFromApi(idproceso: number, idmodulo: number, idturno: number, fechaproduccion: Date) {
    let fechaProd = new DatePipe('en-Us').transform(fechaproduccion, 'MM/dd/yyyy'); 
    let fechaProduccion = new Date(fechaProd);
    let httpParams = new HttpParams()
      .set('idProceso', idproceso.toString())
      .set('idModulo', idmodulo.toString())
      .set('idTurno', idturno.toString())
      .set('fechaProduccion', fechaProduccion.toDateString());
    this.http.get<Label[]>(this.apiUrl + "getlabels", {params:httpParams})
      .toPromise().then(
        labels => {
          this.LABELS = labels;
          this._search$.next();
          //this._product$.next(production.idProducto);
        }
     );
  }

  getCustomers():Observable<any>{
    return this.http.get(this.baseUrl+"api/production/getcustomers");
  }

  getCustomersByTerm(term:string):Observable<any[]>{  
    return this.http.get<any>(this.baseUrl+"api/production/getcustomersbyterm/"+term).pipe(
      catchError(() => of(({items: []}))),
      map(response => response)
    );
  }

  cancelLabels(labels: Label[]):Observable<any>{
    let usuario = this.accountService.getLoggedInUser();
    let body = {labels: labels, usuarioAnulacion: usuario};
    return this.http.post<any>(this.apiUrl+"cancelLabels",body);
  }

  cancelLabelByQr(qrCode:string){
    let body = {qrCode: qrCode, usuario: this.accountService.getLoggedInUser()};
    return this.http.post<any>(this.apiUrl+"cancellabelbyqr",body,{observe: 'response'})
    .toPromise().then(
       response =>{
          if (response.status === 200) {
            this.toast.success("La etiqueta fue anulada exitosamente");
          }
        }
    );
  }

  //get product$() {return this._product$.asObservable();}
  get labels$() { return this._labels$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }

  set page(page: number) { this._set({ page }); }
  set pageSize(pageSize: number) { this._set({ pageSize }); }
  set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
  set sortColumn(sortColumn: SortColumn) { this._set({ sortColumn }); }
  set sortDirection(sortDirection: SortDirection) { this._set({ sortDirection }); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

    // 1. sort
    let labels = sort(this.LABELS, sortColumn, sortDirection);

    // 2. filter
      labels = labels.filter(label => matches(label, searchTerm));
      const total = labels.length;

    // 3. paginate
    labels = labels.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({ labels, total });
  }

 
}
