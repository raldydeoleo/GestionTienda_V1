import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QrcancellabelsComponent } from './qrcancellabels.component';

describe('QrcancellabelsComponent', () => {
  let component: QrcancellabelsComponent;
  let fixture: ComponentFixture<QrcancellabelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QrcancellabelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrcancellabelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
