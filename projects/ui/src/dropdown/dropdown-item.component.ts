import { Component, OnInit, Input, TemplateRef, Output, EventEmitter } from '@angular/core';
import { SelectItem } from '../common/selectitem';

@Component({
  selector: 'm-dropdown-item',
  templateUrl: './dropdown-item.component.html',
  styleUrls: ['./dropdown-item.component.css']
})
export class DropdownItemComponent implements OnInit {

  @Input() option: SelectItem;

  @Input() selected: boolean;

  @Input() disabled: boolean;

  @Input() visible: boolean;

  @Input() itemSize: number;

  @Input() template: TemplateRef<any>;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onClick: EventEmitter<any> = new EventEmitter();

  onOptionClick(event: Event) {
      this.onClick.emit({
          originalEvent: event,
          option: this.option
      });
  }

  constructor() { }

  ngOnInit() {
  }

}
