import { TestBed } from '@angular/core/testing';

import { ChangeShiftService } from './change-shift.service';

describe('ChangeShiftService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChangeShiftService = TestBed.get(ChangeShiftService);
    expect(service).toBeTruthy();
  });
});
