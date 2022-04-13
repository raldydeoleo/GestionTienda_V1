import { Directive, EventEmitter, Output, Input } from '@angular/core';
import { ISchedule } from './schedule';

export type SortColumn = keyof ISchedule | '';
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
export class SortScheduleDirective {

  constructor() { }
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable, direction: this.direction });
  }
}
