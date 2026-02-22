import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenteProduits } from './vente-produits';

describe('VenteProduits', () => {
  let component: VenteProduits;
  let fixture: ComponentFixture<VenteProduits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenteProduits]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenteProduits);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
