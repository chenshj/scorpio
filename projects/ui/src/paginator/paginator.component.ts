import { Component, OnInit, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { SelectItem } from '../common/selectitem';

@Component({
  selector: 'm-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css']
})
export class PaginatorComponent implements OnInit {
  @Input() pageLinkSize = 5;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onPageChange: EventEmitter<any> = new EventEmitter();

  @Input() style: any;

  @Input() styleClass: string;

  @Input() alwaysShow = true;

  @Input() templateLeft: TemplateRef<any>;

  @Input() templateRight: TemplateRef<any>;

  @Input() dropdownAppendTo: any;

  pageLinks: number[];

  // tslint:disable-next-line:variable-name
  _totalRecords = 0;

  // tslint:disable-next-line:variable-name
  _first = 0;

  // tslint:disable-next-line:variable-name
  _rows = 0;

  // tslint:disable-next-line:variable-name
  _rowsPerPageOptions: number[];

  rowsPerPageItems: SelectItem[];

  paginatorState: any;

  ngOnInit() {
    this.updatePaginatorState();
  }

  @Input() get totalRecords(): number {
    return this._totalRecords;
  }

  set totalRecords(val: number) {
    this._totalRecords = val;
    this.updatePageLinks();
    this.updatePaginatorState();
  }

  @Input() get first(): number {
    return this._first;
  }

  set first(val: number) {
    this._first = val;
    this.updatePageLinks();
    this.updatePaginatorState();
  }

  @Input() get rows(): number {
    return this._rows;
  }

  set rows(val: number) {
    this._rows = val;
    this.updatePageLinks();
    this.updatePaginatorState();
  }

  @Input() get rowsPerPageOptions(): number[] {
    return this._rowsPerPageOptions;
  }

  set rowsPerPageOptions(val: number[]) {
    this._rowsPerPageOptions = val;
    if (this._rowsPerPageOptions) {
      this.rowsPerPageItems = [];
      for (const opt of this._rowsPerPageOptions) {
        this.rowsPerPageItems.push({ label: String(opt), value: opt });
      }
    }
  }

  isFirstPage() {
    return this.getPage() === 0;
  }

  isLastPage() {
    return this.getPage() === this.getPageCount() - 1;
  }

  getPageCount() {
    return Math.ceil(this.totalRecords / this.rows) || 1;
  }

  calculatePageLinkBoundaries() {
    const numberOfPages = this.getPageCount();
    const visiblePages = Math.min(this.pageLinkSize, numberOfPages);

    // calculate range, keep current in middle if necessary
    let start = Math.max(0, Math.ceil(this.getPage() - ((visiblePages) / 2)));
    const end = Math.min(numberOfPages - 1, start + visiblePages - 1);

    // check when approaching to last page
    const delta = this.pageLinkSize - (end - start + 1);
    start = Math.max(0, start - delta);

    return [start, end];
  }

  updatePageLinks() {
    this.pageLinks = [];
    const boundaries = this.calculatePageLinkBoundaries();
    const start = boundaries[0];
    const end = boundaries[1];

    for (let i = start; i <= end; i++) {
      this.pageLinks.push(i + 1);
    }
  }

  changePage(p: number) {
    const pc = this.getPageCount();

    if (p >= 0 && p < pc) {
      this.first = this.rows * p;
      const state = {
        page: p,
        first: this.first,
        rows: this.rows,
        pageCount: pc
      };
      this.updatePageLinks();

      this.onPageChange.emit(state);
      this.updatePaginatorState();
    }
  }

  getPage(): number {
    return Math.floor(this.first / this.rows);
  }

  changePageToFirst(event) {
    if (!this.isFirstPage()) {
      this.changePage(0);
    }

    event.preventDefault();
  }

  changePageToPrev(event) {
    this.changePage(this.getPage() - 1);
    event.preventDefault();
  }

  changePageToNext(event) {
    this.changePage(this.getPage() + 1);
    event.preventDefault();
  }

  changePageToLast(event) {
    if (!this.isLastPage()) {
      this.changePage(this.getPageCount() - 1);
    }

    event.preventDefault();
  }

  onPageLinkClick(event, page) {
    this.changePage(page);
    event.preventDefault();
  }

  onRppChange(event) {
    this.changePage(this.getPage());
  }

  updatePaginatorState() {
    this.paginatorState = {
      page: this.getPage(),
      rows: this.rows,
      first: this.first,
      totalRecords: this.totalRecords
    };
  }
}
