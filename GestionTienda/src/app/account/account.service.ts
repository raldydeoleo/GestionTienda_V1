import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { IUserInfo } from './user-info';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Permissions } from '../PermissionEnum';  
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiURL = this.baseUrl + "api/Access";
  public isLoggingOut = new BehaviorSubject(false);
  constructor(@Inject('BASE_URL') private baseUrl: string, private http: HttpClient, private router: Router, private toast: ToastrService) { }
    
    login(userInfo: IUserInfo): Observable<any> {
       return this.http.post<any>(this.apiURL + "/Login", userInfo);
    }

    getToken(): string {
      return localStorage.getItem("token");
    }

    getTokenExpiration(): string {
      return localStorage.getItem("tokenExpiration");
    }

    getUserRol():string{
      return localStorage.getItem("rol");
    }

    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");
      localStorage.removeItem("username");
      localStorage.removeItem("rol");
      this.router.navigate(['login']);
      let closeTimer = sessionStorage.getItem("closetimer");
      if(closeTimer){
        clearTimeout(parseInt(closeTimer));
        let reminderTimer = sessionStorage.getItem("remindertimer");
        clearTimeout(parseInt(reminderTimer));
      }
      sessionStorage.clear();
      this.isLoggingOut.next(true);
    }

  isLoggedIn(isCloseShiftRequest: boolean = false): boolean {
      if (isCloseShiftRequest) {
        return true;
      }
      var exp = this.getTokenExpiration();

      if (!exp) {
        // el token no existe
        return false;
      }

      var now = new Date().getTime();
      var dateExp = new Date(exp);


      if (now >= dateExp.getTime()) { // ya expiró el token
        let dateExp = new Date(exp);
        let now = new Date().getTime();
        let elapsedMiliseconds = now.valueOf() - dateExp.valueOf();
        let elapsedMinutes = elapsedMiliseconds / 60000;
        if (elapsedMinutes > 15) {
          this.logout();
          this.toast.info("Cierre de sesión automático por inactividad");
          return false;
        }
        else {
          return true;
        }
       
      } else {
        return true;
      }

    }

    getLoggedInUser(isCloseShiftRequest: boolean = false): string {
      if (this.isLoggedIn(isCloseShiftRequest)) {
        return localStorage.getItem("username");
      }
    }

    getLoggedInUserFromToken(): string{
      let access_token = localStorage.getItem("token");
      var payLoad = JSON.parse(window.atob(access_token.split('.')[1]));
      return payLoad.unique_name;
    }

    getTokenRefresh(){
      let token = localStorage.getItem("token");
      let body = { expiredToken: token};
      return this.http.post<any>(this.apiURL + "/RefreshToken", body).pipe(
        map(result => {
          if (result && result.token) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('tokenExpiration', result.expiration);
          }
          return <any>result;
        })
      );
    }

  canViewOption(permissionId: string) {
    if (this.isLoggedIn()) {
      let token = this.getToken();
      var payLoad = JSON.parse(window.atob(token.split('.')[1]));
      //console.log("Permiso->"+permissionId, Permissions[permissionId]);
      if (Object.values(payLoad).indexOf("Permiso." + Permissions[permissionId]) > -1) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  hasAreaRestriction() { 
    let token = this.getToken();
    var payLoad = JSON.parse(window.atob(token.split('.')[1]));
    let token_values = Object.values(payLoad);
    if (token_values.indexOf("Permiso." + Permissions.EmpaqueManual) > -1 && token_values.indexOf("Permiso." + Permissions.EmpaqueMecanizado) < 0 && token_values.indexOf("Permiso." + Permissions.EmpaquePouch) < 0  ) {
      return true;
    }
    else if (token_values.indexOf("Permiso." + Permissions.EmpaqueManual) < 0 && token_values.indexOf("Permiso." + Permissions.EmpaqueMecanizado) > -1 && token_values.indexOf("Permiso." + Permissions.EmpaquePouch) < 0  ) {
      return true;
    }
    else if (token_values.indexOf("Permiso." + Permissions.EmpaqueManual) < 0 && token_values.indexOf("Permiso." + Permissions.EmpaqueMecanizado) < 0 && token_values.indexOf("Permiso." + Permissions.EmpaquePouch) > -1  ) {
      return true;
    }
    else {
      return false;
    }
  }

  getAllowedAreas(): number[] {
    let token = this.getToken();
    let payLoad = JSON.parse(window.atob(token.split('.')[1]));
    let token_values: string[] = Object.values<string>(payLoad).filter(v => typeof (v) == "string" && v.startsWith("Permiso."));
    let permissionValues = token_values.map(value => {
      return parseInt(value.substr(value.length - 3));
    });
    return permissionValues;
  }

  showSubMenu(menuOption: string) {
    let menu = (document.anchors.namedItem(menuOption));
    if (menu && menu.getAttribute("aria-expanded").indexOf("true") == -1) {
      menu.setAttribute("aria-expanded", "true");
      menu.click();
    }
  }

    
}
