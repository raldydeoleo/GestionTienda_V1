import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, Subject } from 'rxjs';
import { IProductos } from './productos';
import { IProcess } from '../process/process';
import { map, switchMap, debounceTime, tap } from 'rxjs/operators';
import { SortColumn } from '../directives/sort.directive';
import { SortDirection } from '../schedule/sort-schedule.directive';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
    
    this._search$.pipe(
          switchMap(() => this._search())
        ).subscribe(result => {
          this._productos$.next(result.productos);        
      });
     
  }
  private apiUrl = this.baseUrl + "api/productos";
  private _productos$ = new BehaviorSubject<IProductos[]>([]);
  private PRODUCTOS = [];
  public _search$ = new Subject<void>();
  private _total$ = new BehaviorSubject<number>(0);
  public _processId$ = new BehaviorSubject<number>(0);
  private _state: State = {
    page: 1,
    pageSize: 6,
    searchTerm: '',
    sortColumn: 'id',
    sortDirection: 'asc'
  };
  fillProductos() {
    this.getProductos().toPromise().then(productos => { this.PRODUCTOS = productos; this._productos$.next(productos); this._search$.next(); });
  }

  getProducto(id: number): Observable<IProductos> {
    return this.http.get<IProductos>(this.apiUrl + "/getproducto/"+ id);
  }

  updateProducto(producto: IProductos): Observable<IProductos> {
    return this.http.put<IProductos>(this.apiUrl, producto);
  }

  createProducto(producto: IProductos): Observable<IProductos> {
    return this.http.post<IProductos>(this.apiUrl, producto);
  }  

  deleteProducto(producto: IProductos): Observable<IProductos> {
    return this.http.put<IProductos>(this.apiUrl + "/delete", producto);
  }

  getProductos(): Observable<IProductos[]> {
    return this.http.get<IProductos[]>(this.apiUrl +"/getall");
  }

  get productos$() { return this._productos$.asObservable(); }
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
    let productos = sort(this.PRODUCTOS, sortColumn, sortDirection);  
    const total = productos.length;
    productos = productos.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({ productos, total });
  }
}


interface SearchResult {
  productos: IProductos[];
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

function sort(productos: IProductos[], column: SortColumn, direction: string): IProductos[] {
  if (direction === '' || column === '') {
    return productos;
  } else {
    return [...productos].sort((a, b) => {
      const res = compare(`${a[column]}`, `${b[column]}`);
      return direction === 'asc' ? res : -res;
    });
  }
}
