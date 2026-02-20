import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MallAdminHome } from './mall-admin-home';

describe('MallAdminHome', () => {
  let component: MallAdminHome;
  let fixture: ComponentFixture<MallAdminHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MallAdminHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MallAdminHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
