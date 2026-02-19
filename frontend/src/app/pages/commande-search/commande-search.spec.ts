import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeSearch } from './commande-search';

describe('CommandeSearch', () => {
  let component: CommandeSearch;
  let fixture: ComponentFixture<CommandeSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
