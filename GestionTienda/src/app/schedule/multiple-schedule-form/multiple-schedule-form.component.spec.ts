import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleScheduleFormComponent } from './multiple-schedule-form.component';

describe('MultipleScheduleFormComponent', () => {
  let component: MultipleScheduleFormComponent;
  let fixture: ComponentFixture<MultipleScheduleFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleScheduleFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleScheduleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
