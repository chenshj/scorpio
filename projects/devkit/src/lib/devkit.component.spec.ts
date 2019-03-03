import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevkitComponent } from './devkit.component';

describe('DevkitComponent', () => {
  let component: DevkitComponent;
  let fixture: ComponentFixture<DevkitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevkitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevkitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
