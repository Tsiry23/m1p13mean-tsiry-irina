import { TestBed } from '@angular/core/testing';

import { Favoris } from './favoris';

describe('Favoris', () => {
  let service: Favoris;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Favoris);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
