import { Directive, OnInit, OnDestroy, Input, HostListener, HostBinding } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataGridComponent } from '../components/data-grid.component';
import { DataGridService } from '../services/data-grid.service';
import { DomHandler } from '../../dom/domhandler';

@Directive({
  selector: '[mSelectableRow]'
})
export class SelectableRowDirective implements OnInit, OnDestroy {

  // tslint:disable-next-line:no-input-rename
  @Input('mSelectableRow') data: any;

  // tslint:disable-next-line:no-input-rename
  @Input('mSelectableRowIndex') index: number;

  @Input() mSelectableRowDisabled: boolean;

  selected: boolean;

  subscription: Subscription;

  constructor(public dataGrid: DataGridComponent, public dataGridService: DataGridService) {
    if (this.isEnabled()) {
      this.subscription = this.dataGrid.dataGridService.selectionSource$.subscribe(() => {
        this.selected = this.dataGrid.isSelected(this.data);
      });
    }
  }

  ngOnInit() {
    if (this.isEnabled()) {
      this.selected = this.dataGrid.isSelected(this.data);
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    if (this.isEnabled()) {
      this.dataGrid.handleRowClick({
        originalEvent: event,
        rowData: this.data,
        rowIndex: this.index
      });
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: Event) {
    if (this.isEnabled()) {
      this.dataGrid.handleRowTouchEnd(event);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.isEnabled()) {
      const row = event.target as HTMLTableRowElement;

      switch (event.which) {
        // down arrow
        case 40:
          const nextRow = this.findNextSelectableRow(row);
          if (nextRow) {
            nextRow.focus();
          }

          event.preventDefault();
          break;

        // up arrow
        case 38:
          const prevRow = this.findPrevSelectableRow(row);
          if (prevRow) {
            prevRow.focus();
          }

          event.preventDefault();
          break;

        // enter
        case 13:
          this.dataGrid.handleRowClick({
            originalEvent: event,
            rowData: this.data,
            rowIndex: this.index
          });
          break;

        default:
          // no op
          break;
      }
    }
  }

  @HostBinding('class.ui-selectable-row') get rowSelectable() { return this.isEnabled(); }

  @HostBinding('class.ui-state-highlight') get rowHighlight() { return this.selected; }

  @HostBinding('attr.tabindex') get tabIndex() { return this.isEnabled() ? 0 : undefined; }

  findNextSelectableRow(row: HTMLTableRowElement): HTMLTableRowElement {
    const nextRow = row.nextElementSibling as HTMLTableRowElement;
    if (nextRow) {
      if (DomHandler.hasClass(nextRow, 'ui-selectable-row')) {
        return nextRow;
      } else {
        return this.findNextSelectableRow(nextRow);
      }
    } else {
      return null;
    }
  }

  findPrevSelectableRow(row: HTMLTableRowElement): HTMLTableRowElement {
    const prevRow = row.previousElementSibling as HTMLTableRowElement;
    if (prevRow) {
      if (DomHandler.hasClass(prevRow, 'ui-selectable-row')) {
        return prevRow;
      } else {
        return this.findPrevSelectableRow(prevRow);
      }
    } else {
      return null;
    }
  }

  isEnabled() {
    return this.mSelectableRowDisabled !== true;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
