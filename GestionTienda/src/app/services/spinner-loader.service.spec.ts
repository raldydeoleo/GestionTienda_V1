import { TestBed } from '@angular/core/testing';

import { SpinnerLoaderService } from './spinner-loader.service';

describe('SpinnerLoaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpinnerLoaderService = TestBed.get(SpinnerLoaderService);
    expect(service).toBeTruthy();
  });
});
