import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiquePaymentHistory } from './boutique-payment-history';

describe('BoutiquePaymentHistory', () => {
  let component: BoutiquePaymentHistory;
  let fixture: ComponentFixture<BoutiquePaymentHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiquePaymentHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoutiquePaymentHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
