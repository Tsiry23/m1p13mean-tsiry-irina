import { TestBed } from '@angular/core/testing';

import { BoutiqueService } from './boutique';

describe('Boutique', () => {
  let service: BoutiqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoutiqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
