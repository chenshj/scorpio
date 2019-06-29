import {
  Component, ElementRef, OnInit, AfterViewInit, AfterContentInit, AfterViewChecked,
  OnDestroy, Input, Output, Renderer2, EventEmitter, ContentChildren,
  QueryList, ViewChild, TemplateRef, forwardRef, ChangeDetectorRef, NgZone, HostBinding
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { trigger, state, style, transition, animate, AnimationEvent } from '@angular/animations';
import { SelectItem } from '../common/selectitem';
import { ScorpioTemplateDirective } from '../shared/directives/scorpio-template.directive';
import { DomHandler } from '../dom/domhandler';
import { ObjectUtils } from '../utils/objectutils';

export const DROPDOWN_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DropdownComponent),
  multi: true
};

@Component({
  selector: 'm-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
  animations: [
    trigger('overlayAnimation', [
      state('void', style({
        transform: 'translateY(5%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('void => visible', animate('{{showTransitionParams}}')),
      transition('visible => void', animate('{{hideTransitionParams}}'))
    ])
  ],
  providers: [DROPDOWN_VALUE_ACCESSOR]
})
export class DropdownComponent implements OnInit, AfterViewInit, AfterContentInit, AfterViewChecked, OnDestroy, ControlValueAccessor {

  constructor(public el: ElementRef, public renderer: Renderer2, private cd: ChangeDetectorRef, public zone: NgZone) { }

  @HostBinding('class.ui-inputwrapper-filled') get inputWrapperFilled() { return this.filled; }

  @HostBinding('class.ui-inputwrapper-focus') get inputWrapperFocus() { return this.focus; }

  @Input() get options(): any[] {
    return this._options;
  }

  set options(val: any[]) {
    const opts = this.optionLabel ? ObjectUtils.generateSelectItems(val, this.optionLabel) : val;
    this._options = opts;
    this.optionsToDisplay = this._options;
    this.updateSelectedOption(this.value);
    this.optionsChanged = true;

    if (this.filterValue && this.filterValue.length) {
      this.activateFilter();
    }
  }

  get label(): string {
    return (this.selectedOption ? this.selectedOption.label : null);
  }

  @Input() scrollHeight = '200px';

  @Input() filter: boolean;

  @Input() name: string;

  @Input() style: any;

  @Input() panelStyle: any;

  @Input() styleClass: string;

  @Input() panelStyleClass: string;

  @Input() disabled: boolean;

  @Input() readonly: boolean;

  @Input() autoWidth = true;

  @Input() required: boolean;

  @Input() editable: boolean;

  @Input() appendTo: any;

  @Input() tabindex: number;

  @Input() placeholder: string;

  @Input() filterPlaceholder: string;

  @Input() inputId: string;

  @Input() selectId: string;

  @Input() dataKey: string;

  @Input() filterBy = 'label';

  @Input() autofocus: boolean;

  @Input() resetFilterOnHide = false;

  @Input() dropdownIcon = 'pi pi-chevron-down';

  @Input() optionLabel: string;

  @Input() autoDisplayFirst = true;

  @Input() group: boolean;

  @Input() showClear: boolean;

  @Input() emptyFilterMessage = 'No results found';

  @Input() virtualScroll: boolean;

  @Input() itemSize: number;

  @Input() autoZIndex = true;

  @Input() baseZIndex = 0;

  @Input() showTransitionOptions = '225ms ease-out';

  @Input() hideTransitionOptions = '195ms ease-in';

  @Input() ariaFilterLabel: string;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onFocus: EventEmitter<any> = new EventEmitter();

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onBlur: EventEmitter<any> = new EventEmitter();

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onClick: EventEmitter<any> = new EventEmitter();

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onShow: EventEmitter<any> = new EventEmitter();

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onHide: EventEmitter<any> = new EventEmitter();

  @ViewChild('container', { read: true, static: true }) containerViewChild: ElementRef;

  @ViewChild('filter', { read: true, static: true }) filterViewChild: ElementRef;

  @ViewChild('in', { read: true, static: true }) focusViewChild: ElementRef;

  @ViewChild('editableInput', { read: true, static: true }) editableInputViewChild: ElementRef;

  @ContentChildren(ScorpioTemplateDirective) templates: QueryList<any>;

  overlay: HTMLDivElement;

  itemsWrapper: HTMLDivElement;

  itemTemplate: TemplateRef<any>;

  groupTemplate: TemplateRef<any>;

  selectedItemTemplate: TemplateRef<any>;

  selectedOption: any;

  // tslint:disable-next-line:variable-name
  _options: any[];

  value: any;

  optionsToDisplay: any[];

  hover: boolean;

  focused: boolean;

  filled: boolean;

  overlayVisible: boolean;

  documentClickListener: any;

  optionsChanged: boolean;

  panel: HTMLDivElement;

  dimensionsUpdated: boolean;

  selfClick: boolean;

  itemClick: boolean;

  clearClick: boolean;

  hoveredItem: any;

  selectedOptionUpdated: boolean;

  filterValue: string;

  searchValue: string;

  searchIndex: number;

  searchTimeout: any;

  previousSearchChar: string;

  currentSearchChar: string;

  documentResizeListener: any;

  onModelChange: (value: any) => void;

  onModelTouched: () => void;

  ngAfterContentInit() {
    this.templates.forEach((item) => {
      switch (item.getType()) {
        case 'item':
          this.itemTemplate = item.template;
          break;

        case 'selectedItem':
          this.selectedItemTemplate = item.template;
          break;

        case 'group':
          this.groupTemplate = item.template;
          break;

        default:
          this.itemTemplate = item.template;
          break;
      }
    });
  }

  ngOnInit() {
    this.optionsToDisplay = this.options;
    this.updateSelectedOption(null);
  }

  ngAfterViewInit() {
    if (this.editable) {
      this.updateEditableLabel();
    }

    this.updateDimensions();
  }

  updateEditableLabel(): void {
    if (this.editableInputViewChild && this.editableInputViewChild.nativeElement) {
      this.editableInputViewChild.nativeElement.value = (this.selectedOption ? this.selectedOption.label : this.value || '');
    }
  }

  onItemClick(event) {
    const option = event.option;
    this.itemClick = true;

    if (!option.disabled) {
      this.selectItem(event, option);
      this.focusViewChild.nativeElement.focus();
      this.filled = true;
    }

    setTimeout(() => {
      this.hide();
    }, 150);
  }

  selectItem(event, option) {
    if (this.selectedOption !== option) {
      this.selectedOption = option;
      this.value = option.value;

      this.onModelChange(this.value);
      this.updateEditableLabel();
      this.onChange.emit({
        originalEvent: event.originalEvent,
        value: this.value
      });
    }
  }

  ngAfterViewChecked() {
    if (this.autoWidth && !this.dimensionsUpdated) {
      this.updateDimensions();
    }

    if (this.optionsChanged && this.overlayVisible) {
      this.optionsChanged = false;

      this.zone.runOutsideAngular(() => {
        setTimeout(() => {
          this.updateDimensions();
          this.alignOverlay();
        }, 1);
      });
    }

    if (this.selectedOptionUpdated && this.itemsWrapper) {
      this.updateDimensions();
      const selectedItem = DomHandler.findSingle(this.overlay, 'li.ui-state-highlight');
      if (selectedItem) {
        DomHandler.scrollInView(this.itemsWrapper, DomHandler.findSingle(this.overlay, 'li.ui-state-highlight'));
      }
      this.selectedOptionUpdated = false;
    }
  }

  writeValue(value: any): void {
    if (this.filter) {
      this.resetFilter();
    }

    this.value = value;
    this.updateSelectedOption(value);
    this.updateEditableLabel();
    this.updateFilledState();
    this.cd.markForCheck();
  }

  resetFilter(): void {
    if (this.filterViewChild && this.filterViewChild.nativeElement) {
      this.filterValue = null;
      this.filterViewChild.nativeElement.value = '';
    }

    this.optionsToDisplay = this.options;
  }

  updateSelectedOption(val: any): void {
    this.selectedOption = this.findOption(val, this.optionsToDisplay);
    if (this.autoDisplayFirst && !this.placeholder && !this.selectedOption &&
      this.optionsToDisplay && this.optionsToDisplay.length && !this.editable) {
      this.selectedOption = this.optionsToDisplay[0];
    }
    this.selectedOptionUpdated = true;
  }

  registerOnChange(fn: () => void): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }

  setDisabledState(val: boolean): void {
    this.disabled = val;
  }

  updateDimensions() {
    if (this.autoWidth && this.el.nativeElement && this.el.nativeElement.children[0] && this.el.nativeElement.offsetParent) {
      const select = DomHandler.findSingle(this.el.nativeElement, 'select');
      if (select && !this.style || (this.style && (!this.style.width && !this.style['min-width']))) {
        this.el.nativeElement.children[0].style.width = select.offsetWidth + 30 + 'px';
      }
      this.dimensionsUpdated = true;
    }
  }

  onMouseclick(event) {
    if (this.disabled || this.readonly) {
      return;
    }

    this.onClick.emit(event);

    this.selfClick = true;
    this.clearClick = DomHandler.hasClass(event.target, 'ui-dropdown-clear-icon');

    if (!this.itemClick && !this.clearClick) {
      this.focusViewChild.nativeElement.focus();

      if (this.overlayVisible) {
        this.hide();
      } else {
        this.show();

        setTimeout(() => {
          if (this.filterViewChild !== undefined) {
            this.filterViewChild.nativeElement.focus();
          }
        }, 200);
      }
    }
  }

  onEditableInputClick(event) {
    this.itemClick = true;
    this.bindDocumentClickListener();
  }

  onEditableInputFocus(event) {
    this.focused = true;
    this.hide();
    this.onFocus.emit(event);
  }

  onEditableInputChange(event) {
    this.value = event.target.value;
    this.updateSelectedOption(this.value);
    this.onModelChange(this.value);
    this.onChange.emit({
      originalEvent: event,
      value: this.value
    });
  }

  show() {
    this.overlayVisible = true;
  }

  onOverlayAnimationStart(event: AnimationEvent) {
    // tslint:disable-next-line:no-string-literal
    switch (event['toState']) {
      case 'visible':
        // tslint:disable-next-line:no-string-literal
        this.overlay = event['element'];
        this.itemsWrapper = DomHandler.findSingle(this.overlay, '.ui-dropdown-items-wrapper');
        this.appendOverlay();
        if (this.autoZIndex) {
          this.overlay.style.zIndex = String(this.baseZIndex + (++DomHandler.zindex));
        }
        this.alignOverlay();
        this.bindDocumentClickListener();
        this.bindDocumentResizeListener();

        if (this.options && this.options.length) {
          const selectedListItem = DomHandler.findSingle(this.itemsWrapper, '.ui-dropdown-item.ui-state-highlight');
          if (selectedListItem) {
            DomHandler.scrollInView(this.itemsWrapper, selectedListItem);
          }
        }

        this.onShow.emit(event);
        break;

      case 'void':
        this.onHide.emit(event);
        this.onOverlayHide();
        break;
    }
  }

  appendOverlay() {
    if (this.appendTo) {
      if (this.appendTo === 'body') {
        document.body.appendChild(this.overlay);
      } else {
        DomHandler.appendChild(this.overlay, this.appendTo);
      }

      this.overlay.style.minWidth = DomHandler.getWidth(this.containerViewChild.nativeElement) + 'px';
    }
  }

  restoreOverlayAppend() {
    if (this.overlay && this.appendTo) {
      this.el.nativeElement.appendChild(this.overlay);
    }
  }

  hide() {
    this.overlayVisible = false;

    if (this.filter && this.resetFilterOnHide) {
      this.resetFilter();
    }

    this.cd.markForCheck();
  }

  alignOverlay() {
    if (this.overlay) {
      if (this.appendTo) {
        DomHandler.absolutePosition(this.overlay, this.containerViewChild.nativeElement);
      } else {
        DomHandler.relativePosition(this.overlay, this.containerViewChild.nativeElement);
      }
    }
  }

  onInputFocus(event) {
    this.focused = true;
    this.onFocus.emit(event);
  }

  onInputBlur(event) {
    this.focused = false;
    this.onModelTouched();
    this.onBlur.emit(event);
  }

  findPrevEnabledOption(index) {
    let prevEnabledOption;

    if (this.optionsToDisplay && this.optionsToDisplay.length) {
      for (let i = (index - 1); 0 <= i; i--) {
        const option = this.optionsToDisplay[i];
        if (option.disabled) {
          continue;
        } else {
          prevEnabledOption = option;
          break;
        }
      }

      if (!prevEnabledOption) {
        for (let i = this.optionsToDisplay.length - 1; i >= index; i--) {
          const option = this.optionsToDisplay[i];
          if (option.disabled) {
            continue;
          } else {
            prevEnabledOption = option;
            break;
          }
        }
      }
    }

    return prevEnabledOption;
  }

  findNextEnabledOption(index) {
    let nextEnabledOption;

    if (this.optionsToDisplay && this.optionsToDisplay.length) {
      for (let i = (index + 1); index < (this.optionsToDisplay.length - 1); i++) {
        const option = this.optionsToDisplay[i];
        if (option.disabled) {
          continue;
        } else {
          nextEnabledOption = option;
          break;
        }
      }

      if (!nextEnabledOption) {
        for (let i = 0; i < index; i++) {
          const option = this.optionsToDisplay[i];
          if (option.disabled) {
            continue;
          } else {
            nextEnabledOption = option;
            break;
          }
        }
      }
    }

    return nextEnabledOption;
  }

  onKeydown(event: KeyboardEvent, search: boolean) {
    if (this.readonly || !this.optionsToDisplay || this.optionsToDisplay.length === null) {
      return;
    }

    switch (event.which) {
      // down
      case 40:
        if (!this.overlayVisible && event.altKey) {
          this.show();
        } else {
          if (this.group) {
            const selectedItemIndex = this.selectedOption ?
              this.findOptionGroupIndex(this.selectedOption.value, this.optionsToDisplay) : -1;

            if (selectedItemIndex !== -1) {
              const nextItemIndex = selectedItemIndex.itemIndex + 1;
              if (nextItemIndex < (this.optionsToDisplay[selectedItemIndex.groupIndex].items.length)) {
                this.selectItem(event, this.optionsToDisplay[selectedItemIndex.groupIndex].items[nextItemIndex]);
                this.selectedOptionUpdated = true;
              } else if (this.optionsToDisplay[selectedItemIndex.groupIndex + 1]) {
                this.selectItem(event, this.optionsToDisplay[selectedItemIndex.groupIndex + 1].items[0]);
                this.selectedOptionUpdated = true;
              }
            } else {
              this.selectItem(event, this.optionsToDisplay[0].items[0]);
            }
          } else {
            const selectedItemIndex = this.selectedOption ? this.findOptionIndex(this.selectedOption.value, this.optionsToDisplay) : -1;
            const nextEnabledOption = this.findNextEnabledOption(selectedItemIndex);
            if (nextEnabledOption) {
              this.selectItem(event, nextEnabledOption);
              this.selectedOptionUpdated = true;
            }
          }
        }

        event.preventDefault();

        break;

      // up
      case 38:
        if (this.group) {
          const selectedItemIndex = this.selectedOption ? this.findOptionGroupIndex(this.selectedOption.value, this.optionsToDisplay) : -1;
          if (selectedItemIndex !== -1) {
            const prevItemIndex = selectedItemIndex.itemIndex - 1;
            if (prevItemIndex >= 0) {
              this.selectItem(event, this.optionsToDisplay[selectedItemIndex.groupIndex].items[prevItemIndex]);
              this.selectedOptionUpdated = true;
            } else if (prevItemIndex < 0) {
              const prevGroup = this.optionsToDisplay[selectedItemIndex.groupIndex - 1];
              if (prevGroup) {
                this.selectItem(event, prevGroup.items[prevGroup.items.length - 1]);
                this.selectedOptionUpdated = true;
              }
            }
          }
        } else {
          const selectedItemIndex = this.selectedOption ? this.findOptionIndex(this.selectedOption.value, this.optionsToDisplay) : -1;
          const prevEnabledOption = this.findPrevEnabledOption(selectedItemIndex);
          if (prevEnabledOption) {
            this.selectItem(event, prevEnabledOption);
            this.selectedOptionUpdated = true;
          }
        }

        event.preventDefault();
        break;

      // space
      case 32:
      case 32:
        if (!this.overlayVisible) {
          this.show();
          event.preventDefault();
        }
        break;

      // enter
      case 13:
        if (!this.filter || (this.optionsToDisplay && this.optionsToDisplay.length > 0)) {
          this.hide();
        }

        event.preventDefault();
        break;

      // escape and tab
      case 27:
      case 9:
        this.hide();
        break;

      // search item based on keyboard input
      default:
        if (search) {
          this.search(event);
        }
        break;
    }
  }

  search(event) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const char = String.fromCharCode(event.keyCode);
    this.previousSearchChar = this.currentSearchChar;
    this.currentSearchChar = char;

    if (this.previousSearchChar === this.currentSearchChar) {
      this.searchValue = this.currentSearchChar;
    } else {
      this.searchValue = this.searchValue ? this.searchValue + char : char;
    }

    let newOption;
    if (this.group) {
      const searchIndex = this.selectedOption ?
        this.findOptionGroupIndex(this.selectedOption.value, this.optionsToDisplay) : { groupIndex: 0, itemIndex: 0 };
      newOption = this.searchOptionWithinGroup(searchIndex);
    } else {
      let searchIndex = this.selectedOption ? this.findOptionIndex(this.selectedOption.value, this.optionsToDisplay) : -1;
      newOption = this.searchOption(++searchIndex);
    }

    if (newOption) {
      this.selectItem(event, newOption);
      this.selectedOptionUpdated = true;
    }

    this.searchTimeout = setTimeout(() => {
      this.searchValue = null;
    }, 250);
  }

  searchOption(index) {
    let option;

    if (this.searchValue) {
      option = this.searchOptionInRange(index, this.optionsToDisplay.length);

      if (!option) {
        option = this.searchOptionInRange(0, index);
      }
    }

    return option;
  }

  searchOptionInRange(start, end) {
    for (let i = start; i < end; i++) {
      const opt = this.optionsToDisplay[i];
      if (opt.label.toLowerCase().startsWith(this.searchValue.toLowerCase())) {
        return opt;
      }
    }

    return null;
  }

  searchOptionWithinGroup(index) {
    const option = null;

    if (this.searchValue) {
      for (let i = index.groupIndex; i < this.optionsToDisplay.length; i++) {
        for (let j = (index.groupIndex === i) ? (index.itemIndex + 1) : 0; j < this.optionsToDisplay[i].items.length; j++) {
          const opt = this.optionsToDisplay[i].items[j];
          if (opt.label.toLowerCase().startsWith(this.searchValue.toLowerCase())) {
            return opt;
          }
        }
      }

      if (!option) {
        for (let i = 0; i <= index.groupIndex; i++) {
          for (let j = 0; j < ((index.groupIndex === i) ? index.itemIndex : this.optionsToDisplay[i].items.length); j++) {
            const opt = this.optionsToDisplay[i].items[j];
            if (opt.label.toLowerCase().startsWith(this.searchValue.toLowerCase())) {
              return opt;
            }
          }
        }
      }
    }

    return null;
  }

  findOptionIndex(val: any, opts: any[]): number {
    let index = -1;
    if (opts) {
      for (let i = 0; i < opts.length; i++) {
        if ((val == null && opts[i].value == null) || ObjectUtils.equals(val, opts[i].value, this.dataKey)) {
          index = i;
          break;
        }
      }
    }

    return index;
  }

  findOptionGroupIndex(val: any, opts: any[]): any {
    let groupIndex;
    let itemIndex;

    if (opts) {
      for (let i = 0; i < opts.length; i++) {
        groupIndex = i;
        itemIndex = this.findOptionIndex(val, opts[i].items);

        if (itemIndex !== -1) {
          break;
        }
      }
    }

    if (itemIndex !== -1) {
      return { groupIndex, itemIndex };
    } else {
      return -1;
    }
  }

  findOption(val: any, opts: any[], inGroup?: boolean): SelectItem {
    if (this.group && !inGroup) {
      let opt: SelectItem;
      if (opts && opts.length) {
        for (const optgroup of opts) {
          opt = this.findOption(val, optgroup.items, true);
          if (opt) {
            break;
          }
        }
      }
      return opt;
    } else {
      const index: number = this.findOptionIndex(val, opts);
      return (index !== -1) ? opts[index] : null;
    }
  }

  onFilter(event): void {
    const inputValue = event.target.value;
    if (inputValue && inputValue.length) {
      this.filterValue = inputValue;
      this.activateFilter();
    } else {
      this.filterValue = null;
      this.optionsToDisplay = this.options;
    }

    this.optionsChanged = true;
  }

  activateFilter() {
    const searchFields: string[] = this.filterBy.split(',');

    if (this.options && this.options.length) {
      if (this.group) {
        const filteredGroups = [];
        for (const optgroup of this.options) {
          const filteredSubOptions = ObjectUtils.filter(optgroup.items, searchFields, this.filterValue);
          if (filteredSubOptions && filteredSubOptions.length) {
            filteredGroups.push({
              label: optgroup.label,
              value: optgroup.value,
              items: filteredSubOptions
            });
          }
        }

        this.optionsToDisplay = filteredGroups;
      } else {
        this.optionsToDisplay = ObjectUtils.filter(this.options, searchFields, this.filterValue);
      }

      this.optionsChanged = true;
    }
  }

  applyFocus(): void {
    if (this.editable) {
      DomHandler.findSingle(this.el.nativeElement, '.ui-dropdown-label.ui-inputtext').focus();
    } else {
      DomHandler.findSingle(this.el.nativeElement, 'input[readonly]').focus();
    }
  }

  focus(): void {
    this.applyFocus();
  }

  bindDocumentClickListener() {
    if (!this.documentClickListener) {
      this.documentClickListener = this.renderer.listen('document', 'click', () => {
        if (!this.selfClick && !this.itemClick) {
          this.hide();
          this.unbindDocumentClickListener();
        }

        this.clearClickState();
        this.cd.markForCheck();
      });
    }
  }

  clearClickState() {
    this.selfClick = false;
    this.itemClick = false;
  }

  unbindDocumentClickListener() {
    if (this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = null;
    }
  }

  bindDocumentResizeListener() {
    this.documentResizeListener = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.documentResizeListener);
  }

  unbindDocumentResizeListener() {
    if (this.documentResizeListener) {
      window.removeEventListener('resize', this.documentResizeListener);
      this.documentResizeListener = null;
    }
  }

  onWindowResize() {
    this.hide();
  }

  updateFilledState() {
    this.filled = (this.selectedOption != null);
  }

  clear(event: Event) {
    this.clearClick = true;
    this.value = null;
    this.onModelChange(this.value);
    this.onChange.emit({
      originalEvent: event,
      value: this.value
    });
    this.updateSelectedOption(this.value);
    this.updateEditableLabel();
    this.updateFilledState();
  }

  onOverlayHide() {
    this.unbindDocumentClickListener();
    this.unbindDocumentResizeListener();
    this.overlay = null;
    this.itemsWrapper = null;
  }

  ngOnDestroy() {
    this.restoreOverlayAppend();
    this.onOverlayHide();
  }
}
