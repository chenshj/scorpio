import { Directive, Input, HostListener } from '@angular/core';
import { DataGridComponent } from '../components/data-grid.component';

@Directive({
  selector: '[mRowToggler]'
})
export class RowTogglerDirective {

  // tslint:disable-next-line:no-input-rename
  @Input('mRowToggler') data: any;

  @Input() mRowTogglerDisabled: boolean;

  constructor(public dataGrid: DataGridComponent) { }

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    if (this.isEnabled()) {
      this.dataGrid.toggleRow(this.data, event);
      event.preventDefault();
    }
  }

  isEnabled() {
    return this.mRowTogglerDisabled !== true;
  }
}
