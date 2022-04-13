import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IConfiguration } from './configuration';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  apiUrl: string = this.baseUrl + "api/Configuration";
  constructor(private http: HttpClient, @Inject ("BASE_URL") private baseUrl:string ) { }

  getAllConfigurations(): Observable<IConfiguration[]> {
    return this.http.get<IConfiguration[]>(this.apiUrl);
  }

  getConfiguration(id:number): Observable<IConfiguration> {
    return this.http.get<IConfiguration>(this.apiUrl+"/"+id);
  }

  getConfigurationByCode(code: string): Observable<IConfiguration> {
    return this.http.get<IConfiguration>(this.apiUrl + "/getbycode/" + code);
  }

  updateConfiguration(configuration: IConfiguration): Observable<IConfiguration> {
    return this.http.put<IConfiguration>(this.apiUrl +"/updateconfig", configuration);
  }

  async isModuleConfirmationActive():Promise<boolean> {
    let result = false;
    let configurations = await this.getAllConfigurations().toPromise();
    if (configurations.length > 0) {
      let configuration = configurations.find(c => c.codigo == "confirmacionModulo");
      if (configuration) {
        let configValue = configuration.valorConfiguracion;
        if (configValue == "True") {
          result = true;
        }
      }
    }
    return result;
  }
}
