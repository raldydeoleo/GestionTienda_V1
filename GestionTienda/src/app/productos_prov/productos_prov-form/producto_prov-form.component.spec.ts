import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Producto_provFormComponent } from './producto_prov-form.component';

describe('Producto_provFormComponent', () => {
  let component: Producto_provFormComponent;
  let fixture: ComponentFixture<Producto_provFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Producto_provFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Producto_provFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
