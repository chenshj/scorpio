import { Component, OnInit, TemplateRef, Input } from '@angular/core';
import { Column } from '../../common/shared';
import { DataGridComponent } from './data-grid.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: '[m-data-grid-body]',
  templateUrl: './data-grid-body.component.html',
  styleUrls: ['./data-grid-body.component.css']
})
export class DataGridBodyComponent {

  // tslint:disable-next-line:no-input-rename
  @Input('m-data-grid-body') columns: Column[];

  // tslint:disable-next-line:no-input-rename
  @Input('m-data-grid-body-template') template: TemplateRef<any>;

  constructor(public dataGrid: DataGridComponent) { }
}
