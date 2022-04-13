import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {
  private localApiUrl = 'http://localhost:9877/api/Printer'; 
  private headers = new HttpHeaders({
    'ApiKey': 'dhcnkrlakn@33#knd++21dsad..sd2as11ssadamv{{]c cdsc'
  });  
  constructor(private http: HttpClient) { }
  getPrinters(): Observable<any[]> {
    return this.http.get<any[]>(this.localApiUrl, { headers: this.headers });
  }
}
