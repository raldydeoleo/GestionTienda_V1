import { Directive, HostListener } from '@angular/core';
import { TableEditableComponent } from '../table-editable/table-editable.component';

@Directive({
  selector: '[editableOnEnter]'
})
export class EditableOnEnterDirective {

  constructor(private editable: TableEditableComponent) { }
  @HostListener('keyup.enter')
  onEnter() {
    this.editable.toViewMode();
  }
}
