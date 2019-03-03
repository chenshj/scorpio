import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataGridComponent } from './data-grid.component';

@Component({
  selector: 'm-sort-icon',
  templateUrl: './sort-icon.component.html',
  styleUrls: ['./sort-icon.component.css']
})
export class SortIconComponent implements OnInit, OnDestroy {

  @Input() field: string;

  @Input() ariaLabel: string;

  @Input() ariaLabelDesc: string;

  @Input() ariaLabelAsc: string;

  subscription: Subscription;

  sortOrder: number;

  constructor(public dataGrid: DataGridComponent) {
    this.subscription = this.dataGrid.dataGridService.sortSource$.subscribe(sortMeta => {
      this.updateSortState();
    });
  }

  ngOnInit() {
    this.updateSortState();
  }

  onClick(event) {
    event.preventDefault();
  }

  updateSortState() {
    if (this.dataGrid.sortMode === 'single') {
      this.sortOrder = this.dataGrid.isSorted(this.field) ? this.dataGrid.sortOrder : 0;
    } else if (this.dataGrid.sortMode === 'multiple') {
      const sortMeta = this.dataGrid.getSortMeta(this.field);
      this.sortOrder = sortMeta ? sortMeta.order : 0;
    }
  }

  get ariaText(): string {
    let text: string;

    switch (this.sortOrder) {
      case 1:
        text = this.ariaLabelAsc;
        break;

      case -1:
        text = this.ariaLabelDesc;
        break;

      default:
        text = this.ariaLabel;
        break;
    }

    return text;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
