import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { DatamatrixRoutingModule } from './datamatrix-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrdersComponent } from './components/orders/orders.component';
import {OrderCreateComponent} from './components/modals/orderCreate/orderCreate.component';
import { CodeValidationComponent } from './components/code-validation/code-validation.component';
import { CodeScannerComponent } from './components/code-scanner/code-scanner.component';
import { CodesManagementComponent } from './components/modals/codesManagement/codesManagement.component';

import { OrderService } from './components/orders/order.service';
import { AuthInterceptorService } from 'src/app/services/auth-interceptor.service';

import { SortOrdersDirective } from './components/orders/sort-orders.directive';
import { OrdersConfigComponent } from './components/orders-config/orders-config.component';
import { EmailConfigComponent } from './components/email-config/email-config.component';





@NgModule({
  declarations: [
    OrdersComponent,
    OrderCreateComponent,
    CodesManagementComponent,
    CodeScannerComponent,
    CodeValidationComponent,
    OrdersConfigComponent,
    EmailConfigComponent,
    SortOrdersDirective
  ],
  imports: [
    CommonModule,
    DatamatrixRoutingModule,
    FontAwesomeModule,
    NgbModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
      positionClass: 'toast-top-center',
      enableHtml:true,
      timeOut:20000
    })
    
  ],
  providers: [
    OrderService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ]
})
export class DatamatrixModule { }
