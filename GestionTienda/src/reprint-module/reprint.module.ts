
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';

import { ReprintRoutingModule } from './reprint-routing.module';
import { SortablereprintDirective } from './directives/sortablereprint.directive';
import { ReprintIndexComponent } from './reprint-index/reprint-index.component';
import { ReprintConfirmationComponent } from './modals/reprint-confirmation/reprint-confirmation.component';
import { LabelReprintService } from './services/label-reprint.service';





@NgModule({
  declarations: [
    ReprintIndexComponent,
    ReprintConfirmationComponent,
    SortablereprintDirective
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ReprintRoutingModule,
    NgbModule,
    FontAwesomeModule,
    FormsModule,
    NgSelectModule
  ],
  providers:[
    LabelReprintService
  ]
})
export class ReprintModule { }
