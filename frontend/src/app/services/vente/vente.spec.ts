import { TestBed } from '@angular/core/testing';

import { Vente } from './vente';

describe('Vente', () => {
  let service: Vente;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Vente);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
