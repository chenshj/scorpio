import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRadioButtonComponent } from './table-radio-button.component';

describe('TableRadioButtonComponent', () => {
  let component: TableRadioButtonComponent;
  let fixture: ComponentFixture<TableRadioButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableRadioButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableRadioButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
