import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MallAdminSidebar } from './mall-admin-sidebar';

describe('MallAdminSidebar', () => {
  let component: MallAdminSidebar;
  let fixture: ComponentFixture<MallAdminSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MallAdminSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MallAdminSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
