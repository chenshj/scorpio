import {
  Component, OnInit, Input, AfterViewInit, AfterContentInit,
  EventEmitter, Output, ElementRef, NgZone, ViewChild, ContentChildren,
  QueryList, TemplateRef, OnDestroy
} from '@angular/core';
import { DataGridService } from '../services/data-grid.service';
import { BlockableUI } from '../../common/blockableui';
import { PrimeTemplate } from '../../common/shared';
import { SortMeta } from '../../common/sortmeta';
import { FilterMetadata } from '../../common/filtermetadata';
import { ObjectUtils } from '../../utils/objectutils';
import { DomHandler } from '../../dom/domhandler';
import { TableState } from '../../common/tablestate';

@Component({
  selector: 'm-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss'],
  providers: [DataGridService]
})
export class DataGridComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit, BlockableUI {

  constructor(public elementRef: ElementRef, public zone: NgZone, public dataGridService: DataGridService) { }

  @Input() get value(): any[] {
    return this._value;
  }
  set value(val: any[]) {
    if (this.isStateful() && !this.stateRestored) {
      this.restoreState();
    }

    this._value = val;

    if (!this.lazy) {
      this.totalRecords = (this._value ? this._value.length : 0);

      if (this.sortMode === 'single' && this.sortField) {
        this.sortSingle();
      } else if (this.sortMode === 'multiple' && this.multiSortMeta) {
        this.sortMultiple();
      } else if (this.hasFilter()) {       // sort already filters
        this._filter();
      }
    }

    if (this.virtualScroll && this.virtualScrollCallback) {
      this.virtualScrollCallback();
    }

    this.dataGridService.onValueChange(val);
  }

  @Input() get columns(): any[] {
    return this._columns;
  }
  set columns(cols: any[]) {
    this._columns = cols;
    this.dataGridService.onColumnsChange(cols);

    if (this._columns && this.isStateful() && this.reorderableColumns && !this.columnOrderStateRestored) {
      this.restoreColumnOrder();
    }
  }

  @Input() get totalRecords(): number {
    return this._totalRecords;
  }
  set totalRecords(val: number) {
    this._totalRecords = val;
    this.dataGridService.onTotalRecordsChange(this._totalRecords);
  }

  @Input() get sortField(): string {
    return this._sortField;
  }

  set sortField(val: string) {
    this._sortField = val;

    // avoid triggering lazy load prior to lazy initialization at onInit
    if (!this.lazy || this.initialized) {
      if (this.sortMode === 'single') {
        this.sortSingle();
      }
    }
  }

  @Input() get sortOrder(): number {
    return this._sortOrder;
  }
  set sortOrder(val: number) {
    this._sortOrder = val;

    // avoid triggering lazy load prior to lazy initialization at onInit
    if (!this.lazy || this.initialized) {
      if (this.sortMode === 'single') {
        this.sortSingle();
      }
    }
  }

  @Input() get multiSortMeta(): SortMeta[] {
    return this._multiSortMeta;
  }

  set multiSortMeta(val: SortMeta[]) {
    this._multiSortMeta = val;
    if (this.sortMode === 'multiple') {
      this.sortMultiple();
    }
  }

  @Input() get selection(): any {
    return this._selection;
  }

  set selection(val: any) {
    this._selection = val;

    if (!this.preventSelectionSetterPropagation) {
      this.updateSelectionKeys();
      this.dataGridService.onSelectionChange();
    }
    this.preventSelectionSetterPropagation = false;
  }

  @Input() frozenColumns: any[];

  @Input() frozenValue: any[];

  @Input() style: any;

  @Input() styleClass: string;

  @Input() tableStyle: any;

  @Input() tableStyleClass: string;

  @Input() paginator: boolean;

  @Input() rows: number;

  @Input() first = 0;

  @Input() pageLinks = 5;

  @Input() rowsPerPageOptions: number[];

  @Input() alwaysShowPaginator = true;

  @Input() paginatorPosition = 'bottom';

  @Input() paginatorDropdownAppendTo: any;

  @Input() defaultSortOrder = 1;

  @Input() sortMode = 'single';

  @Input() resetPageOnSort = true;

  @Input() selectionMode: string;

  @Output() selectionChange: EventEmitter<any> = new EventEmitter();

  @Input() contextMenuSelection: any;

  @Output() contextMenuSelectionChange: EventEmitter<any> = new EventEmitter();

  @Input() contextMenuSelectionMode = 'separate';

  @Input() dataKey: string;

  @Input() metaKeySelection: boolean;

  @Input() lazy = false;

  @Input() lazyLoadOnInit = true;

  @Input() compareSelectionBy = 'deepEquals';

  @Input() csvSeparator = ',';

  @Input() exportFilename = 'download';

  @Input() filters: { [s: string]: FilterMetadata; } = {};

  @Input() globalFilterFields: string[];

  @Input() filterDelay = 300;

  @Input() expandedRowKeys: { [s: string]: number; } = {};

  @Input() rowExpandMode = 'multiple';

  @Input() scrollable: boolean;

  @Input() scrollHeight: string;

  @Input() virtualScroll: boolean;

  @Input() virtualScrollDelay = 150;

  @Input() virtualRowHeight = 28;

  @Input() frozenWidth: string;

  @Input() responsive: boolean;

  @Input() contextMenu: any;

  @Input() resizableColumns: boolean;

  @Input() columnResizeMode = 'fit';

  @Input() reorderableColumns: boolean;

  @Input() loading: boolean;

  @Input() loadingIcon = 'pi pi-spinner';

  @Input() rowHover: boolean;

  @Input() customSort: boolean;

  @Input() autoLayout: boolean;

  @Input() exportFunction;

  @Input() stateKey: string;

  @Input() stateStorage = 'session';

  @Output() rowSelect: EventEmitter<any> = new EventEmitter();

  @Output() rowUnselect: EventEmitter<any> = new EventEmitter();

  @Output() pageing: EventEmitter<any> = new EventEmitter();

  @Output() sorting: EventEmitter<any> = new EventEmitter();

  @Output() filterring: EventEmitter<any> = new EventEmitter();

  @Output() lazyLoading: EventEmitter<any> = new EventEmitter();

  @Output() rowExpand: EventEmitter<any> = new EventEmitter();

  @Output() rowCollapse: EventEmitter<any> = new EventEmitter();

  @Output() contextMenuSelect: EventEmitter<any> = new EventEmitter();

  @Output() colResize: EventEmitter<any> = new EventEmitter();

  @Output() colReorder: EventEmitter<any> = new EventEmitter();

  @Output() rowReorder: EventEmitter<any> = new EventEmitter();

  @Output() editInit: EventEmitter<any> = new EventEmitter();

  @Output() editComplete: EventEmitter<any> = new EventEmitter();

  @Output() editCancel: EventEmitter<any> = new EventEmitter();

  @Output() headerCheckboxToggle: EventEmitter<any> = new EventEmitter();

  @Output() sortFunction: EventEmitter<any> = new EventEmitter();

  @ViewChild('container') containerViewChild: ElementRef;

  @ViewChild('resizeHelper') resizeHelperViewChild: ElementRef;

  @ViewChild('reorderIndicatorUp') reorderIndicatorUpViewChild: ElementRef;

  @ViewChild('reorderIndicatorDown') reorderIndicatorDownViewChild: ElementRef;

  @ViewChild('table') tableViewChild: ElementRef;

  @ContentChildren(PrimeTemplate) templates: QueryList<PrimeTemplate>;

  // tslint:disable-next-line:variable-name
  _value: any[] = [];

  // tslint:disable-next-line:variable-name
  _columns: any[];

  // tslint:disable-next-line:variable-name
  _totalRecords = 0;

  filteredValue: any[];

  headerTemplate: TemplateRef<any>;

  bodyTemplate: TemplateRef<any>;

  captionTemplate: TemplateRef<any>;

  frozenRowsTemplate: TemplateRef<any>;

  footerTemplate: TemplateRef<any>;

  summaryTemplate: TemplateRef<any>;

  colGroupTemplate: TemplateRef<any>;

  expandedRowTemplate: TemplateRef<any>;

  frozenHeaderTemplate: TemplateRef<any>;

  frozenBodyTemplate: TemplateRef<any>;

  frozenFooterTemplate: TemplateRef<any>;

  frozenColGroupTemplate: TemplateRef<any>;

  emptyMessageTemplate: TemplateRef<any>;

  paginatorLeftTemplate: TemplateRef<any>;

  paginatorRightTemplate: TemplateRef<any>;

  selectionKeys: any = {};

  lastResizerHelperX: number;

  reorderIconWidth: number;

  reorderIconHeight: number;

  draggedColumn: any;

  draggedRowIndex: number;

  droppedRowIndex: number;

  rowDragging: boolean;

  dropPosition: number;

  editingCell: Element;

  editingCellClick: boolean;

  documentEditListener: any;

  // tslint:disable-next-line:variable-name
  _multiSortMeta: SortMeta[];

  // tslint:disable-next-line:variable-name
  _sortField: string;

  // tslint:disable-next-line:variable-name
  _sortOrder = 1;

  virtualScrollTimer: any;

  virtualScrollCallback: () => void;

  preventSelectionSetterPropagation: boolean;

  // tslint:disable-next-line:variable-name
  _selection: any;

  anchorRowIndex: number;

  rangeRowIndex: number;

  filterTimeout: any;

  initialized: boolean;

  rowTouched: boolean;

  restoringSort: boolean;

  restoringFilter: boolean;

  stateRestored: boolean;

  columnOrderStateRestored: boolean;

  columnWidthsState: string;

  tableWidthState: string;

  filterConstraints = {

    startsWith(value, filter): boolean {
      if (filter === undefined || filter === null || filter.trim() === '') {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      const filterValue = ObjectUtils.removeAccents(filter.toString()).toLowerCase();
      const stringValue = ObjectUtils.removeAccents(value.toString()).toLowerCase();

      return stringValue.slice(0, filterValue.length) === filterValue;
    },

    contains(value, filter): boolean {
      if (filter === undefined || filter === null || (typeof filter === 'string' && filter.trim() === '')) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      const filterValue = ObjectUtils.removeAccents(filter.toString()).toLowerCase();
      const stringValue = ObjectUtils.removeAccents(value.toString()).toLowerCase();

      return stringValue.indexOf(filterValue) !== -1;
    },

    endsWith(value, filter): boolean {
      if (filter === undefined || filter === null || filter.trim() === '') {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      const filterValue = ObjectUtils.removeAccents(filter.toString()).toLowerCase();
      const stringValue = ObjectUtils.removeAccents(value.toString()).toLowerCase();

      return stringValue.indexOf(filterValue, stringValue.length - filterValue.length) !== -1;
    },

    equals(value, filter): boolean {
      if (filter === undefined || filter === null || (typeof filter === 'string' && filter.trim() === '')) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      if (value.getTime && filter.getTime) {
        return value.getTime() === filter.getTime();
      } else {
        return ObjectUtils.removeAccents(value.toString()).toLowerCase() === ObjectUtils.removeAccents(filter.toString()).toLowerCase();
      }
    },

    notEquals(value, filter): boolean {
      if (filter === undefined || filter === null || (typeof filter === 'string' && filter.trim() === '')) {
        return false;
      }

      if (value === undefined || value === null) {
        return true;
      }

      if (value.getTime && filter.getTime) {
        return value.getTime() !== filter.getTime();
      } else {
        return ObjectUtils.removeAccents(value.toString()).toLowerCase() !== ObjectUtils.removeAccents(filter.toString()).toLowerCase();
      }
    },

    in(value, filter: any[]): boolean {
      if (filter === undefined || filter === null || filter.length === 0) {
        return true;
      }

      for (const item of filter) {
        if (item === value || (value != null && (value.getTime && item.getTime && value.getTime() === item.getTime()))) {
          return true;
        }
      }

      return false;
    },

    lt(value, filter): boolean {
      if (filter === undefined || filter === null) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      if (value.getTime && filter.getTime) {
        return value.getTime() < filter.getTime();
      } else {
        return value < filter;
      }
    },

    lte(value, filter): boolean {
      if (filter === undefined || filter === null) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      if (value.getTime && filter.getTime) {
        return value.getTime() <= filter.getTime();
      } else {
        return value <= filter;
      }
    },

    gt(value, filter): boolean {
      if (filter === undefined || filter === null) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      if (value.getTime && filter.getTime) {
        return value.getTime() > filter.getTime();
      } else {
        return value > filter;
      }
    },

    gte(value, filter): boolean {
      if (filter === undefined || filter === null) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      if (value.getTime && filter.getTime) {
        return value.getTime() >= filter.getTime();
      } else {
        return value >= filter;
      }
    }
  };

  @Input() rowTrackBy = (index: number, item: any) => item;

  ngOnInit() {
    if (this.lazy && this.lazyLoadOnInit) {
      this.lazyLoading.emit(this.createLazyLoadMetadata());
    }

    this.initialized = true;
  }

  ngAfterContentInit() {
    this.templates.forEach((item) => {
      switch (item.getType()) {
        case 'caption':
          this.captionTemplate = item.template;
          break;

        case 'header':
          this.headerTemplate = item.template;
          break;

        case 'body':
          this.bodyTemplate = item.template;
          break;

        case 'footer':
          this.footerTemplate = item.template;
          break;

        case 'summary':
          this.summaryTemplate = item.template;
          break;

        case 'colgroup':
          this.colGroupTemplate = item.template;
          break;

        case 'rowexpansion':
          this.expandedRowTemplate = item.template;
          break;

        case 'frozenrows':
          this.frozenRowsTemplate = item.template;
          break;

        case 'frozenheader':
          this.frozenHeaderTemplate = item.template;
          break;

        case 'frozenbody':
          this.frozenBodyTemplate = item.template;
          break;

        case 'frozenfooter':
          this.frozenFooterTemplate = item.template;
          break;

        case 'frozencolgroup':
          this.frozenColGroupTemplate = item.template;
          break;

        case 'emptymessage':
          this.emptyMessageTemplate = item.template;
          break;

        case 'paginatorleft':
          this.paginatorLeftTemplate = item.template;
          break;

        case 'paginatorright':
          this.paginatorRightTemplate = item.template;
          break;
      }
    });
  }

  ngAfterViewInit() {
    if (this.isStateful() && this.resizableColumns) {
      this.restoreColumnWidths();
    }
  }

  updateSelectionKeys() {
    if (this.dataKey && this._selection) {
      this.selectionKeys = {};
      if (Array.isArray(this._selection)) {
        for (const data of this._selection) {
          this.selectionKeys[String(ObjectUtils.resolveFieldData(data, this.dataKey))] = 1;
        }
      } else {
        this.selectionKeys[String(ObjectUtils.resolveFieldData(this._selection, this.dataKey))] = 1;
      }
    }
  }

  onPageChange(event) {
    this.first = event.first;
    this.rows = event.rows;

    if (this.lazy) {
      this.lazyLoading.emit(this.createLazyLoadMetadata());
    }

    this.pageing.emit({
      first: this.first,
      rows: this.rows
    });

    this.dataGridService.onValueChange(this.value);

    if (this.isStateful()) {
      this.saveState();
    }
  }

  sort(event) {
    const originalEvent = event.originalEvent;

    if (this.sortMode === 'single') {
      this._sortOrder = (this.sortField === event.field) ? this.sortOrder * -1 : this.defaultSortOrder;
      this._sortField = event.field;
      this.sortSingle();
    }
    if (this.sortMode === 'multiple') {
      const metaKey = originalEvent.metaKey || originalEvent.ctrlKey;
      const sortMeta = this.getSortMeta(event.field);

      if (sortMeta) {
        if (!metaKey) {
          this._multiSortMeta = [{ field: event.field, order: sortMeta.order * -1 }];
        } else {
          sortMeta.order = sortMeta.order * -1;
        }
      } else {
        if (!metaKey || !this.multiSortMeta) {
          this._multiSortMeta = [];
        }
        this.multiSortMeta.push({ field: event.field, order: this.defaultSortOrder });
      }

      this.sortMultiple();
    }

    if (this.isStateful()) {
      this.saveState();
    }
  }

  sortSingle() {
    if (this.sortField && this.sortOrder) {
      if (this.restoringSort) {
        this.restoringSort = false;
      } else if (this.resetPageOnSort) {
        this.first = 0;
      }

      if (this.lazy) {
        this.lazyLoading.emit(this.createLazyLoadMetadata());
      } else if (this.value) {
        if (this.customSort) {
          this.sortFunction.emit({
            data: this.value,
            mode: this.sortMode,
            field: this.sortField,
            order: this.sortOrder
          });
        } else {
          this.value.sort((data1, data2) => {
            const value1 = ObjectUtils.resolveFieldData(data1, this.sortField);
            const value2 = ObjectUtils.resolveFieldData(data2, this.sortField);
            let result = null;

            if (value1 == null && value2 != null) {
              result = -1;
            } else if (value1 != null && value2 == null) {
              result = 1;
            } else if (value1 == null && value2 == null) {
              result = 0;
            } else if (typeof value1 === 'string' && typeof value2 === 'string') {
              result = value1.localeCompare(value2);
            } else {
              result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
            }

            return (this.sortOrder * result);
          });
        }

        if (this.hasFilter()) {
          this._filter();
        }
      }

      const sortMeta: SortMeta = {
        field: this.sortField,
        order: this.sortOrder
      };

      this.sorting.emit(sortMeta);
      this.dataGridService.onSort(sortMeta);
    }
  }

  sortMultiple() {
    if (this.multiSortMeta) {
      if (this.lazy) {
        this.lazyLoading.emit(this.createLazyLoadMetadata());
      } else if (this.value) {
        if (this.customSort) {
          this.sortFunction.emit({
            data: this.value,
            mode: this.sortMode,
            multiSortMeta: this.multiSortMeta
          });
        } else {
          this.value.sort((data1, data2) => {
            return this.multisortField(data1, data2, this.multiSortMeta, 0);
          });
        }

        if (this.hasFilter()) {
          this._filter();
        }
      }

      this.sorting.emit({
        multisortmeta: this.multiSortMeta
      });
      this.dataGridService.onSort(this.multiSortMeta);
    }
  }

  multisortField(data1, data2, multiSortMeta, index) {
    const value1 = ObjectUtils.resolveFieldData(data1, multiSortMeta[index].field);
    const value2 = ObjectUtils.resolveFieldData(data2, multiSortMeta[index].field);
    let result = null;

    if (value1 == null && value2 != null) {
      result = -1;
    } else if (value1 != null && value2 == null) {
      result = 1;
    } else if (value1 == null && value2 == null) {
      result = 0;
    }
    if (typeof value1 === 'string' || value1 instanceof String) {
      if (value1.localeCompare && (value1 !== value2)) {
        return (multiSortMeta[index].order * value1.localeCompare(value2));
      }
    } else {
      result = (value1 < value2) ? -1 : 1;
    }

    if (value1 === value2) {
      return (multiSortMeta.length - 1) > (index) ? (this.multisortField(data1, data2, multiSortMeta, index + 1)) : 0;
    }

    return (multiSortMeta[index].order * result);
  }

  getSortMeta(field: string) {
    if (this.multiSortMeta && this.multiSortMeta.length) {
      for (const meta of this.multiSortMeta) {
        if (meta.field === field) {
          return meta;
        }
      }
    }

    return null;
  }

  isSorted(field: string) {
    if (this.sortMode === 'single') {
      return (this.sortField && this.sortField === field);
    } else if (this.sortMode === 'multiple') {
      let sorted = false;
      if (this.multiSortMeta) {
        for (const meta of this.multiSortMeta) {
          if (meta.field === field) {
            sorted = true;
            break;
          }
        }
      }
      return sorted;
    }
  }

  handleRowClick(event) {
    const target = (event.originalEvent.target as HTMLElement);
    const targetNode = target.nodeName;
    const parentNode = target.parentElement.nodeName;
    if (targetNode === 'INPUT' || targetNode === 'BUTTON' || targetNode === 'A' ||
      parentNode === 'INPUT' || parentNode === 'BUTTON' || parentNode === 'A' ||
      (DomHandler.hasClass(event.originalEvent.target, 'ui-clickable'))) {
      return;
    }

    if (this.selectionMode) {
      this.preventSelectionSetterPropagation = true;
      if (this.isMultipleSelectionMode() && event.originalEvent.shiftKey && this.anchorRowIndex != null) {
        DomHandler.clearSelection();
        if (this.rangeRowIndex != null) {
          this.clearSelectionRange(event.originalEvent);
        }

        this.rangeRowIndex = event.rowIndex;
        this.selectRange(event.originalEvent, event.rowIndex);
      } else {
        const rowData = event.rowData;
        const selected = this.isSelected(rowData);
        const metaSelection = this.rowTouched ? false : this.metaKeySelection;
        const dataKeyValue = this.dataKey ? String(ObjectUtils.resolveFieldData(rowData, this.dataKey)) : null;
        this.anchorRowIndex = event.rowIndex;
        this.rangeRowIndex = event.rowIndex;

        if (metaSelection) {
          const metaKey = event.originalEvent.metaKey || event.originalEvent.ctrlKey;

          if (selected && metaKey) {
            if (this.isSingleSelectionMode()) {
              this._selection = null;
              this.selectionKeys = {};
              this.selectionChange.emit(null);
            } else {
              const selectionIndex = this.findIndexInSelection(rowData);
              this._selection = this.selection.filter((val, i) => i !== selectionIndex);
              this.selectionChange.emit(this.selection);
              if (dataKeyValue) {
                delete this.selectionKeys[dataKeyValue];
              }
            }

            this.rowUnselect.emit({ originalEvent: event.originalEvent, data: rowData, type: 'row' });
          } else {
            if (this.isSingleSelectionMode()) {
              this._selection = rowData;
              this.selectionChange.emit(rowData);
              if (dataKeyValue) {
                this.selectionKeys = {};
                this.selectionKeys[dataKeyValue] = 1;
              }
            } else if (this.isMultipleSelectionMode()) {
              if (metaKey) {
                this._selection = this.selection || [];
              } else {
                this._selection = [];
                this.selectionKeys = {};
              }

              this._selection = [...this.selection, rowData];
              this.selectionChange.emit(this.selection);
              if (dataKeyValue) {
                this.selectionKeys[dataKeyValue] = 1;
              }
            }

            this.rowSelect.emit({ originalEvent: event.originalEvent, data: rowData, type: 'row', index: event.rowIndex });
          }
        } else {
          if (this.selectionMode === 'single') {
            if (selected) {
              this._selection = null;
              this.selectionKeys = {};
              this.selectionChange.emit(this.selection);
              this.rowUnselect.emit({ originalEvent: event.originalEvent, data: rowData, type: 'row' });
            } else {
              this._selection = rowData;
              this.selectionChange.emit(this.selection);
              this.rowSelect.emit({ originalEvent: event.originalEvent, data: rowData, type: 'row', index: event.rowIndex });
              if (dataKeyValue) {
                this.selectionKeys = {};
                this.selectionKeys[dataKeyValue] = 1;
              }
            }
          } else if (this.selectionMode === 'multiple') {
            if (selected) {
              const selectionIndex = this.findIndexInSelection(rowData);
              this._selection = this.selection.filter((val, i) => i !== selectionIndex);
              this.selectionChange.emit(this.selection);
              this.rowUnselect.emit({ originalEvent: event.originalEvent, data: rowData, type: 'row' });
              if (dataKeyValue) {
                delete this.selectionKeys[dataKeyValue];
              }
            } else {
              this._selection = this.selection ? [...this.selection, rowData] : [rowData];
              this.selectionChange.emit(this.selection);
              this.rowSelect.emit({ originalEvent: event.originalEvent, data: rowData, type: 'row', index: event.rowIndex });
              if (dataKeyValue) {
                this.selectionKeys[dataKeyValue] = 1;
              }
            }
          }
        }
      }

      this.dataGridService.onSelectionChange();

      if (this.isStateful()) {
        this.saveState();
      }
    }

    this.rowTouched = false;
  }

  handleRowTouchEnd(event) {
    this.rowTouched = true;
  }

  handleRowRightClick(event) {
    if (this.contextMenu) {
      const rowData = event.rowData;

      if (this.contextMenuSelectionMode === 'separate') {
        this.contextMenuSelection = rowData;
        this.contextMenuSelectionChange.emit(rowData);
        this.contextMenuSelect.emit({ originalEvent: event.originalEvent, data: rowData, index: event.rowIndex });
        this.contextMenu.show(event.originalEvent);
        this.dataGridService.onContextMenu(rowData);
      } else if (this.contextMenuSelectionMode === 'joint') {
        this.preventSelectionSetterPropagation = true;
        const selected = this.isSelected(rowData);
        const dataKeyValue = this.dataKey ? String(ObjectUtils.resolveFieldData(rowData, this.dataKey)) : null;

        if (!selected) {
          if (this.isSingleSelectionMode()) {
            this.selection = rowData;
            this.selectionChange.emit(rowData);
          } else if (this.isMultipleSelectionMode()) {
            this.selection = [rowData];
            this.selectionChange.emit(this.selection);
          }

          if (dataKeyValue) {
            this.selectionKeys[dataKeyValue] = 1;
          }
        }

        this.contextMenu.show(event.originalEvent);
        this.contextMenuSelect.emit({ originalEvent: event, data: rowData, index: event.rowIndex });
      }
    }
  }

  selectRange(event: MouseEvent, rowIndex: number) {
    let rangeStart;
    let rangeEnd;

    if (this.anchorRowIndex > rowIndex) {
      rangeStart = rowIndex;
      rangeEnd = this.anchorRowIndex;
    } else if (this.anchorRowIndex < rowIndex) {
      rangeStart = this.anchorRowIndex;
      rangeEnd = rowIndex;
    } else {
      rangeStart = rowIndex;
      rangeEnd = rowIndex;
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      const rangeRowData = this.filteredValue ? this.filteredValue[i] : this.value[i];
      if (!this.isSelected(rangeRowData)) {
        this._selection = [...this.selection, rangeRowData];
        const dataKeyValue: string = this.dataKey ? String(ObjectUtils.resolveFieldData(rangeRowData, this.dataKey)) : null;
        if (dataKeyValue) {
          this.selectionKeys[dataKeyValue] = 1;
        }
        this.rowSelect.emit({ originalEvent: event, data: rangeRowData, type: 'row' });
      }
    }

    this.selectionChange.emit(this.selection);
  }

  clearSelectionRange(event: MouseEvent) {
    let rangeStart;
    let rangeEnd;

    if (this.rangeRowIndex > this.anchorRowIndex) {
      rangeStart = this.anchorRowIndex;
      rangeEnd = this.rangeRowIndex;
    } else if (this.rangeRowIndex < this.anchorRowIndex) {
      rangeStart = this.rangeRowIndex;
      rangeEnd = this.anchorRowIndex;
    } else {
      rangeStart = this.rangeRowIndex;
      rangeEnd = this.rangeRowIndex;
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      const rangeRowData = this.value[i];
      const selectionIndex = this.findIndexInSelection(rangeRowData);
      this._selection = this.selection.filter((val, index) => index !== selectionIndex);
      const dataKeyValue: string = this.dataKey ? String(ObjectUtils.resolveFieldData(rangeRowData, this.dataKey)) : null;
      if (dataKeyValue) {
        delete this.selectionKeys[dataKeyValue];
      }
      this.rowUnselect.emit({ originalEvent: event, data: rangeRowData, type: 'row' });
    }
  }

  isSelected(rowData) {
    if (rowData && this.selection) {
      if (this.dataKey) {
        return this.selectionKeys[ObjectUtils.resolveFieldData(rowData, this.dataKey)] !== undefined;
      } else {
        if (this.selection instanceof Array) {
          return this.findIndexInSelection(rowData) > -1;
        } else {
          return this.equals(rowData, this.selection);
        }
      }
    }

    return false;
  }

  findIndexInSelection(rowData: any) {
    let index = -1;
    if (this.selection && this.selection.length) {
      for (let i = 0; i < this.selection.length; i++) {
        if (this.equals(rowData, this.selection[i])) {
          index = i;
          break;
        }
      }
    }

    return index;
  }

  toggleRowWithRadio(event: any, rowData: any) {
    this.preventSelectionSetterPropagation = true;

    if (this.selection !== rowData) {
      this._selection = rowData;
      this.selectionChange.emit(this.selection);
      this.rowSelect.emit({ originalEvent: event.originalEvent, index: event.rowIndex, data: rowData, type: 'radiobutton' });

      if (this.dataKey) {
        this.selectionKeys = {};
        this.selectionKeys[String(ObjectUtils.resolveFieldData(rowData, this.dataKey))] = 1;
      }
    } else {
      this._selection = null;
      this.selectionChange.emit(this.selection);
      this.rowUnselect.emit({ originalEvent: event.originalEvent, index: event.rowIndex, data: rowData, type: 'radiobutton' });
    }

    this.dataGridService.onSelectionChange();

    if (this.isStateful()) {
      this.saveState();
    }
  }

  toggleRowWithCheckbox(event, rowData: any) {
    this.selection = this.selection || [];
    const selected = this.isSelected(rowData);
    const dataKeyValue = this.dataKey ? String(ObjectUtils.resolveFieldData(rowData, this.dataKey)) : null;
    this.preventSelectionSetterPropagation = true;

    if (selected) {
      const selectionIndex = this.findIndexInSelection(rowData);
      this._selection = this.selection.filter((val, i) => i !== selectionIndex);
      this.selectionChange.emit(this.selection);
      this.rowUnselect.emit({ originalEvent: event.originalEvent, index: event.rowIndex, data: rowData, type: 'checkbox' });
      if (dataKeyValue) {
        delete this.selectionKeys[dataKeyValue];
      }
    } else {
      this._selection = this.selection ? [...this.selection, rowData] : [rowData];
      this.selectionChange.emit(this.selection);
      this.rowSelect.emit({ originalEvent: event.originalEvent, index: event.rowIndex, data: rowData, type: 'checkbox' });
      if (dataKeyValue) {
        this.selectionKeys[dataKeyValue] = 1;
      }
    }

    this.dataGridService.onSelectionChange();

    if (this.isStateful()) {
      this.saveState();
    }
  }

  toggleRowsWithCheckbox(event: Event, check: boolean) {
    this._selection = check ? this.filteredValue ? this.filteredValue.slice() : this.value.slice() : [];
    this.preventSelectionSetterPropagation = true;
    this.updateSelectionKeys();
    this.selectionChange.emit(this._selection);
    this.dataGridService.onSelectionChange();
    this.headerCheckboxToggle.emit({ originalEvent: event, checked: check });

    if (this.isStateful()) {
      this.saveState();
    }
  }

  equals(data1, data2) {
    return this.compareSelectionBy === 'equals' ? (data1 === data2) : ObjectUtils.equals(data1, data2, this.dataKey);
  }

  filter(value, field, matchMode) {
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }

    if (!this.isFilterBlank(value)) {
      this.filters[field] = { value, matchMode };
    } else if (this.filters[field]) {
      delete this.filters[field];
    }

    this.filterTimeout = setTimeout(() => {
      this._filter();
      this.filterTimeout = null;
    }, this.filterDelay);
  }

  filterGlobal(value, matchMode) {
    this.filter(value, 'global', matchMode);
  }

  isFilterBlank(filter: any): boolean {
    if (filter !== null && filter !== undefined) {
      if ((typeof filter === 'string' && filter.trim().length === 0) || (filter instanceof Array && filter.length === 0)) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  _filter() {
    if (this.lazy) {
      this.lazyLoading.emit(this.createLazyLoadMetadata());
    } else {
      if (!this.value) {
        return;
      }

      if (!this.hasFilter()) {
        this.filteredValue = null;
        if (this.paginator) {
          this.totalRecords = this.value ? this.value.length : 0;
        }
      } else {
        let globalFilterFieldsArray;
        if (this.filters.global) {
          if (!this.columns && !this.globalFilterFields) {
            throw new Error('Global filtering requires dynamic columns or globalFilterFields to be defined.');
          } else {
            globalFilterFieldsArray = this.globalFilterFields || this.columns;
          }
        }

        this.filteredValue = [];

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.value.length; i++) {
          let localMatch = true;
          let globalMatch = false;
          let localFiltered = false;

          for (const prop in this.filters) {
            if (this.filters.hasOwnProperty(prop) && prop !== 'global') {
              localFiltered = true;
              const filterMeta = this.filters[prop];
              const filterField = prop;
              const filterValue = filterMeta.value;
              const filterMatchMode = filterMeta.matchMode || 'startsWith';
              const dataFieldValue = ObjectUtils.resolveFieldData(this.value[i], filterField);
              const filterConstraint = this.filterConstraints[filterMatchMode];

              if (!filterConstraint(dataFieldValue, filterValue)) {
                localMatch = false;
              }

              if (!localMatch) {
                break;
              }
            }
          }

          if (this.filters.global && !globalMatch && globalFilterFieldsArray) {
            for (const item of globalFilterFieldsArray) {
              const globalFilterField = item.field || item;
              globalMatch = this.filterConstraints[this.filters.global.matchMode](
                ObjectUtils.resolveFieldData(this.value[i], globalFilterField),
                this.filters.global.value
              );

              if (globalMatch) {
                break;
              }
            }
          }

          let matches: boolean;
          if (this.filters.global) {
            matches = localFiltered ? (localFiltered && localMatch && globalMatch) : globalMatch;
          } else {
            matches = localFiltered && localMatch;
          }

          if (matches) {
            this.filteredValue.push(this.value[i]);
          }
        }

        if (this.filteredValue.length === this.value.length) {
          this.filteredValue = null;
        }

        if (this.paginator) {
          this.totalRecords = this.filteredValue ? this.filteredValue.length : this.value ? this.value.length : 0;
        }
      }
    }

    this.filterring.emit({
      filters: this.filters,
      filteredValue: this.filteredValue || this.value
    });

    this.dataGridService.onValueChange(this.value);

    if (this.isStateful() && !this.restoringFilter) {
      this.saveState();
    }

    if (this.restoringFilter) {
      this.restoringFilter = false;
    } else {
      this.first = 0;
    }

  }

  hasFilter() {
    let empty = true;
    for (const prop in this.filters) {
      if (this.filters.hasOwnProperty(prop)) {
        empty = false;
        break;
      }
    }

    return !empty;
  }

  createLazyLoadMetadata(): any {
    return {
      first: this.first,
      rows: this.virtualScroll ? this.rows * 2 : this.rows,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      filters: this.filters,
      globalFilter: this.filters && this.filters.global ? this.filters.global.value : null,
      multiSortMeta: this.multiSortMeta
    };
  }

  public reset() {
    this._sortField = null;
    this._sortOrder = this.defaultSortOrder;
    this._multiSortMeta = null;
    this.dataGridService.onSort(null);

    this.filteredValue = null;
    this.filters = {};

    this.first = 0;

    if (this.lazy) {
      this.lazyLoading.emit(this.createLazyLoadMetadata());
    } else {
      this.totalRecords = (this._value ? this._value.length : 0);
    }
  }

  public exportCSV(options?: any) {
    let data = this.filteredValue || this.value;
    let csv = '\ufeff';

    if (options && options.selectionOnly) {
      data = this.selection || [];
    }

    // headers
    for (let i = 0; i < this.columns.length; i++) {
      const column = this.columns[i];
      if (column.exportable !== false && column.field) {
        csv += '"' + (column.header || column.field) + '"';

        if (i < (this.columns.length - 1)) {
          csv += this.csvSeparator;
        }
      }
    }

    // body
    data.forEach((record) => {
      csv += '\n';
      for (let i = 0; i < this.columns.length; i++) {
        const column = this.columns[i];
        if (column.exportable !== false && column.field) {
          let cellData = ObjectUtils.resolveFieldData(record, column.field);

          if (cellData != null) {
            if (this.exportFunction) {
              cellData = this.exportFunction({
                data: cellData,
                field: column.field
              });
            } else {
              cellData = String(cellData).replace(/"/g, '""');
            }
          } else {
            cellData = '';
          }


          csv += '"' + cellData + '"';

          if (i < (this.columns.length - 1)) {
            csv += this.csvSeparator;
          }
        }
      }
    });

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, this.exportFilename + '.csv');
    } else {
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      if (link.download !== undefined) {
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', this.exportFilename + '.csv');
        link.click();
      } else {
        csv = 'data:text/csv;charset=utf-8,' + csv;
        window.open(encodeURI(csv));
      }
      document.body.removeChild(link);
    }
  }

  updateEditingCell(cell) {
    this.editingCell = cell;
    this.bindDocumentEditListener();
  }

  isEditingCellValid() {
    return (this.editingCell && DomHandler.find(this.editingCell, '.ng-invalid.ng-dirty').length === 0);
  }

  bindDocumentEditListener() {
    if (!this.documentEditListener) {
      this.documentEditListener = (event) => {
        if (this.editingCell && !this.editingCellClick && this.isEditingCellValid()) {
          DomHandler.removeClass(this.editingCell, 'ui-editing-cell');
          this.editingCell = null;
          this.unbindDocumentEditListener();
        }

        this.editingCellClick = false;
      };

      document.addEventListener('click', this.documentEditListener);
    }
  }

  unbindDocumentEditListener() {
    if (this.documentEditListener) {
      document.removeEventListener('click', this.documentEditListener);
      this.documentEditListener = null;
    }
  }

  toggleRow(rowData: any, event?: Event) {
    if (!this.dataKey) {
      throw new Error('dataKey must be defined to use row expansion');
    }

    const dataKeyValue = String(ObjectUtils.resolveFieldData(rowData, this.dataKey));

    if (this.expandedRowKeys[dataKeyValue] != null) {
      delete this.expandedRowKeys[dataKeyValue];
      this.rowCollapse.emit({
        originalEvent: event,
        data: rowData
      });
    } else {
      if (this.rowExpandMode === 'single') {
        this.expandedRowKeys = {};
      }

      this.expandedRowKeys[dataKeyValue] = 1;
      this.rowExpand.emit({
        originalEvent: event,
        data: rowData
      });
    }

    if (event) {
      event.preventDefault();
    }

    if (this.isStateful()) {
      this.saveState();
    }
  }

  isRowExpanded(rowData: any): boolean {
    return this.expandedRowKeys[String(ObjectUtils.resolveFieldData(rowData, this.dataKey))] === 1;
  }

  isSingleSelectionMode() {
    return this.selectionMode === 'single';
  }

  isMultipleSelectionMode() {
    return this.selectionMode === 'multiple';
  }

  onColumnResizeBegin(event) {
    const containerLeft = DomHandler.getOffset(this.containerViewChild.nativeElement).left;
    this.lastResizerHelperX = (event.pageX - containerLeft + this.containerViewChild.nativeElement.scrollLeft);
    event.preventDefault();
  }

  onColumnResize(event) {
    const containerLeft = DomHandler.getOffset(this.containerViewChild.nativeElement).left;
    DomHandler.addClass(this.containerViewChild.nativeElement, 'ui-unselectable-text');
    this.resizeHelperViewChild.nativeElement.style.height = this.containerViewChild.nativeElement.offsetHeight + 'px';
    this.resizeHelperViewChild.nativeElement.style.top = 0 + 'px';
    this.resizeHelperViewChild.nativeElement.style.left = (
      event.pageX - containerLeft + this.containerViewChild.nativeElement.scrollLeft) + 'px';

    this.resizeHelperViewChild.nativeElement.style.display = 'block';
  }

  onColumnResizeEnd(event, column) {
    let delta = this.resizeHelperViewChild.nativeElement.offsetLeft - this.lastResizerHelperX;
    const columnWidth = column.offsetWidth;
    const minWidth = parseInt(column.style.minWidth || 15, 10);

    if (columnWidth + delta < minWidth) {
      delta = minWidth - columnWidth;
    }

    const newColumnWidth = columnWidth + delta;

    if (newColumnWidth >= minWidth) {
      if (this.columnResizeMode === 'fit') {
        let nextColumn = column.nextElementSibling;
        while (!nextColumn.offsetParent) {
          nextColumn = nextColumn.nextElementSibling;
        }

        if (nextColumn) {
          const nextColumnWidth = nextColumn.offsetWidth - delta;
          const nextColumnMinWidth = nextColumn.style.minWidth || 15;

          if (newColumnWidth > 15 && nextColumnWidth > parseInt(nextColumnMinWidth, 10)) {
            if (this.scrollable) {
              const scrollableView = this.findParentScrollableView(column);
              const scrollableBodyTable = DomHandler.findSingle(scrollableView, 'table.ui-table-scrollable-body-table');
              const scrollableHeaderTable = DomHandler.findSingle(scrollableView, 'table.ui-table-scrollable-header-table');
              const scrollableFooterTable = DomHandler.findSingle(scrollableView, 'table.ui-table-scrollable-footer-table');
              const resizeColumnIndex = DomHandler.index(column);

              this.resizeColGroup(scrollableHeaderTable, resizeColumnIndex, newColumnWidth, nextColumnWidth);
              this.resizeColGroup(scrollableBodyTable, resizeColumnIndex, newColumnWidth, nextColumnWidth);
              this.resizeColGroup(scrollableFooterTable, resizeColumnIndex, newColumnWidth, nextColumnWidth);
            } else {
              column.style.width = newColumnWidth + 'px';
              if (nextColumn) {
                nextColumn.style.width = nextColumnWidth + 'px';
              }
            }
          }
        }
      } else if (this.columnResizeMode === 'expand') {
        if (newColumnWidth > minWidth) {
          if (this.scrollable) {
            const scrollableView = this.findParentScrollableView(column);
            const scrollableBodyTable = DomHandler.findSingle(scrollableView, 'table.ui-table-scrollable-body-table');
            const scrollableHeaderTable = DomHandler.findSingle(scrollableView, 'table.ui-table-scrollable-header-table');
            const scrollableFooterTable = DomHandler.findSingle(scrollableView, 'table.ui-table-scrollable-footer-table');
            scrollableBodyTable.style.width = scrollableBodyTable.offsetWidth + delta + 'px';
            scrollableHeaderTable.style.width = scrollableHeaderTable.offsetWidth + delta + 'px';
            if (scrollableFooterTable) {
              scrollableFooterTable.style.width = scrollableHeaderTable.offsetWidth + delta + 'px';
            }
            const resizeColumnIndex = DomHandler.index(column);

            this.resizeColGroup(scrollableHeaderTable, resizeColumnIndex, newColumnWidth, null);
            this.resizeColGroup(scrollableBodyTable, resizeColumnIndex, newColumnWidth, null);
            this.resizeColGroup(scrollableFooterTable, resizeColumnIndex, newColumnWidth, null);
          } else {
            this.tableViewChild.nativeElement.style.width = this.tableViewChild.nativeElement.offsetWidth + delta + 'px';
            column.style.width = newColumnWidth + 'px';
            const containerWidth = this.tableViewChild.nativeElement.style.width;
            this.containerViewChild.nativeElement.style.width = containerWidth + 'px';
          }
        }
      }

      this.colResize.emit({
        element: column,
        delta
      });

      if (this.isStateful()) {
        this.saveState();
      }
    }

    this.resizeHelperViewChild.nativeElement.style.display = 'none';
    DomHandler.removeClass(this.containerViewChild.nativeElement, 'ui-unselectable-text');
  }

  findParentScrollableView(column) {
    if (column) {
      let parent = column.parentElement;
      while (parent && !DomHandler.hasClass(parent, 'ui-table-scrollable-view')) {
        parent = parent.parentElement;
      }

      return parent;
    } else {
      return null;
    }
  }

  resizeColGroup(table, resizeColumnIndex, newColumnWidth, nextColumnWidth) {
    if (table) {
      const colGroup = table.children[0].nodeName === 'COLGROUP' ? table.children[0] : null;

      if (colGroup) {
        const col = colGroup.children[resizeColumnIndex];
        const nextCol = col.nextElementSibling;
        col.style.width = newColumnWidth + 'px';

        if (nextCol && nextColumnWidth) {
          nextCol.style.width = nextColumnWidth + 'px';
        }
      } else {
        throw new Error('Scrollable tables require a colgroup to support resizable columns');
      }
    }
  }

  onColumnDragStart(event, columnElement) {
    this.reorderIconWidth = DomHandler.getHiddenElementOuterWidth(this.reorderIndicatorUpViewChild.nativeElement);
    this.reorderIconHeight = DomHandler.getHiddenElementOuterHeight(this.reorderIndicatorDownViewChild.nativeElement);
    this.draggedColumn = columnElement;
    event.dataTransfer.setData('text', 'b');    // For firefox
  }

  onColumnDragEnter(event, dropHeader) {
    if (this.reorderableColumns && this.draggedColumn && dropHeader) {
      event.preventDefault();
      const containerOffset = DomHandler.getOffset(this.containerViewChild.nativeElement);
      const dropHeaderOffset = DomHandler.getOffset(dropHeader);

      if (this.draggedColumn !== dropHeader) {
        const dragIndex = DomHandler.indexWithinGroup(this.draggedColumn, 'preorderablecolumn');
        const dropIndex = DomHandler.indexWithinGroup(dropHeader, 'preorderablecolumn');
        const targetLeft = dropHeaderOffset.left - containerOffset.left;
        const targetTop = containerOffset.top - dropHeaderOffset.top;
        const columnCenter = dropHeaderOffset.left + dropHeader.offsetWidth / 2;

        this.reorderIndicatorUpViewChild.nativeElement.style.top = dropHeaderOffset.top - containerOffset.top -
          (this.reorderIconHeight - 1) + 'px';
        this.reorderIndicatorDownViewChild.nativeElement.style.top = dropHeaderOffset.top - containerOffset.top +
          dropHeader.offsetHeight + 'px';

        if (event.pageX > columnCenter) {
          this.reorderIndicatorUpViewChild.nativeElement.style.left = (targetLeft + dropHeader.offsetWidth -
            Math.ceil(this.reorderIconWidth / 2)) + 'px';
          this.reorderIndicatorDownViewChild.nativeElement.style.left = (targetLeft + dropHeader.offsetWidth -
            Math.ceil(this.reorderIconWidth / 2)) + 'px';
          this.dropPosition = 1;
        } else {
          this.reorderIndicatorUpViewChild.nativeElement.style.left = (targetLeft - Math.ceil(this.reorderIconWidth / 2)) + 'px';
          this.reorderIndicatorDownViewChild.nativeElement.style.left = (targetLeft - Math.ceil(this.reorderIconWidth / 2)) + 'px';
          this.dropPosition = -1;
        }

        if ((dropIndex - dragIndex === 1 && this.dropPosition === -1) || (dropIndex - dragIndex === -1 && this.dropPosition === 1)) {
          this.reorderIndicatorUpViewChild.nativeElement.style.display = 'none';
          this.reorderIndicatorDownViewChild.nativeElement.style.display = 'none';
        } else {
          this.reorderIndicatorUpViewChild.nativeElement.style.display = 'block';
          this.reorderIndicatorDownViewChild.nativeElement.style.display = 'block';
        }
      } else {
        event.dataTransfer.dropEffect = 'none';
      }
    }
  }

  onColumnDragLeave(event) {
    if (this.reorderableColumns && this.draggedColumn) {
      event.preventDefault();
      this.reorderIndicatorUpViewChild.nativeElement.style.display = 'none';
      this.reorderIndicatorDownViewChild.nativeElement.style.display = 'none';
    }
  }

  onColumnDrop(event, dropColumn) {
    event.preventDefault();
    if (this.draggedColumn) {
      const dragIndex = DomHandler.indexWithinGroup(this.draggedColumn, 'preorderablecolumn');
      let dropIndex = DomHandler.indexWithinGroup(dropColumn, 'preorderablecolumn');
      let allowDrop = (dragIndex !== dropIndex);
      if (allowDrop && (
        (dropIndex - dragIndex === 1 && this.dropPosition === -1) || (dragIndex - dropIndex === 1 && this.dropPosition === 1))
      ) {
        allowDrop = false;
      }

      if (allowDrop && ((dropIndex < dragIndex && this.dropPosition === 1))) {
        dropIndex = dropIndex + 1;
      }

      if (allowDrop && ((dropIndex > dragIndex && this.dropPosition === -1))) {
        dropIndex = dropIndex - 1;
      }

      if (allowDrop) {
        ObjectUtils.reorderArray(this.columns, dragIndex, dropIndex);

        this.colReorder.emit({
          dragIndex,
          dropIndex,
          columns: this.columns
        });

        if (this.isStateful()) {
          this.saveState();
        }
      }

      this.reorderIndicatorUpViewChild.nativeElement.style.display = 'none';
      this.reorderIndicatorDownViewChild.nativeElement.style.display = 'none';
      this.draggedColumn.draggable = false;
      this.draggedColumn = null;
      this.dropPosition = null;
    }
  }

  onRowDragStart(event, index) {
    this.rowDragging = true;
    this.draggedRowIndex = index;
    event.dataTransfer.setData('text', 'b');    // For firefox
  }

  onRowDragOver(event, index, rowElement) {
    if (this.rowDragging && this.draggedRowIndex !== index) {
      const rowY = DomHandler.getOffset(rowElement).top + DomHandler.getWindowScrollTop();
      const pageY = event.pageY;
      const rowMidY = rowY + DomHandler.getOuterHeight(rowElement) / 2;
      const prevRowElement = rowElement.previousElementSibling;

      if (pageY < rowMidY) {
        DomHandler.removeClass(rowElement, 'ui-table-dragpoint-bottom');

        this.droppedRowIndex = index;
        if (prevRowElement) {
          DomHandler.addClass(prevRowElement, 'ui-table-dragpoint-bottom');
        } else {
          DomHandler.addClass(rowElement, 'ui-table-dragpoint-top');
        }
      } else {
        if (prevRowElement) {
          DomHandler.removeClass(prevRowElement, 'ui-table-dragpoint-bottom');
        } else {
          DomHandler.addClass(rowElement, 'ui-table-dragpoint-top');
        }

        this.droppedRowIndex = index + 1;
        DomHandler.addClass(rowElement, 'ui-table-dragpoint-bottom');
      }
    }
  }

  onRowDragLeave(event, rowElement) {
    const prevRowElement = rowElement.previousElementSibling;
    if (prevRowElement) {
      DomHandler.removeClass(prevRowElement, 'ui-table-dragpoint-bottom');
    }

    DomHandler.removeClass(rowElement, 'ui-table-dragpoint-bottom');
    DomHandler.removeClass(rowElement, 'ui-table-dragpoint-top');
  }

  onRowDragEnd(event) {
    this.rowDragging = false;
    this.draggedRowIndex = null;
    this.droppedRowIndex = null;
  }

  onRowDrop(event, rowElement) {
    if (this.droppedRowIndex != null) {
      const dropIndex = (this.draggedRowIndex > this.droppedRowIndex) ?
        this.droppedRowIndex : (this.droppedRowIndex === 0) ? 0 : this.droppedRowIndex - 1;
      ObjectUtils.reorderArray(this.value, this.draggedRowIndex, dropIndex);

      this.rowReorder.emit({
        dragIndex: this.draggedRowIndex,
        dropIndex: this.droppedRowIndex
      });
    }
    // cleanup
    this.onRowDragLeave(event, rowElement);
    this.onRowDragEnd(event);
  }

  handleVirtualScroll(event) {
    this.first = (event.page - 1) * this.rows;
    this.virtualScrollCallback = event.callback;

    this.zone.run(() => {
      if (this.virtualScrollTimer) {
        clearTimeout(this.virtualScrollTimer);
      }

      this.virtualScrollTimer = setTimeout(() => {
        this.lazyLoading.emit(this.createLazyLoadMetadata());
      }, this.virtualScrollDelay);
    });
  }

  isEmpty() {
    const data = this.filteredValue || this.value;
    return data == null || data.length === 0;
  }

  getBlockableElement(): HTMLElement {
    return this.elementRef.nativeElement.children[0];
  }

  getStorage() {
    switch (this.stateStorage) {
      case 'local':
        return window.localStorage;

      case 'session':
        return window.sessionStorage;

      default:
        throw new Error(this.stateStorage + ' is not a valid value for the state storage, supported values are "local" and "session".');
    }
  }

  isStateful() {
    return this.stateKey != null;
  }

  saveState() {
    const storage = this.getStorage();
    const state: TableState = {};

    if (this.paginator) {
      state.first = this.first;
      state.rows = this.rows;
    }

    if (this.sortField) {
      state.sortField = this.sortField;
      state.sortOrder = this.sortOrder;
    }

    if (this.multiSortMeta) {
      state.multiSortMeta = this.multiSortMeta;
    }

    if (this.hasFilter()) {
      state.filters = this.filters;
    }

    if (this.resizableColumns) {
      this.saveColumnWidths(state);
    }

    if (this.reorderableColumns) {
      this.saveColumnOrder(state);
    }

    if (this.selection) {
      state.selection = this.selection;
    }

    if (Object.keys(this.expandedRowKeys).length) {
      state.expandedRowKeys = this.expandedRowKeys;
    }

    if (Object.keys(state).length) {
      storage.setItem(this.stateKey, JSON.stringify(state));
    }
  }

  clearState() {
    const storage = this.getStorage();

    if (this.stateKey) {
      storage.removeItem(this.stateKey);
    }
  }

  restoreState() {
    const storage = this.getStorage();
    const stateString = storage.getItem(this.stateKey);

    if (stateString) {
      const state: TableState = JSON.parse(stateString);

      if (this.paginator) {
        this.first = state.first;
        this.rows = state.rows;
      }

      if (state.sortField) {
        this.restoringSort = true;
        this._sortField = state.sortField;
        this._sortOrder = state.sortOrder;
      }

      if (state.multiSortMeta) {
        this.restoringSort = true;
        this._multiSortMeta = state.multiSortMeta;
      }

      if (state.filters) {
        this.restoringFilter = true;
        this.filters = state.filters;
      }

      if (this.resizableColumns) {
        this.columnWidthsState = state.columnWidths;
        this.tableWidthState = state.tableWidth;
      }

      if (state.expandedRowKeys) {
        this.expandedRowKeys = state.expandedRowKeys;
      }

      if (state.selection) {
        this.selection = state.selection;
      }

      this.stateRestored = true;
    }
  }

  saveColumnWidths(state) {
    const widths = [];
    const headers = DomHandler.find(this.containerViewChild.nativeElement, '.ui-table-thead > tr:first-child > th');
    headers.map(header => widths.push(DomHandler.getOuterWidth(header)));
    state.columnWidths = widths.join(',');

    if (this.columnResizeMode === 'expand') {
      state.tableWidth = this.scrollable ?
        DomHandler.findSingle(this.containerViewChild.nativeElement, '.ui-table-scrollable-header-table').style.width :
        DomHandler.getOuterWidth(this.tableViewChild.nativeElement) + 'px';
    }
  }

  restoreColumnWidths() {
    if (this.columnWidthsState) {
      const widths = this.columnWidthsState.split(',');

      if (this.columnResizeMode === 'expand' && this.tableWidthState) {
        if (this.scrollable) {
          const scrollableBodyTable = DomHandler.findSingle(this.containerViewChild.nativeElement, '.ui-table-scrollable-body-table');
          const scrollableHeaderTable = DomHandler.findSingle(this.containerViewChild.nativeElement, '.ui-table-scrollable-header-table');
          const scrollableFooterTable = DomHandler.findSingle(this.containerViewChild.nativeElement, '.ui-table-scrollable-footer-table');
          scrollableBodyTable.style.width = this.tableWidthState;
          scrollableHeaderTable.style.width = this.tableWidthState;

          if (scrollableFooterTable) {
            scrollableFooterTable.style.width = this.tableWidthState;
          }
        } else {
          this.tableViewChild.nativeElement.style.width = this.tableWidthState;
          this.containerViewChild.nativeElement.style.width = this.tableWidthState;
        }
      }

      if (this.scrollable) {
        const headerCols = DomHandler.find(this.containerViewChild.nativeElement, '.ui-table-scrollable-header-table > colgroup > col');
        const bodyCols = DomHandler.find(this.containerViewChild.nativeElement, '.ui-table-scrollable-body-table > colgroup > col');

        headerCols.map((col, index) => col.style.width = widths[index] + 'px');
        bodyCols.map((col, index) => col.style.width = widths[index] + 'px');
      } else {
        const headers = DomHandler.find(this.tableViewChild.nativeElement, '.ui-table-thead > tr:first-child > th');
        headers.map((header, index) => header.style.width = widths[index] + 'px');
      }
    }
  }

  saveColumnOrder(state) {
    if (this.columns) {
      const columnOrder: string[] = [];
      this.columns.map(column => {
        columnOrder.push(column.field || column.key);
      });

      state.columnOrder = columnOrder;
    }
  }

  restoreColumnOrder() {
    const storage = this.getStorage();
    const stateString = storage.getItem(this.stateKey);
    if (stateString) {
      const state: TableState = JSON.parse(stateString);
      const columnOrder = state.columnOrder;
      if (columnOrder) {
        const reorderedColumns = [];
        columnOrder.map(key => reorderedColumns.push(this.findColumnByKey(key)));
        this.columnOrderStateRestored = true;
        this.columns = reorderedColumns;
      }
    }
  }

  findColumnByKey(key) {
    if (this.columns) {
      for (const col of this.columns) {
        if (col.key === key || col.field === key) {
          return col;
        } else {
          continue;
        }
      }
    } else {
      return null;
    }
  }

  ngOnDestroy() {
    this.unbindDocumentEditListener();
    this.editingCell = null;
    this.initialized = null;
  }
}
