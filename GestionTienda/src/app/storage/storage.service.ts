import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IStorage } from './storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private apiUrl = this.baseUrl + "api/storage";
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getStorages(): Observable<IStorage[]> {
    return this.http.get<IStorage[]>(this.apiUrl);
  }

  getStorage(id: number): Observable<IStorage> {
    return this.http.get<IStorage>(this.apiUrl +"/"+ id);
  }
  createStorage(storage: IStorage): Observable<IStorage> {
    return this.http.post<IStorage>(this.apiUrl, storage);
  }
  updateStorage(storage: IStorage): Observable<IStorage> {
    return this.http.put<IStorage>(this.apiUrl, storage);
  }
  deleteStorage(storage: IStorage): Observable<IStorage> {
    return this.http.put<IStorage>(this.apiUrl + "/delete", storage);
  }
}
