import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, Subject } from 'rxjs';
import { IModule } from './module';
import { IProcess } from '../process/process';
import { map, switchMap, debounceTime, tap } from 'rxjs/operators';
import { SortColumn } from '../directives/sort.directive';
import { SortDirection } from '../schedule/sort-schedule.directive';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
    //this.fillModules();
    this._search$.pipe(
        switchMap(() => this._search())
      ).subscribe(result => {
        this._modules$.next(result.modules);
        this._total$.next(result.total);
      });
    //this._search$.next();
  }
  private apiUrl = this.baseUrl + "api/module";
  private _modules$ = new BehaviorSubject<IModule[]>([]);
  private MODULES = [];
  public _search$ = new Subject<void>();
  private _total$ = new BehaviorSubject<number>(0);
  public _processId$ = new BehaviorSubject<number>(0);
  private _state: State = {
    page: 1,
    pageSize: 6,
    searchTerm: '',
    sortColumn: 'idProceso',
    sortDirection: 'asc'
  };
  
  fillModules() {
    this.getModules().toPromise().then(modules => { this.MODULES = modules; this._modules$.next(modules); this._search$.next(); });
  }

  getModule(id: number): Observable<IModule> {
    return this.http.get<IModule>(this.apiUrl +"/"+ id);
  }
  createModule(module: IModule): Observable<IModule> {
    return this.http.post<IModule>(this.apiUrl, module);
  }
  updateModule(module: IModule): Observable<IModule> {
    return this.http.put<IModule>(this.apiUrl, module);
  }
  deleteModule(module: IModule): Observable<IModule> {
    return this.http.put<IModule>(this.apiUrl + "/delete", module);
  }
  getModuleByProcess(idProceso:string): Observable<IModule[]>{
      return this.http.get<IModule[]>(this.apiUrl+"/getmodulebyprocess/"+idProceso);
  }
  getModules(): Observable<IModule[]> {
    return this.http.get<IModule[]>(this.apiUrl +"/getallwithprocess");
  }
  getProcesses(): Observable<IProcess[]> {
    return this.http.get<IProcess[]>(this.apiUrl + "/getprocesses")
      .pipe(map(data => data));
  }
  getNextModuleCode(processId: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + "/getNextModuleCode/" + processId);
  }

  get modules$() { return this._modules$.asObservable(); }
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

    let modules = sort(this.MODULES, sortColumn, sortDirection);
    if (this._processId$.getValue() == 0) {
      modules = modules.filter(module => matches(module, searchTerm));
    } else {
      modules = modules.filter(module => module.idProceso == this._processId$.getValue());
      modules = modules.filter(module => matches(module, searchTerm));
    }
    const total = modules.length;
    modules = modules.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({ modules, total });
  }
}


interface SearchResult {
  modules: IModule[];
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

function sort(modules: IModule[], column: SortColumn, direction: string): IModule[] {
  if (direction === '' || column === '') {
    return modules;
  } else {
    return [...modules].sort((a, b) => {
      const res = compare(`${a[column]}`, `${b[column]}`);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(module: IModule, term: string) {
  return module.descripcion.toLowerCase().includes(term.toLowerCase()) || module.textoModulo.includes(term) || module.codigo.toLowerCase().includes(term.toLowerCase());
}



