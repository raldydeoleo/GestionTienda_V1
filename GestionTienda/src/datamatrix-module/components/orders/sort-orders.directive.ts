import { Directive, EventEmitter, Output, Input } from '@angular/core';
import { IOrder } from './interfaces/order';


export type SortColumn = keyof IOrder | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = { 'asc': 'desc', 'desc': '', '': 'asc' };
export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}
@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction  === "asc"',
    '[class.desc]': 'direction  === "desc"',
    '(click)': 'rotate()'
  }
})
export class SortOrdersDirective {

  constructor() { }
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable, direction: this.direction });
  }
}
