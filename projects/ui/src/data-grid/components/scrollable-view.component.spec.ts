import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollableViewComponent } from './scrollable-view.component';

describe('ScrollableViewComponent', () => {
  let component: ScrollableViewComponent;
  let fixture: ComponentFixture<ScrollableViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrollableViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
