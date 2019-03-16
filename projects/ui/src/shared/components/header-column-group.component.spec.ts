import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderColumnGroupComponent } from './header-column-group.component';

describe('HeaderColumnGroupComponent', () => {
  let component: HeaderColumnGroupComponent;
  let fixture: ComponentFixture<HeaderColumnGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderColumnGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderColumnGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
