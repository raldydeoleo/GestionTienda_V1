import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IShift } from './shift';

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  private apiUrl = this.baseUrl + "api/shift";
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getShifts(): Observable<IShift[]> {
    return this.http.get<IShift[]>(this.apiUrl);
  }

  getShift(id: number): Observable<IShift>{
    return this.http.get<IShift>(this.apiUrl+"/"+id);
  }
  getCurrentShift(): Observable<IShift> {
    return this.http.get<IShift>(this.baseUrl + "api/Shift/getcurrentshift");
  }

  createShift(shift: IShift): Observable<IShift> {
    return this.http.post<IShift>(this.apiUrl, shift);
  }
  updateShift(shift: IShift): Observable<IShift> {
    return this.http.put<IShift>(this.apiUrl, shift);
  }
  deleteShift(shift: IShift): Observable<IShift> {
    return this.http.put<IShift>(this.apiUrl + "/delete", shift);
  }
  
  
}
