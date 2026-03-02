import { TestBed } from '@angular/core/testing';

import { HistoLoyer } from './histo-loyer';

describe('HistoLoyer', () => {
  let service: HistoLoyer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoLoyer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
