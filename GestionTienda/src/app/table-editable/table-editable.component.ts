import { Component, OnInit, ElementRef, Output, ContentChild, EventEmitter } from '@angular/core';
import { TableViewModeDirective } from '../directives/table-view-mode.directive';
import { TableEditModeDirective } from '../directives/table-edit-mode.directive';
import { Subject, fromEvent } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, take, switchMapTo } from 'rxjs/operators';


@UntilDestroy()
@Component({
      selector: 'editable',
      template: `
    <ng-container *ngTemplateOutlet="currentView"></ng-container>
  `
    })
export class TableEditableComponent implements OnInit {
  @Output() update = new EventEmitter();
  @ContentChild(TableViewModeDirective) viewModeTpl: TableViewModeDirective;
  @ContentChild(TableEditModeDirective) editModeTpl: TableEditModeDirective;

  mode: 'view' | 'edit' = 'view';
  editMode = new Subject();
  editMode$ = this.editMode.asObservable();
  constructor(private host: ElementRef) { }

  ngOnInit() {
    this.viewModeHandler();
    this.editModeHandler();
  }

  get currentView() {
    return this.mode === 'view' ? this.viewModeTpl.tpl : this.editModeTpl.tpl;
  }

  private get element() {
    return this.host.nativeElement;
  }

  private viewModeHandler() {
    fromEvent(this.element, 'click').pipe(
      untilDestroyed(this)
    ).subscribe(() => {
      this.mode = 'edit';
      this.editMode.next(true);
    });
  }

  private editModeHandler() {
    const clickOutside$ = fromEvent(document, 'click').pipe(
      filter(({ target }) => this.element.contains(target) === false),
      take(1)
    )

    this.editMode$.pipe(
      switchMapTo(clickOutside$),
      untilDestroyed(this)
    ).subscribe(event => {
      this.update.next();
      this.mode = 'view';
    });
  }

  toViewMode() {
    this.update.next();
    this.mode = 'view';
  }
}
