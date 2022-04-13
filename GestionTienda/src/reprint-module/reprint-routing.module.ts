import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../app/services/auth-guard.service';
import { ReprintIndexComponent } from './reprint-index/reprint-index.component';


const routes: Routes = [
  // {path:'print',component:ReprintComponent,canActivate:[AuthGuardService]},
  // {path:'',component:ReprintFilterComponent,canActivate:[AuthGuardService]}
  {path:'',component:ReprintIndexComponent,canActivate:[AuthGuardService]}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ReprintRoutingModule { }
