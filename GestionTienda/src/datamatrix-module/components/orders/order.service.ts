import { DatePipe } from '@angular/common';
import { HttpClient} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { NgbCalendar} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AccountService } from 'src/app/account/account.service';
import { IEmailAccount } from './interfaces/emailAccount';
import { IOrder } from './interfaces/order';
import { IOrderDefault } from './interfaces/orderdefault';
import { SortColumn, SortDirection } from './sort-orders.directive';



@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orderApiUrl = this.baseUrl + "api/Order";
  private _orders$ = new BehaviorSubject<IOrder[]>([]);
  private ORDERS = [];
  public _search$ = new Subject<void>();
  private _total$ = new BehaviorSubject<number>(0);
  constructor(private httpClient: HttpClient, @Inject('BASE_URL') private baseUrl: string, private accountService: AccountService, private ngbCalendar: NgbCalendar) { 
    this._search$.pipe(
      switchMap(() => this.getOrders())
    ).subscribe(result => {
      this.ORDERS = result;
      this._search().toPromise().then(
        search_result=>{
          this._orders$.next(search_result.orders);
          this._total$.next(search_result.total);
        }
      );
    });
  }
  private _state: State = {
    page: 1,
    pageSize: 6,
    searchTerm: ("0" + this.ngbCalendar.getToday().day).slice(-2)+"/"+("0" + this.ngbCalendar.getToday().month).slice(-2)+"/"+this.ngbCalendar.getToday().year,
    sortColumn: 'creationDate',
    sortDirection: 'desc'
  };
  
   getOrders():Observable<IOrder[]>{
    //let filterDate = new DatePipe('en-Us').transform(this.searchTerm, 'MM/dd/yyyy');
    let dateArray = this.searchTerm.split('/');
    let date = new Date(parseInt(dateArray[2]),parseInt(dateArray[1])-1,parseInt(dateArray[0]));
    let filterDate = new DatePipe('en-Us').transform(date, 'MM/dd/yyyy');
     return this.httpClient.get<IOrder[]>(this.orderApiUrl+"/GetByDate?date="+filterDate);
   }
   createOrder(order:IOrder):Observable<IOrder>{
     return this.httpClient.post<IOrder>(this.orderApiUrl,order);
   }
   createEmail(email:IEmailAccount):Observable<IEmailAccount>{
    return this.httpClient.post<IEmailAccount>(this.baseUrl+"api/EmailAccount",email);
   }
   getOrderDefaults():Observable<IOrderDefault>{
     return this.httpClient.get<IOrderDefault>(this.baseUrl+"api/OrderSettings/1");
   }
   updateOrderDefaults(orderSettings: IOrderDefault):Observable<IOrderDefault>{
     return this.httpClient.put<IOrderDefault>(this.baseUrl+"api/OrderSettings",orderSettings);
   }
   getEmailAccounts():Observable<IEmailAccount[]>{
     return this.httpClient.get<IEmailAccount[]>(this.baseUrl+"api/EmailAccount");
   }
   deleteEmail(id){
      return this.httpClient.delete(this.baseUrl+"api/EmailAccount/"+id);
   }
   checkCodesAvailability(order: IOrder):Observable<IOrder[]>{
     return this.httpClient.post<IOrder[]>(this.orderApiUrl+"/CheckAvailability",order);
   }
   getCodesForOrder(order: IOrder){
     return this.httpClient.post<any[]>(this.baseUrl+"api/Code/GetCodes", order);
   }
   
   confirmCode(code:string):Promise<any>{
     let formData = new FormData();
     formData.append("code",code);
     return this.httpClient.post<any>(this.baseUrl+"api/Code/ConfirmCode",formData).toPromise();
   }
   authorizePrint(order: IOrder):Promise<IOrder>{
     return this.httpClient.put<IOrder>(this.orderApiUrl+"/AuthorizePrint",order).toPromise();
   }
   canPrintOrder(orderId: number):Promise<boolean>{
     return this.httpClient.get<boolean>(this.baseUrl+"api/Code/CanPrintOrder/"+orderId).toPromise();
   }
   closeOrder(order: IOrder):Promise<IOrder>{
    return this.httpClient.put<IOrder>(this.orderApiUrl+"/CloseOrder",order).toPromise();
   }
   setOrders$(orders: IOrder[]){
     this._orders$.next(orders);
     this._total$.next(orders.length);
   }

  get orders$() { return this._orders$.asObservable(); }
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
    const { sortColumn, sortDirection, pageSize, page} = this._state;
    let orders = sort(this.ORDERS, sortColumn, sortDirection);
    const total = orders.length; 
    orders = orders.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({ orders, total });
  }
}

interface SearchResult {
  orders: IOrder[];
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

function sort(orders: IOrder[], column: SortColumn, direction: string): IOrder[] {
  if (direction === '' || column === '') {
    return orders;
  } else {
    return [...orders].sort((a, b) => {
      const res = compare(`${a[column]}`, `${b[column]}`);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(order: IOrder, term: Date) {
  return order.creationDate.setHours(0,0,0,0) == term.setHours(0,0,0,0);
}
