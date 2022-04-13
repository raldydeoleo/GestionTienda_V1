import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { LoginComponent } from './account/login/login.component';
import { LabelPrintingComponent } from './label-printing/label-printing.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { ProcessComponent } from './process/process.component';
import { ProcessFormComponent } from './process/process-form/process-form.component';
import { ModuleComponent } from './module/module.component';
import { ProductosComponent } from './productos/productos.component'; //COMPONENTE AÑADIDO PARA MOSTRAR LISTADO DE PRODUCTOS
import { SuplidoresComponent } from './suplidores/suplidores.component'; //COMPONENTE AÑADIDO PARA MOSTRAR LISTADO DE SUPLICORES
import { SuplidorFormComponent } from './suplidores/suplidor-form/suplidor-form.component'; //COMPONENTE AÑADIDO PARA MOSTRAR FORMULARIO DE SUPLICORES
import { Productos_ProvComponent } from './productos_prov/productos.component'; //COMPONENTE AÑADIDO PARA MOSTRAR LISTADO DE PRODUCTOS DE LOS PROVEEDORES O SUPLIDORES
import { SpinnerComponent } from './spinner/spinner.component';
import { ShiftComponent } from './shift/shift.component';
import { DeviceComponent } from './device/device.component';
import { ChangeShiftComponent } from './change-shift/change-shift.component';
import { ModalComponent } from './modals/modal/modal.component';
import { ReminderComponent } from './change-shift/reminder/reminder.component';
import { ScheduleFormComponent } from './schedule/schedule-form/schedule-form.component';
import { ShiftFormComponent } from './shift/shift-form/shift-form.component';
import { ModuleFormComponent } from './module/module-form/module-form.component';
import { ProductoFormComponent } from './productos/productos-form/producto-form.component'; //COMPONENETE PARA REGISTRAR PRODUCTOS
import { RepoProductoFormComponent } from './productos/reposicion-form/repo_producto-form.component'; //COMPONENETE PARA REGISTRAR REPOSICION DE  PRODUCTOS
import { Producto_provFormComponent } from './productos_prov/productos_prov-form/producto_prov-form.component'; //COMPONENETE PARA REGISTRAR PRODUCTOS DE PROVEEDORES O SUPLIDORES
import { StorageComponent } from './storage/storage.component';
import { StorageFormComponent } from './storage/storage-form/storage-form.component';
import { TableEditableComponent } from './table-editable/table-editable.component';
import { ConfigurationAppComponent } from './configuration-app/configuration-app.component';
import { ModuleConfirmationComponent } from './modals/module-confirmation/module-confirmation.component';
import { PrinterConfigurationComponent } from './printer-configuration/printer-configuration.component';

import { AccountService } from './account/account.service';
import { AuthGuardService } from './services/auth-guard.service';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { LoaderInterceptor } from './loader.interceptor';
import { LabelService } from './label-printing/label.service';
import { ScheduleService } from './schedule/schedule.service';
import { SpinnerLoaderService} from './services/spinner-loader.service';
import { ProcessService } from './process/process.service';
import { SuplidoresService } from './suplidores/suplidores.service';
import { ModuleService } from './module/module.service';
import { ProductosService } from './productos/productos.service';
import { Productos_ProvService } from './productos_prov/productos.service';
import { ShiftService } from './shift/shift.service';
import { GlobalService } from './services/global-service.service';
import { DeviceService } from './device/device.service';
import { ChangeShiftService } from './change-shift/change-shift.service';
import { ModalService } from './modals/modal/modal.service';
import { StorageService } from './storage/storage.service';
import { ConfigurationService } from './configuration-app/configuration.service';
import { PrinterService } from './printer-configuration/printer.service';
 
import { FormInvalidInputFocusDirective } from './form-invalid-input-focus.directive';
import { SortScheduleDirective } from './schedule/sort-schedule.directive';
import { SortDirective } from './directives/sort.directive';
import { TableViewModeDirective } from './directives/table-view-mode.directive';
import { TableEditModeDirective } from './directives/table-edit-mode.directive';
import { EditableOnEnterDirective } from './directives/editable-on-enter.directive';
import { CustomAdapter, CustomDateParserFormatter } from './services/custom-date.helpers';
import { ReposicionComponent } from './reposicion/reposicion.component';






@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    LoginComponent,
    LabelPrintingComponent,
    ScheduleComponent,
    SpinnerComponent,
    ProcessComponent,
    ProcessFormComponent,
    ModuleComponent,
    ProductosComponent,
    SuplidoresComponent,
    SuplidorFormComponent, //FORMULARIO CREAR SUPLIDOR
    Productos_ProvComponent, // PRODUCTOS DE LOS PROVEEDORES O SUPLIDORES
    RepoProductoFormComponent, //Componente para registrar reposicion de productos
    ShiftComponent,
    DeviceComponent,
    FormInvalidInputFocusDirective,
    ChangeShiftComponent,
    ModalComponent,
    ReminderComponent,    
    ScheduleFormComponent,    
    SortScheduleDirective,
    SortDirective,
    ShiftFormComponent,
    ModuleFormComponent,
    ProductoFormComponent, //FORMULARIO CREAR PRODUCTO   
    Producto_provFormComponent, //FORMULARIO PARA REGISTRAR PRODUCTOS DE LOS PROVEEDORES
    StorageComponent,
    StorageFormComponent,
    TableViewModeDirective,
    TableEditModeDirective,
    TableEditableComponent,
    EditableOnEnterDirective,
    ConfigurationAppComponent,
    ModuleConfirmationComponent,
    PrinterConfigurationComponent,
    ReposicionComponent
  ],
  entryComponents:[
    ModalComponent,
    ModuleConfirmationComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    CommonModule,
    BrowserAnimationsModule,
    NgbModule,
    FormsModule,
    NgSelectModule,
    FontAwesomeModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
      positionClass: 'toast-top-center',
      enableHtml:true,
      timeOut:20000
    }),
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent },
      //{ path: 'label', component: LabelPrintingComponent, canActivate: [AuthGuardService] },
      //{ path: 'schedule', component: ScheduleComponent, canActivate: [AuthGuardService] },
      { path: 'registrar', component: ProductoFormComponent, canActivate: [AuthGuardService] },
      { path: 'verlistado', component: ProductosComponent, canActivate: [AuthGuardService] },
      { path: 'reposicion', component: ScheduleComponent, canActivate: [AuthGuardService] }, 
      //{ path: 'reposicion', component: ReposicionComponent, canActivate: [AuthGuardService] }, 
      { path: 'listadesuplidores', component: SuplidoresComponent, canActivate: [AuthGuardService] }, 
      { path: 'registrarsuplidor', component: SuplidorFormComponent, canActivate: [AuthGuardService] }, 
      //{ path: 'process', component: ProcessComponent, canActivate: [AuthGuardService] },
      //{ path: 'process-edit/:id', component: ProcessFormComponent, canActivate: [AuthGuardService]},
      //{ path: 'process-add', component: ProcessFormComponent, canActivate: [AuthGuardService] },
      //{ path: 'module', component: ModuleComponent, canActivate: [AuthGuardService] },
      //{ path: 'module-edit/:id', component: ModuleFormComponent, canActivate: [AuthGuardService] },
      //{ path: 'module-add', component: ModuleFormComponent, canActivate: [AuthGuardService] },
      { path: 'listadeproductossuplidor', component: Productos_ProvComponent, canActivate: [AuthGuardService] }, //LISTADO DE PRODUCTOS DE PROVEEDORES O  suplidores
      { path: 'suplidor-edit/:id', component: SuplidorFormComponent, canActivate: [AuthGuardService] }, //FORMULARIO DE EDITAR SUPLIDOR suplidor-form
      { path: 'suplidor-add', component: SuplidorFormComponent, canActivate: [AuthGuardService] }, //FORMULARIO DE AGREGAR SUPLIDOR suplidor-form
      { path: 'productos-add', component: ProductoFormComponent, canActivate: [AuthGuardService] }, //FORMULARIO DE AGREGAR PRODUCTOS producto-form
      { path: 'productos_prov-add', component: Producto_provFormComponent, canActivate: [AuthGuardService] }, //FORMULARIO DE AGREGAR PRODUCTOS PROVEEDORES producto_prov-form
      { path: 'productos-edit/:id', component: ProductoFormComponent, canActivate: [AuthGuardService] }, //FORMULARIO DE EDITAR PRODUCTOS producto-form
      { path: 'reponer_producto-edit/:id', component: RepoProductoFormComponent, canActivate: [AuthGuardService] }, //FORMULARIO DE REPOSICION DE PRODUCTOS reponsicion-form      
      { path: 'productos_prov-edit/:id', component: Producto_provFormComponent, canActivate: [AuthGuardService] }, //FORMULARIO DE EDITAR PRODUCTOS PROVEEDORES producto_prov-form
      //{ path: 'shift', component: ShiftComponent, canActivate: [AuthGuardService] },
      //{ path: 'shift-edit/:id', component: ShiftFormComponent, canActivate: [AuthGuardService] },
      //{ path: 'shift-add', component: ShiftFormComponent, canActivate: [AuthGuardService] },
      { path: 'device', component: DeviceComponent, canActivate: [AuthGuardService] },      
      //{ path: 'storage', component: StorageComponent, canActivate: [AuthGuardService] },
      //{ path: 'storage-edit/:id', component: StorageFormComponent, canActivate: [AuthGuardService] },
      //{ path: 'storage-add', component: StorageFormComponent, canActivate: [AuthGuardService] },
      //{ path: 'config-app', component: ConfigurationAppComponent, canActivate: [AuthGuardService] },
      //{ path: 'printer-configuration', component: PrinterConfigurationComponent, canActivate: [AuthGuardService] },
      { path: '', redirectTo: 'login', pathMatch: 'full'},
      { path: 'boxtracklabel', redirectTo: 'login', pathMatch: 'full' }

    ])
  ],
  providers: [
    SpinnerLoaderService,
    AccountService,
    AuthGuardService,
    ProcessService,
    ModuleService,
    ProductosService,
    Productos_ProvService,
    SuplidoresService,
    ShiftService,
    DeviceService,
    ModalService,
    StorageService,
    ConfigurationService,
    CustomAdapter,
    CustomDateParserFormatter,
    PrinterService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    },
    LabelService,
    ScheduleService,
    GlobalService,
    ChangeShiftService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
