import { Component, OnInit, ContentChildren, QueryList } from '@angular/core';
import { ColumnComponent } from './column.component';

@Component({
  selector: 'm-row',
  template: ''
})
export class RowComponent {

  @ContentChildren(ColumnComponent) columns: QueryList<ColumnComponent>;

}
