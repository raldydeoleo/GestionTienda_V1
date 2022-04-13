import { TestBed } from '@angular/core/testing';
import { SuplidoresService } from './suplidores.service';

describe('SuplidoresService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SuplidoresService = TestBed.get(SuplidoresService);
    expect(service).toBeTruthy();
  });
});
