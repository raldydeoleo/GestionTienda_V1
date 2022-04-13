import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[editMode]'
})
export class TableEditModeDirective {

  constructor(public tpl: TemplateRef<any>) { }

}
