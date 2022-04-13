import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuplidoresComponent } from './suplidores.component';

describe('ModuleComponent', () => {
  let component: SuplidoresComponent;
  let fixture: ComponentFixture<SuplidoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuplidoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuplidoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
