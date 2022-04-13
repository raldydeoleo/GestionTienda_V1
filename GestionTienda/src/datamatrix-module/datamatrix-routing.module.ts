import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { CodeValidationComponent } from './components/code-validation/code-validation.component';
import { EmailConfigComponent } from './components/email-config/email-config.component';
import { OrdersConfigComponent } from './components/orders-config/orders-config.component';
import { OrdersComponent } from './components/orders/orders.component';


const routes: Routes = [
  { path: '', component: OrdersComponent, canActivate: [AuthGuardService] },
  { path: 'code-validation', component:CodeValidationComponent, canActivate:[AuthGuardService] },
  { path: 'orders-config', component:OrdersConfigComponent, canActivate:[AuthGuardService]},
  { path: 'email-config', component:EmailConfigComponent, canActivate:[AuthGuardService]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatamatrixRoutingModule { } 
