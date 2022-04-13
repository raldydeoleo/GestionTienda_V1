import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelPrintingComponent } from './label-printing.component';

describe('LabelPrintingComponent', () => {
  let component: LabelPrintingComponent;
  let fixture: ComponentFixture<LabelPrintingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelPrintingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelPrintingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
