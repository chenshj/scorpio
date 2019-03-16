import { Component, OnInit, AfterViewInit, OnDestroy, AfterViewChecked, Input, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ColumnComponent } from '../../shared/components/column.component';
import { Subscription } from 'rxjs';
import { DomHandler } from '../../dom/domhandler';
import { DataGridComponent } from './data-grid.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: '[m-scrollable-view]',
  templateUrl: './scrollable-view.component.html',
  styleUrls: ['./scrollable-view.component.css']
})
export class ScrollableViewComponent implements AfterViewInit, OnDestroy, AfterViewChecked {

  // tslint:disable-next-line:no-input-rename
  @Input('m-scrollable-view') columns: ColumnComponent[];

  @Input() frozen: boolean;

  @ViewChild('scrollHeader') scrollHeaderViewChild: ElementRef;

  @ViewChild('scrollHeaderBox') scrollHeaderBoxViewChild: ElementRef;

  @ViewChild('scrollBody') scrollBodyViewChild: ElementRef;

  @ViewChild('scrollTable') scrollTableViewChild: ElementRef;

  @ViewChild('scrollFooter') scrollFooterViewChild: ElementRef;

  @ViewChild('scrollFooterBox') scrollFooterBoxViewChild: ElementRef;

  @ViewChild('virtualScroller') virtualScrollerViewChild: ElementRef;

  headerScrollListener: () => void;

  bodyScrollListener: () => void;

  footerScrollListener: () => void;

  frozenSiblingBody: Element;

  scrollableSiblingBody: Element;

  // tslint:disable-next-line:variable-name
  _scrollHeight: string;

  subscription: Subscription;

  totalRecordsSubscription: Subscription;

  columnsSubscription: Subscription;

  initialized: boolean;

  constructor(public dataGrid: DataGridComponent, public elementRef: ElementRef, public zone: NgZone) {
    this.subscription = this.dataGrid.dataGridService.valueSource$.subscribe(() => {
      this.zone.runOutsideAngular(() => {
        setTimeout(() => {
          this.alignScrollBar();
        }, 50);
      });
    });

    if (this.dataGrid.virtualScroll) {
      this.totalRecordsSubscription = this.dataGrid.dataGridService.totalRecordsSource$.subscribe(() => {
        this.zone.runOutsideAngular(() => {
          setTimeout(() => {
            this.setVirtualScrollerHeight();
          }, 50);
        });
      });
    }

    this.initialized = false;
  }

  @Input() get scrollHeight(): string {
    return this._scrollHeight;
  }
  set scrollHeight(val: string) {
    this._scrollHeight = val;
    this.setScrollHeight();
  }

  ngAfterViewChecked() {
    if (!this.initialized && this.elementRef.nativeElement.offsetParent) {
      this.alignScrollBar();
      this.setScrollHeight();
      this.initialized = true;
    }
  }

  ngAfterViewInit() {
    if (!this.frozen) {
      if (this.dataGrid.frozenColumns || this.dataGrid.frozenBodyTemplate) {
        DomHandler.addClass(this.elementRef.nativeElement, 'ui-table-unfrozen-view');
      }

      const frozenView = this.elementRef.nativeElement.previousElementSibling;
      if (frozenView) {
        this.frozenSiblingBody = DomHandler.findSingle(frozenView, '.ui-table-scrollable-body');
      }
    } else {
      this.scrollBodyViewChild.nativeElement.style.marginBottom = DomHandler.calculateScrollbarWidth() + 'px';
      const scrollableView = this.elementRef.nativeElement.nextElementSibling;
      if (scrollableView) {
        this.scrollableSiblingBody = DomHandler.findSingle(scrollableView, '.ui-table-scrollable-body');
      }
    }

    this.bindEvents();
    this.setScrollHeight();
    this.alignScrollBar();

    if (this.frozen) {
      this.columnsSubscription = this.dataGrid.dataGridService.columnsSource$.subscribe(() => {
        this.zone.runOutsideAngular(() => {
          setTimeout(() => {
            this.setScrollHeight();
          }, 50);
        });
      });
    }

    if (this.dataGrid.virtualScroll) {
      this.setVirtualScrollerHeight();
    }
  }

  bindEvents() {
    this.zone.runOutsideAngular(() => {
      const scrollBarWidth = DomHandler.calculateScrollbarWidth();

      if (this.scrollHeaderViewChild && this.scrollHeaderViewChild.nativeElement) {
        this.headerScrollListener = this.onHeaderScroll.bind(this);
        this.scrollHeaderBoxViewChild.nativeElement.addEventListener('scroll', this.headerScrollListener);
      }

      if (this.scrollFooterViewChild && this.scrollFooterViewChild.nativeElement) {
        this.footerScrollListener = this.onFooterScroll.bind(this);
        this.scrollFooterViewChild.nativeElement.addEventListener('scroll', this.footerScrollListener);
      }

      if (!this.frozen) {
        this.bodyScrollListener = this.onBodyScroll.bind(this);
        this.scrollBodyViewChild.nativeElement.addEventListener('scroll', this.bodyScrollListener);
      }
    });
  }

  unbindEvents() {
    if (this.scrollHeaderViewChild && this.scrollHeaderViewChild.nativeElement) {
      this.scrollHeaderBoxViewChild.nativeElement.removeEventListener('scroll', this.headerScrollListener);
    }

    if (this.scrollFooterViewChild && this.scrollFooterViewChild.nativeElement) {
      this.scrollFooterViewChild.nativeElement.removeEventListener('scroll', this.footerScrollListener);
    }

    this.scrollBodyViewChild.nativeElement.removeEventListener('scroll', this.bodyScrollListener);
  }

  onHeaderScroll(event) {
    this.scrollHeaderViewChild.nativeElement.scrollLeft = 0;
  }

  onFooterScroll(event) {
    this.scrollFooterViewChild.nativeElement.scrollLeft = 0;
  }

  onBodyScroll(event) {
    if (this.scrollHeaderViewChild && this.scrollHeaderViewChild.nativeElement) {
      this.scrollHeaderBoxViewChild.nativeElement.style.marginLeft = -1 * this.scrollBodyViewChild.nativeElement.scrollLeft + 'px';
    }

    if (this.scrollFooterViewChild && this.scrollFooterViewChild.nativeElement) {
      this.scrollFooterBoxViewChild.nativeElement.style.marginLeft = -1 * this.scrollBodyViewChild.nativeElement.scrollLeft + 'px';
    }

    if (this.frozenSiblingBody) {
      this.frozenSiblingBody.scrollTop = this.scrollBodyViewChild.nativeElement.scrollTop;
    }

    if (this.dataGrid.virtualScroll) {
      const viewport = DomHandler.getOuterHeight(this.scrollBodyViewChild.nativeElement);
      const tableHeight = DomHandler.getOuterHeight(this.scrollTableViewChild.nativeElement);
      const pageHeight = this.dataGrid.virtualRowHeight * this.dataGrid.rows;
      const virtualTableHeight = DomHandler.getOuterHeight(this.virtualScrollerViewChild.nativeElement);
      const pageCount = (virtualTableHeight / pageHeight) || 1;
      const scrollBodyTop = this.scrollTableViewChild.nativeElement.style.top || '0';

      if ((this.scrollBodyViewChild.nativeElement.scrollTop + viewport > parseFloat(scrollBodyTop) + tableHeight) ||
        (this.scrollBodyViewChild.nativeElement.scrollTop < parseFloat(scrollBodyTop))) {
        const page = Math.floor(
          (this.scrollBodyViewChild.nativeElement.scrollTop * pageCount) /
          (this.scrollBodyViewChild.nativeElement.scrollHeight)) + 1;
        this.dataGrid.handleVirtualScroll({
          page,
          callback: () => {
            this.scrollTableViewChild.nativeElement.style.top = ((page - 1) * pageHeight) + 'px';

            if (this.frozenSiblingBody) {
              (this.frozenSiblingBody.children[0] as HTMLElement).style.top = this.scrollTableViewChild.nativeElement.style.top;
            }
          }
        });
      }
    }
  }

  setScrollHeight() {
    if (this.scrollHeight && this.scrollBodyViewChild && this.scrollBodyViewChild.nativeElement) {
      if (this.scrollHeight.indexOf('%') !== -1) {
        let relativeHeight;
        this.scrollBodyViewChild.nativeElement.style.visibility = 'hidden';
        this.scrollBodyViewChild.nativeElement.style.height = '100px';     // temporary height to calculate static height
        const containerHeight = DomHandler.getOuterHeight(this.dataGrid.elementRef.nativeElement.children[0]);

        if (this.scrollHeight.includes('calc')) {
          const percentHeight = parseInt(this.scrollHeight.slice(this.scrollHeight.indexOf('(') + 1, this.scrollHeight.indexOf('%')), 10);
          const diffValue = parseInt(this.scrollHeight.slice(this.scrollHeight.indexOf('-') + 1, this.scrollHeight.indexOf(')')), 10);
          relativeHeight = (DomHandler.getOuterHeight(this.dataGrid.elementRef.nativeElement.parentElement) *
            percentHeight / 100) - diffValue;
        } else {
          relativeHeight = DomHandler.getOuterHeight(this.dataGrid.elementRef.nativeElement.parentElement) *
            parseInt(this.scrollHeight, 10) / 100;
        }

        const staticHeight = containerHeight - 100;   // total height of headers, footers, paginators
        let scrollBodyHeight = (relativeHeight - staticHeight);

        if (this.frozen) {
          scrollBodyHeight -= DomHandler.calculateScrollbarWidth();
        }

        this.scrollBodyViewChild.nativeElement.style.height = 'auto';
        this.scrollBodyViewChild.nativeElement.style.maxHeight = scrollBodyHeight + 'px';
        this.scrollBodyViewChild.nativeElement.style.visibility = 'visible';
      } else {
        if (this.frozen && this.scrollableSiblingBody &&
          DomHandler.getOuterWidth(this.scrollableSiblingBody) < DomHandler.getOuterWidth(this.scrollableSiblingBody.children[0])) {
          this.scrollBodyViewChild.nativeElement.style.maxHeight = (parseInt(this.scrollHeight, 10) -
            DomHandler.calculateScrollbarWidth()) + 'px';
        } else {
          this.scrollBodyViewChild.nativeElement.style.maxHeight = this.scrollHeight;
        }
      }
    }
  }

  setVirtualScrollerHeight() {
    if (this.virtualScrollerViewChild.nativeElement) {
      this.virtualScrollerViewChild.nativeElement.style.height = this.dataGrid.totalRecords * this.dataGrid.virtualRowHeight + 'px';
    }
  }

  hasVerticalOverflow() {
    return DomHandler.getOuterHeight(this.scrollTableViewChild.nativeElement) >
      DomHandler.getOuterHeight(this.scrollBodyViewChild.nativeElement);
  }

  alignScrollBar() {
    if (!this.frozen) {
      const scrollBarWidth = this.hasVerticalOverflow() ? DomHandler.calculateScrollbarWidth() : 0;
      this.scrollHeaderBoxViewChild.nativeElement.style.marginRight = scrollBarWidth + 'px';

      if (this.scrollFooterBoxViewChild && this.scrollFooterBoxViewChild.nativeElement) {
        this.scrollFooterBoxViewChild.nativeElement.style.marginRight = scrollBarWidth + 'px';
      }
    }
    this.initialized = false;
  }

  ngOnDestroy() {
    this.unbindEvents();

    this.frozenSiblingBody = null;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.totalRecordsSubscription) {
      this.totalRecordsSubscription.unsubscribe();
    }

    if (this.columnsSubscription) {
      this.columnsSubscription.unsubscribe();
    }

    this.initialized = false;
  }
}
