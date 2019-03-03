import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGridCheckboxComponent } from './data-grid-checkbox.component';

describe('DataGridCheckboxComponent', () => {
  let component: DataGridCheckboxComponent;
  let fixture: ComponentFixture<DataGridCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataGridCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataGridCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
