import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGridHeaderCheckboxComponent } from './data-grid-header-checkbox.component';

describe('DataGridHeaderCheckboxComponent', () => {
  let component: DataGridHeaderCheckboxComponent;
  let fixture: ComponentFixture<DataGridHeaderCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataGridHeaderCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataGridHeaderCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
