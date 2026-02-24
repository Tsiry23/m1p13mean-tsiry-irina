import { TestBed } from '@angular/core/testing';

import { DashboardBoutique } from './dashboard-boutique';

describe('DashboardBoutique', () => {
  let service: DashboardBoutique;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardBoutique);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
