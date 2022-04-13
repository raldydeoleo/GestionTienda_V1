import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import { AccountService } from '../account/account.service';
import { catchError, filter, take, switchMap, finalize, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject} from 'rxjs';
import { NgLocalization } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  constructor(private toast: ToastrService, private router: Router, private accountService: AccountService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // if (req.url.indexOf('Refresh') !== -1) {
    //  return next.handle(req);
    //}
    var token = this.accountService.getToken();
    if (token) {
      req = this.addToken(req, token);
    }
    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          //console.log("Success:");
          //console.log(event.body);
        }
      }),
      catchError((error: HttpErrorResponse): Observable<any> => {
        if (error.status == 403) {
          this.router.navigate(['login'], { queryParams: { returnUrl: this.router.url, is403Redirection: "true" } });
          this.toast.error('Se intentó acceder a un recurso no autorizado','Acceso no autorizado');
          setTimeout(()=>window.location.reload(),3000);
          
        }
        else if (error.status == 500) {
          this.toast.error('El servidor encontró un error interno o desconfiguración y no pudo procesar su solicitud.');
        }
        else if (error.status == 503){
          this.toast.error('Servicio no disponible. Contacte a Tecnología de Información.');
        }
        else if (error.status == 404) {
          this.toast.error('Recurso no encontrado. Contacte a Tecnología de Información.');
        }
        else if (error.status == 400) {
          if (error.error[""]) {
            this.toast.error(error.error[""]);
          }
        }
        else if (error.status == 0) {
          if(req.url.indexOf(":9876") == -1){
            this.toast.error('Error de comunicación con el servidor');
          }else{
            this.toast.error('Error de comunicación con el servicio de impresión');
          }
          
        }
        else if (error.status == 409) { //Conflicto
          return throwError(error);
        }
        else if (error.status == 453) { //Código personalizado
          return throwError(error);
        }
        else if (error.status == 401) {
          return this.handle401Error(req, next);
        }
        else if(error.status == 452){ //Código personalizado
          return throwError(error);
        }
        else {
          this.toast.error('Error interno. Favor de intentarlo nuevamente.');
        }
        return throwError(error);
      })
    ); 
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.accountService.getTokenRefresh().pipe(
        switchMap((token: any) => {
          this.refreshTokenSubject.next(token.token);
          localStorage.setItem('token', token.token);
          localStorage.setItem('tokenExpiration', token.expiration);
          return next.handle(this.addToken(request, token.token));
        }),
        catchError((error) => {
          this.accountService.logout();
          return throwError(error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );

    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap((token: any) => {
          return next.handle(this.addToken(request, token));
        }));
    }
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

}
