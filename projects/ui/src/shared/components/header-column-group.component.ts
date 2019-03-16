import { Component, OnInit, Input, ContentChildren, QueryList } from '@angular/core';
import { RowComponent } from './row.component';

@Component({
  selector: 'm-header-column-group',
  template: ''
})
export class HeaderColumnGroupComponent {

  @Input() frozen: boolean;

  @ContentChildren(RowComponent) rows: QueryList<any>;

}
