import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterConfigurationComponent } from './printer-configuration.component';

describe('PrinterConfigurationComponent', () => {
  let component: PrinterConfigurationComponent;
  let fixture: ComponentFixture<PrinterConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrinterConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrinterConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
