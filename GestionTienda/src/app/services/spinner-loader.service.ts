import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerLoaderService {
  public isLoading = new BehaviorSubject(false);
  constructor() { }
}
