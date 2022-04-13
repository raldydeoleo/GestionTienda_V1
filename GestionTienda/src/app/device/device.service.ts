import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProcess } from '../process/process';
import { IModule } from '../module/module';
import { map } from 'rxjs/operators';
import { IProduction } from '../services/global-service.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }
  private apiUrl = this.baseUrl + "api/Label";
  getProcesses(): Observable<IProcess[]> {
    return this.http.get<IProcess[]>(this.apiUrl + "/getprocesses")
      .pipe(map(data=>data));
  }
  getModules(): Observable<IModule[]> {
    return this.http.get<IModule[]>(this.apiUrl + "/getmodules").pipe(map(data => data));
  }
  checkProductionByOrder(orderId: number):Promise<IProduction>{
    return this.http.get<IProduction>(this.baseUrl + "api/Production/checkProductionByOrder/"+orderId).toPromise();
  }
  openShiftByOrder(idProceso: number, idModulo:number, usuarioApertura:string, orderId: number):Promise<HttpResponse<IProduction>>{
    let body = {idProceso: idProceso, idModulo: idModulo, usuarioApertura: usuarioApertura, dataMatrixOrderId: orderId};
    return this.http.post<any>(this.baseUrl + "api/Production/GetShiftDataMatrix",body,{observe: 'response'}).toPromise();
  }
}
