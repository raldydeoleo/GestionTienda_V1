import { Injectable, Inject} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SpinnerLoaderService } from './spinner-loader.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, of} from 'rxjs';
import { IShift } from '../shift/shift';
import { Label } from '../label-printing/label';
import { ChangeShiftService } from '../change-shift/change-shift.service';
import { AccountService } from '../account/account.service';
import { ModalService } from '../modals/modal/modal.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { IPrintLabelRequest } from '../label-printing/label.service';

export interface IProduction{
    id: number;
    idProceso: number;
    idTurno: number;
    shift: IShift;
    idModulo: number;
    idProducto: string;
    fechaHoraCierreTurno: Date; 
    fechaHoraAperturaTurno: Date;
    usuarioAperturaTurno: string;
    usuarioCierreTurno: string;
    turnoAbierto: boolean;
    fechaProduccion: Date;
    labels:Label[];
    dataMatrixOrderId:number;
}


@Injectable({
  providedIn: 'root'
})
export class GlobalService{
  constructor(private sanitizer: DomSanitizer, private loaderService: SpinnerLoaderService, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private changeShiftService: ChangeShiftService, private accountService: AccountService, private modalService: ModalService, private router: Router, private toast: ToastrService) {}

  getFileBlob(blob: any, directPrinting: boolean, printerName?:string, isCigarLabel?:boolean) {
    this.loaderService.isLoading.next(true);
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      let a = window.document.createElement('a');
      let _url: string = window.URL.createObjectURL(blob);
      a.href = _url;
      a.target = "_blank";
      let strA: Array<any> = _url.split("/");
      a.download = strA[strA.length - 1] + '.pdf';

      // Append anchor to body.
      document.body.appendChild(a);
      a.click();

      // Remove anchor from body
      document.body.removeChild(a);
    }
    else {
      let fileUrl: any = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
      if (directPrinting) { //To do: remover cuando esté funcionando la nueva función local service
        //this.printUrl(fileUrl.changingThisBreaksApplicationSecurity);
          this.printBlob(blob,printerName,isCigarLabel).toPromise().then().catch(error=>this.toast.error(error.error));
        
      } else {
        this.openUrl(fileUrl.changingThisBreaksApplicationSecurity);
      }
    }
    this.loaderService.isLoading.next(false);
  }

  openUrl(url: string){
     if(url == null) return;
     if(url == undefined) return;
     if(url.trim() == "") return;
     window.open(url,'_blank');
  }

  printUrl(url: string) {
    if (url == null) return;
    if (url == undefined) return;
    if (url.trim() == "") return;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.contentWindow.print();
  }

  getBlob(resourceUrl: string, parms: any = null, directPrintingChecked?:boolean, isCigarLabel?:boolean, request?:IPrintLabelRequest ) {
    if(directPrintingChecked){
      return this.localServicePrint(request,isCigarLabel);
    }
    else{
      if (parms == null) return this.http.get(resourceUrl, { headers: this.crearHeader(), responseType: 'blob' });
      else {
        return this.http.post(resourceUrl, JSON.stringify(parms), { headers: this.crearHeader(), responseType: 'blob' })
      }
    }
    
  } 
  crearHeader(): HttpHeaders{
     return new HttpHeaders({
       "Content-Type": "application/json",
       "Access-Control-Allow-Origin":"*",
       "X-LinkRef": location.href
     });
  }

  printBlob(fileToPrint:Blob, printerName: string, isCigarLabel:boolean):Observable<any>{
    let labelDimensions = isCigarLabel?localStorage.getItem("cigarDimensions"):localStorage.getItem("boxDimensions");
    let formData = new FormData();
    formData.append("file",fileToPrint,"labels.pdf");
    let headers = new HttpHeaders({
      'ApiKey': 'dhcnkrlakn@33#knd++21dsad..sd2as11ssadamv{{]c cdsc'
    });
    //formData.append("labelDimensions",labelDimensions);  
    return this.http.post("http://localhost:9877/api/Printer/PrintFileFromStream",formData, {headers:headers, params:{printerName:printerName, labelConfig:labelDimensions}}); 
  }
  localServicePrint(request:IPrintLabelRequest, isCigarLabel:boolean ):Observable<any>{ //verificar funcionamiento de esta funcion antes de hacer el cambio de lógica
    let labelDimensions = isCigarLabel?localStorage.getItem("cigarDimensions"):localStorage.getItem("boxDimensions");
    let printerName ="";
    if(!isCigarLabel){
      printerName = localStorage.getItem("printer_box");
    }else{
      printerName = localStorage.getItem("printer_cigars");
    }
    request.token = this.accountService.getToken();
    request.apiUrl = this.baseUrl;
    request.printerName = printerName;
    let headers = new HttpHeaders({
      'ApiKey': 'dhcnkrlakn@33#knd++21dsad..sd2as11ssadamv{{]c cdsc'
    });
    let body = {
      labelRequest: request,
      labelConfig: JSON.parse(labelDimensions)
    };
    return this.http.post("http://localhost:9877/api/Printer/PrintFromApi",body,{headers:headers}); 
  }
  verifyPrinterService():Observable<boolean>{
    let headers = new HttpHeaders({
      'ApiKey': 'dhcnkrlakn@33#knd++21dsad..sd2as11ssadamv{{]c cdsc'
    });
    return this.http.get<any[]>("http://localhost:9877/api/Printer", {headers:headers}).pipe(map(()=>true),catchError(()=>of(false))); 
  }

  closeShift(production: IProduction): Observable<any>{
    return this.http.put<IProduction>(this.baseUrl+"api/production/closeshift", production);
  }

  openShift(idProceso: number, idModulo:number, usuarioApertura:string): Observable<HttpResponse<IProduction>>{
    let body = {idProceso: idProceso, idModulo: idModulo, usuarioApertura: usuarioApertura};
    return this.http.post<any>(this.baseUrl+"api/production/openshift", body, {observe: 'response'});
    /* .pipe(
      tap(res => {
        if (res) {
          console.log(res);
            if (res.status === 201) {
            }
        }
      })
    ); */
  }

  checkLocalVersion() {
    let localVersion = localStorage.getItem("version");
    if (localVersion) {
      if (localVersion != environment.appVersion) {
        this.clearLocalData();
      }
    }
    else {
      this.clearLocalData();
    }
  }

  clearLocalData() {
    localStorage.removeItem("production");
    localStorage.removeItem("product");
    localStorage.removeItem("process");
    localStorage.removeItem("module");
  }
  productRegistration(production: IProduction, previousProduct: string): Observable<IProduction>{
    let body = {produccion: production, usuario: this.accountService.getLoggedInUser(), productoPrevio: previousProduct};
    return this.http.put<IProduction>(this.baseUrl+"api/production/registerproduct", body);
  }

  getLocalShift(){
    let localProduction: IProduction;
    let shiftDescription: string;
    localProduction = JSON.parse(localStorage.getItem("production"));
    shiftDescription = localProduction ? localProduction.shift.descripcion: undefined;
    return shiftDescription;
  }
  getProductionDate(){
    let production = JSON.parse(localStorage.getItem("production"));
    if(production){
      let productionDate = production.fechaProduccion;
      let productionDateText = new DatePipe('en-Us').transform(productionDate, 'dd/MM/yyyy');
       return  "( " + productionDateText + " )";
    }
    else{
      return "";
    }
  }
  getLocalProduction(){
    return JSON.parse(localStorage.getItem("production"));
  }

  checkForShiftChangeEvent(){
    let productionObj = this.getLocalProduction();
    if (productionObj) {
      this.getLastShift().toPromise().then(lastShift => {
        let closeDate = this.getCloseShiftDate(productionObj, lastShift);
        this.changeShiftService.setChangeShiftTime(closeDate);
        let MS_PER_MINUTE = 60000;
        let reminderMinutes = 20; //poner en tabla de config.
        let reminderDate = new Date(closeDate.valueOf() - reminderMinutes * MS_PER_MINUTE);
        this.changeShiftService.setChangeShiftReminder(reminderDate, closeDate);
        let reminderChangeOptionMinutes = 5;
        let changeOptionDate = new Date(closeDate.valueOf() - reminderChangeOptionMinutes * MS_PER_MINUTE);
        this.changeShiftService.setChangeShiftOption(changeOptionDate, closeDate);
      });  
    }
  }

  checkForOpenShiftEvent(){
    let productionObj:IProduction = this.getLocalProduction();
    if (productionObj) {
      this.getLastShift().toPromise().then(lastShift => {
        let closeDate = this.getCloseShiftDate(productionObj,lastShift);
        let now = new Date();
        if (now > closeDate) {
          this.closeAndOpenShiftProcess();
        }
      });
    }
  }

  getLastShift(): Observable<IShift>{
    return this.http.get<IShift>(this.baseUrl + "api/Shift/getlastshift");
  }
  getCloseShiftDate(productionObj: IProduction, lastShift:IShift): Date{
    let now = new Date();
    let firstPartDate: Date = now;
    if (productionObj.shift.codigo != lastShift.codigo) {  
      firstPartDate = new Date(productionObj.fechaProduccion);
    } else {
      let fechaProd = new Date(productionObj.fechaProduccion);
      if (fechaProd.getDate() == now.getDate()) {
        firstPartDate.setDate(now.getDate() + 1);
      } 
    }
    let closeHour = productionObj.shift.horaFin;
    let closeHourArray = closeHour.split(":");
    let closeDate = new Date(firstPartDate.getFullYear(),firstPartDate.getMonth(),firstPartDate.getDate(),parseInt(closeHourArray[0]),parseInt(closeHourArray[1]),parseInt(closeHourArray[2],0));
    return closeDate;
  }

  closeAndOpenShiftProcess(){
    let productionObj: IProduction;
    productionObj = this.getLocalProduction();
    let usuario = this.accountService.getLoggedInUser();
    productionObj.usuarioCierreTurno = usuario;
    //this.closeShift(productionObj).subscribe(null,error => console.error(error),
    //()=>{
    //   localStorage.removeItem("production");
    //   localStorage.removeItem("product");
    //   this.router.navigate(['device']);
    //});
    this.closeShift(productionObj).toPromise().then(result => {
      localStorage.removeItem("production");
      localStorage.removeItem("product");
      if (this.accountService.canViewOption('Programacion')) {
        this.router.navigate(['schedule']);
      } else {
        this.router.navigate(['device']);
      }
    });
  }

  refreshProductionObj(productionId: number): Observable<IProduction>{
    return this.http.get<IProduction>(this.baseUrl+"api/production/getproduction/"+productionId);
  }
}
