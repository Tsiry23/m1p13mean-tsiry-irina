import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiqueSlider } from './boutique-slider';

describe('BoutiqueSlider', () => {
  let component: BoutiqueSlider;
  let fixture: ComponentFixture<BoutiqueSlider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiqueSlider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoutiqueSlider);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
