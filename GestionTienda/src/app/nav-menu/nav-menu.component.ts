import { Component, OnInit, Inject, HostListener } from '@angular/core';
import * as $ from 'jquery';
import { AccountService } from '../account/account.service';
import { GlobalService} from '../services/global-service.service';
import { NgSelectConfig } from '@ng-select/ng-select';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { faSpinner} from '@fortawesome/free-solid-svg-icons';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { TableEditableComponent } from '../table-editable/table-editable.component';
@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {
  faPowerOff = faPowerOff;
  faSpinner = faSpinner;
  isMasterDataSync: Boolean = false;
  apiUrl: string = this.baseUrl + "api/Configuration";
  currentApplicationVersion = environment.appVersion;
  isTabOpen: boolean = false;
  constructor(public accountService: AccountService, @Inject('BASE_URL') private baseUrl: string, public globalService: GlobalService, private ngSelectConfig: NgSelectConfig, private toast: ToastrService, private http: HttpClient) { 
    this.ngSelectConfig.notFoundText = 'No se encontraron resultados';
    this.ngSelectConfig.typeToSearchText = '¿Qué deseas buscar?';
  }
  ngOnInit() {
    $(document).ready(function () {
      $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
      });
    });
    if (this.accountService.canViewOption('Etiquetado')){
      let refreshingPage = sessionStorage.getItem("refreshingPage");
      if(refreshingPage){
        if(refreshingPage.indexOf('login') < 0){
            this.globalService.checkForShiftChangeEvent();
            sessionStorage.setItem("refreshingPage","false");
        }
      }
    }
    // if(localStorage.getItem("tabId") != null && window.name != "1"){
    //   this.isTabOpen = true;
    //   this.toast.warning("Ya existe una pestaña con la aplicación abierta!",
    //    "Pestaña duplicada",{
    //     timeOut: 0,
    //     extendedTimeOut: 0,
    //     tapToDismiss: false
    //   });
    // }
    // else{
    //   localStorage.setItem("tabId","1");
    //   window.name = "1";
    // }
  }

  logout() {
    this.accountService.logout();
  }

  isLoggedIn() {
    return this.accountService.isLoggedIn();
  }

  getServer(){
     return this.baseUrl.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    sessionStorage.setItem("refreshingPage", window.location.href);
    // if(window.name == "1"){
    //   localStorage.removeItem("tabId");
    //   window.name = "0"
    // }
  }

  masterDataSync() {
    this.toast.success("La sincronización de datos maestros ha comenzado");
    this.isMasterDataSync = true;
    this.http.get(this.apiUrl + "/updateMasterData").toPromise().then(result => {
      //console.log("resultado sync:", result);
      this.toast.success("Sincronización de datos maestros finalizada")
      this.isMasterDataSync = false;
    }).catch(err => {
      this.isMasterDataSync = false;
      //console.log("Error en sync", err);
    });
   
  }

  showUniqueMenu(menuOption){
    let anchorLinksArray = Array.from(document.anchors); 
    let anchor = anchorLinksArray.find(a=>a.getAttribute("aria-expanded").indexOf("true") != -1 && a.id != menuOption);
    if(anchor){
      anchor.click();
    }
  }

  descargarServicioImpresion(){
    this.http.get(this.apiUrl + "/DownLoadLocalService",{responseType: 'arraybuffer'}).toPromise().then(data =>{
        let file = new Blob([data], { type: 'application/zip' });
        let url = URL.createObjectURL(file); 
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file);
        }
        else {
          //window.open(url);
          this.descargarArchivo(file,"Servicio_local_impresión");
        }
    }); 
  }

  descargarManual(fileName){
    this.globalService.getBlob(this.apiUrl + "/DownLoadManual",{"fileName":fileName}).toPromise().then((blob: Blob) => {
      let file = new Blob([blob], { type: 'application/pdf' });
        let url = URL.createObjectURL(file);
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file);
        }
        else {
          window.location.href = url;
          //this.descargarArchivo(file,"Manual_de_usuario");
        }
    });
  }

  descargarArchivo(blob,fileName){
    let anchor = document.createElement('a');
    let url = (window.webkitURL || window.URL).createObjectURL(blob);
    anchor.download = fileName;
    anchor.href = url;
    anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
    anchor.click();
    URL.revokeObjectURL(url);
  }

}
