import { Injectable } from '@angular/core';
import {
    HttpResponse,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpinnerLoaderService } from './services/spinner-loader.service';
import { Router } from '@angular/router';
 
@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
    private requests: HttpRequest<any>[] = [];
 
    constructor(private loaderService: SpinnerLoaderService, private router: Router) { }
 
    removeRequest(req: HttpRequest<any>) {
        const i = this.requests.indexOf(req);
        if (i >= 0) {
            this.requests.splice(i, 1);
        }
        this.loaderService.isLoading.next(this.requests.length > 0);
    }

    isModuleConfirmModalOpen(url:string):boolean {
      if (url.indexOf('getallwithprocess') > 0) {
        if(this.router.url === '/label')
          return true;
      } else {
        return false;
      }
    }
 
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.requests.push(req);
        //console.log("No of requests--->" + this.requests.length);
        if (this.isLoaderNeeded(req.url) && !this.isModuleConfirmModalOpen(req.url) ) {
            this.loaderService.isLoading.next(true);
        }
        return Observable.create(observer => {
            const subscription = next.handle(req)
                .subscribe(
                    event => {
                        if (event instanceof HttpResponse) {
                            this.removeRequest(req);
                            observer.next(event);
                        }
                    },
                    err => {
                        //alert('error returned'); 
                        this.removeRequest(req);
                        observer.error(err);
                    },
                    () => {
                        this.removeRequest(req);
                        observer.complete();
                    });
            // remove request from queue when cancelled
            return () => {
                this.removeRequest(req);
                subscription.unsubscribe();
            };
        });
    }

    isLoaderNeeded(requestUrl):boolean{
        let filteredUrls = ["getcustomersbyterm", "updateMasterData", "getproducts", "OrderSettings"]; 
        if(filteredUrls.some(url => requestUrl.includes(url))){
           return false;
        }
        return true;
    }

}
