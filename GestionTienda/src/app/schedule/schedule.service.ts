import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { ISchedule } from './schedule';
import { SortColumn, SortDirection } from '../schedule/sort-schedule.directive';
import { switchMap, debounceTime, map, catchError} from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { IProcess } from '../process/process';
import { IModule } from '../module/module';

interface SearchResult {
  schedules: ISchedule[];
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

function sort(schedules: ISchedule[], column: SortColumn, direction: string): ISchedule[] {
  if (direction === '' || column === '') {
    return schedules;
  } else {
    return [...schedules].sort((a, b) => {
      const res = compare(`${a[column]}`, `${b[column]}`);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(schedule: ISchedule, term: Date) {
  return schedule.fechaProduccion.setHours(0,0,0,0) == term.setHours(0,0,0,0);
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private apiUrl = this.baseUrl + "api/Schedule/";  
  public displayScheduleForm = new BehaviorSubject(false);
  public addNewSchedule = new BehaviorSubject<ISchedule>(null);
  public _search$ = new Subject<void>();
  private _schedules$ = new BehaviorSubject<ISchedule[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  public _estatus$ = new BehaviorSubject<string>("activos");
  public _processId$ = new BehaviorSubject<string>("");
  public _moduleId$ = new BehaviorSubject<string>("");
  private SCHEDULES: ISchedule[];
  public editSchedule = new BehaviorSubject<ISchedule>(null);
  private _state: State = {
    page: 1,
    pageSize: 6,
    searchTerm: new Date(),
    sortColumn: 'finalizado',
    sortDirection: 'asc'
  };
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { 
    this.SCHEDULES = [];
    this._search$.pipe(switchMap(() => this.getSchedulesByDate()), debounceTime(200)).subscribe(result => {
        this.SCHEDULES = result;
        this._search().subscribe(
          result=>{
            this._schedules$.next(result.schedules);
            this._total$.next(result.total);
          }
        );  
    });
    //this._search$.next();
  }
  
  create(schedule:ISchedule):Observable<ISchedule>{
    return this.http.post<ISchedule>(this.apiUrl,schedule);
  }
  updateSchedule(schedule:ISchedule):Observable<ISchedule>{
    return this.http.put<ISchedule>(this.apiUrl, schedule);
  }
  insertOrUpdateSchedules(schedules: ISchedule[]): Observable<any>{
    return this.http.post(this.apiUrl + "insertschedules", schedules);
  }
  getSchedulesByDate():Observable<ISchedule[]>{
    let fechaProd = new DatePipe('en-Us').transform(this.searchTerm, 'MM/dd/yyyy');
    let fechaProduccion = new Date(fechaProd);
    return this.http.get<ISchedule[]>(this.apiUrl+"getschedulesbydate?productionDate="+fechaProduccion.toDateString()+"&estatus="+this._estatus$.getValue()+"&idproceso="+this._processId$.getValue()+"&idmodulo="+this._moduleId$.getValue());
  }
  changeSchedule(schedule: ISchedule): Observable<any> {
    return this.http.post(this.apiUrl+"changeschedule", schedule);
  }
  finishSchedule(schedule: ISchedule): Observable<ISchedule> {
    
    return this.http.put<ISchedule>(this.apiUrl+"finishschedule", schedule);
  }
  getProcesses(): Observable<IProcess[]> {
    return this.http.get<IProcess[]>(this.apiUrl + "getprocesses")
      .pipe(map(data => data));
  }
  getModules(): Observable<IModule[]> {
    return this.http.get<IModule[]>(this.apiUrl + "getmodules").pipe(map(data => data));
  }
  getProductsByName(name: string): Observable<any[]> {
    if (name == "") {
      name = null;
    }
    return this.http.get<any>(this.apiUrl + "getproductsbyname/" + name).pipe(
      catchError(() => of(({ items: [] }))),
      map(response => response)
    );
  }
  getProducts(): Observable<any> {
    return this.http.get<any>(this.apiUrl + "getproducts").pipe(map(data => data));
    //return this.http.get<any>(this.apiUrl + "/getall").pipe(map(data => data));
  }
  

  get schedules$() { return this._schedules$.asObservable(); }
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
    let schedules = sort(this.SCHEDULES, sortColumn, sortDirection);

    // 2. filter
      /* labels = labels.filter(label => matches(label, searchTerm));*/
      const total = schedules.length; 

    // 3. paginate
    schedules = schedules.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({ schedules, total });
  }
}
