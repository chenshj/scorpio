import { Component, OnInit, Input, ContentChildren, QueryList } from '@angular/core';
import { RowComponent } from './row.component';

@Component({
  selector: 'm-footer',
  template: ''
})
export class FooterComponent {

  @Input() frozen: boolean;

  @ContentChildren(RowComponent) rows: QueryList<any>;

}
