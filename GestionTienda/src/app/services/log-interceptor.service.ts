import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpSentEvent, HttpHeaderResponse, HttpResponse, HttpProgressEvent, HttpUserEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable} from 'rxjs';
import { tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LogInterceptorService implements HttpInterceptor {
  constructor() { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
    return next.handle(req).pipe(
        tap(evt => {
        if (evt instanceof HttpResponse) {
            console.log('LogInterceptor:');
            console.log(evt.body);
          }
        })
      );
  }
}
