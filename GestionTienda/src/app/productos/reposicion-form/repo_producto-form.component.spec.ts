import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoProductoFormComponent } from './repo_producto-form.component';

describe('ProductoFormComponent', () => {
  let component: RepoProductoFormComponent;
  let fixture: ComponentFixture<RepoProductoFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepoProductoFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepoProductoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
