import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReposicionComponent } from './reposicion.component';

describe('ReposicionComponent', () => {
  let component: ReposicionComponent;
  let fixture: ComponentFixture<ReposicionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReposicionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReposicionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
