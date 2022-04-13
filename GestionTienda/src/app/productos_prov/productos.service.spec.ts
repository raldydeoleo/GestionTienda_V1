import { TestBed } from '@angular/core/testing';
import { Productos_ProvService } from './productos.service';

describe('Productos_ProvService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Productos_ProvService = TestBed.get(Productos_ProvService);
    expect(service).toBeTruthy();
  });
});
