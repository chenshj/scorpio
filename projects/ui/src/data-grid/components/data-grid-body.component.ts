import { Component, OnInit, TemplateRef, Input } from '@angular/core';
import { ColumnComponent } from '../../shared/components/column.component';
import { DataGridComponent } from './data-grid.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: '[m-data-grid-body]',
  templateUrl: './data-grid-body.component.html',
  styleUrls: ['./data-grid-body.component.css']
})
export class DataGridBodyComponent {

  // tslint:disable-next-line:no-input-rename
  @Input('m-data-grid-body') columns: ColumnComponent[];

  // tslint:disable-next-line:no-input-rename
  @Input('m-data-grid-body-template') template: TemplateRef<any>;

  constructor(public dataGrid: DataGridComponent) { }
}
