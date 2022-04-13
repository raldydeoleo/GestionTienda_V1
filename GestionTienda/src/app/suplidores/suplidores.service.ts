import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, Subject } from 'rxjs';
import { ISuplidores } from './suplidores';
import { map, switchMap, debounceTime, tap } from 'rxjs/operators';
import { SortColumn } from '../directives/sort.directive';
import { SortDirection } from '../schedule/sort-schedule.directive';

@Injectable({
  providedIn: 'root'
})
export class SuplidoresService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
    
    this._search$.pipe(
          switchMap(() => this._search())
        ).subscribe(result => {
          this._suplidores$.next(result.suplidores);        
      });
     
  }
  private apiUrl = this.baseUrl + "api/suplidores";
  private _suplidores$ = new BehaviorSubject<ISuplidores[]>([]);
  private SUPLIDORES = [];
  public _search$ = new Subject<void>();
  private _total$ = new BehaviorSubject<number>(0);
  //public _processId$ = new BehaviorSubject<number>(0);
  private _state: State = {
    page: 1,
    pageSize: 6,
    searchTerm: '',
    sortColumn: 'id',
    sortDirection: 'asc'
  };
  fillSuplidores() {
    this.getSuplidores().toPromise().then(suplidores => { this.SUPLIDORES = suplidores; this._suplidores$.next(suplidores); this._search$.next(); });
  }

  getSuplidor(id: number): Observable<ISuplidores> {
    return this.http.get<ISuplidores>(this.apiUrl + "/getsuplidor/"+ id);
  }

  updateSuplidor(suplidor: ISuplidores): Observable<ISuplidores> {
    return this.http.put<ISuplidores>(this.apiUrl, suplidor);
  }

  createSuplidor(suplidor: ISuplidores): Observable<ISuplidores> {
    return this.http.post<ISuplidores>(this.apiUrl, suplidor);
  }  

  deleteSuplidor(suplidor: ISuplidores): Observable<ISuplidores> {
    return this.http.put<ISuplidores>(this.apiUrl + "/delete", suplidor);
  }

  getSuplidores(): Observable<ISuplidores[]> {
    return this.http.get<ISuplidores[]>(this.apiUrl +"/getall");
  }

  get suplidores$() { return this._suplidores$.asObservable(); }
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
    let suplidores = sort(this.SUPLIDORES, sortColumn, sortDirection);  
    const total = suplidores.length;
    suplidores = suplidores.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({ suplidores, total });
  }
}


interface SearchResult {
  suplidores: ISuplidores[];
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

function sort(suplidores: ISuplidores[], column: SortColumn, direction: string): ISuplidores[] {
  if (direction === '' || column === '') {
    return suplidores;
  } else {
    return [...suplidores].sort((a, b) => {
      const res = compare(`${a[column]}`, `${b[column]}`);
      return direction === 'asc' ? res : -res;
    });
  }
}
