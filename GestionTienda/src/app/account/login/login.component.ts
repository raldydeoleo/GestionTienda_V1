import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AccountService } from '../account.service';
import { Router, ActivatedRoute } from '@angular/router';
import { IUserInfo } from '../user-info';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from 'src/app/services/global-service.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';


@UntilDestroy()
@Component({
      selector: 'app-login',
      templateUrl: './login.component.html',
      styleUrls: ['./login.component.css']
    })
export class LoginComponent implements OnInit {
  formGroup: FormGroup;
  returnUrl: string;
  is403Redirection: boolean;
  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router, private toast: ToastrService, private activatedRoute: ActivatedRoute, private globalService: GlobalService) { }

 
  ngOnInit() {
    this.formGroup = this.fb.group({
      UserName: '',
      Clave: [''] //Validators.pattern(/^([0-9]\d*)?$/)
    });
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '';
    let redirection = this.activatedRoute.snapshot.queryParams['is403Redirection'];
    if (redirection) {
      this.is403Redirection = redirection == "true";
    }
    this.checkIsLoggedIn();
  }

  login() {
    if(this.formGroup.valid){
      let userInfo: IUserInfo = Object.assign({}, this.formGroup.value);
      this.accountService.login(userInfo).pipe(
        untilDestroyed(this)
      ).subscribe(token => this.catchToken(token));
    }
    else{
       this.validateAllFormFields(this.formGroup);
    }
    
  }

  validateAllFormFields(formGroup: FormGroup) {         
    Object.keys(formGroup.controls).forEach(field => {  
      const control = formGroup.get(field);             
      if (control instanceof FormControl) {             
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        
        this.validateAllFormFields(control);           
      }
    });
  }

  //registrarse() {
  //  let userInfo: IUserInfo = Object.assign({}, this.formGroup.value);
  //  this.accountService.create(userInfo).subscribe(token => this.catchToken(token),
  //    error => this.manejarError(error));
  //}

  async catchToken(token) {
    localStorage.setItem('token', token.token);
    localStorage.setItem('tokenExpiration', token.expiration);
    this.permissionRedirect(token.token);
    if (this.accountService.canViewOption('Etiquetado')) {
      this.globalService.checkLocalVersion();
      this.globalService.checkForShiftChangeEvent();
      this.globalService.checkForOpenShiftEvent(); 
    }
    
  }

  permissionRedirect(token) {
    var payLoad = JSON.parse(window.atob(token.split('.')[1]));
    localStorage.setItem('username', payLoad.unique_name);
    localStorage.setItem('rol',payLoad.Rol);
    //console.log(payLoad);
    //console.log("token_values", Object.values(payLoad));
    if (this.returnUrl != '' && this.is403Redirection == false) {
      this.router.navigateByUrl(this.returnUrl);
    }
    else if (Object.values(payLoad).indexOf('Permiso.301') > -1) {
      //this.router.navigate(["schedule"]);
      this.router.navigate(["verlistado"]);
    }
    else if (Object.values(payLoad).indexOf('Permiso.300') > -1) {
      this.router.navigate(["device"]);      
    }
    else if (Object.values(payLoad).indexOf('Permiso.302') > -1){
      this.router.navigate(["config-app"]);
    }
    
  }

  checkIsLoggedIn(){
    if(this.accountService.isLoggedIn()){
      let token = this.accountService.getToken();
      this.permissionRedirect(token);
    }
  }
}
