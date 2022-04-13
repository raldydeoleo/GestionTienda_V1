import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProcess } from './process';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

      private apiUrl = this.baseUrl + "api/process";
      getProcesses(): Observable<IProcess[]> {
        return this.http.get<IProcess[]>(this.apiUrl);
      }
      getProcess(id:number): Observable<IProcess> {
        
        return this.http.get<IProcess>(this.apiUrl+"/"+id);
      }
      createProcess(process: IProcess): Observable<IProcess>{
        return this.http.post<IProcess>(this.apiUrl, process);
      }
      updateProcess(process: IProcess): Observable<IProcess> {
        return this.http.put<IProcess>(this.apiUrl, process);
      }
      deleteProcess(process: IProcess): Observable<IProcess> {
        return this.http.put<IProcess>(this.apiUrl +"/delete", process);
      }
}
