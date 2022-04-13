import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[viewMode]'
})
export class TableViewModeDirective {

  constructor(public tpl: TemplateRef<any>) { }

}
