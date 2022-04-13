import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: 'datamatrix', loadChildren: () => import('../datamatrix-module/datamatrix.module').then(m => m.DatamatrixModule) },
  { path: 'reprint', loadChildren: () => import('../reprint-module/reprint.module').then(m => m.ReprintModule) }
]; 

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
