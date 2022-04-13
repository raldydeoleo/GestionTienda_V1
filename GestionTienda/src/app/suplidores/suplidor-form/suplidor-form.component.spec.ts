import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuplidorFormComponent } from './suplidor-form.component';

describe('SuplidorFormComponent', () => {
  let component: SuplidorFormComponent;
  let fixture: ComponentFixture<SuplidorFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuplidorFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuplidorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
