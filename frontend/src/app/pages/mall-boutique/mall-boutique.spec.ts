import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MallBoutique } from './mall-boutique';

describe('MallBoutique', () => {
  let component: MallBoutique;
  let fixture: ComponentFixture<MallBoutique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MallBoutique]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MallBoutique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
