import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterColumnGroupComponent } from './footer-column-group.component';

describe('FooterColumnGroupComponent', () => {
  let component: FooterColumnGroupComponent;
  let fixture: ComponentFixture<FooterColumnGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterColumnGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterColumnGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
