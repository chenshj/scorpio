import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGridBodyComponent } from './data-grid-body.component';

describe('DataGridBodyComponent', () => {
  let component: DataGridBodyComponent;
  let fixture: ComponentFixture<DataGridBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataGridBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataGridBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
