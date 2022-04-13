import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppNavMenuComponent } from './app-nav-menu.component';

describe('AppNavMenuComponent', () => {
  let component: AppNavMenuComponent;
  let fixture: ComponentFixture<AppNavMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppNavMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppNavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
