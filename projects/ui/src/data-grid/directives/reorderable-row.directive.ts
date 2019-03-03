import { Directive, AfterViewInit, Input, ElementRef, NgZone, HostListener } from '@angular/core';
import { DomHandler } from '../../dom/domhandler';
import { DataGridComponent } from '../components/data-grid.component';

@Directive({
  selector: '[mReorderableRow]'
})
export class ReorderableRowDirective implements AfterViewInit {

  // tslint:disable-next-line:no-input-rename
  @Input('mReorderableRow') index: number;

  @Input() mReorderableRowDisabled: boolean;

  mouseDownListener: any;

  dragStartListener: any;

  dragEndListener: any;

  dragOverListener: any;

  dragLeaveListener: any;

  dropListener: any;

  constructor(public dataGrid: DataGridComponent, public elementRef: ElementRef, public zone: NgZone) {}

  ngAfterViewInit() {
      if (this.isEnabled()) {
          this.elementRef.nativeElement.droppable = true;
          this.bindEvents();
      }
  }

  bindEvents() {
      this.zone.runOutsideAngular(() => {
          this.mouseDownListener = this.onMouseDown.bind(this);
          this.elementRef.nativeElement.addEventListener('mousedown', this.mouseDownListener);

          this.dragStartListener = this.onDragStart.bind(this);
          this.elementRef.nativeElement.addEventListener('dragstart', this.dragStartListener);

          this.dragEndListener = this.onDragEnd.bind(this);
          this.elementRef.nativeElement.addEventListener('dragend', this.dragEndListener);

          this.dragOverListener = this.onDragOver.bind(this);
          this.elementRef.nativeElement.addEventListener('dragover', this.dragOverListener);

          this.dragLeaveListener = this.onDragLeave.bind(this);
          this.elementRef.nativeElement.addEventListener('dragleave', this.dragLeaveListener);
      });
  }

  unbindEvents() {
      if (this.mouseDownListener) {
          document.removeEventListener('mousedown', this.mouseDownListener);
          this.mouseDownListener = null;
      }

      if (this.dragStartListener) {
          document.removeEventListener('dragstart', this.dragStartListener);
          this.dragStartListener = null;
      }

      if (this.dragEndListener) {
          document.removeEventListener('dragend', this.dragEndListener);
          this.dragEndListener = null;
      }

      if (this.dragOverListener) {
          document.removeEventListener('dragover', this.dragOverListener);
          this.dragOverListener = null;
      }

      if (this.dragLeaveListener) {
          document.removeEventListener('dragleave', this.dragLeaveListener);
          this.dragLeaveListener = null;
      }
  }

  onMouseDown(event) {
      if (DomHandler.hasClass(event.target, 'ui-table-reorderablerow-handle')) {
          this.elementRef.nativeElement.draggable = true;
      } else {
          this.elementRef.nativeElement.draggable = false;
      }
  }

  onDragStart(event) {
      this.dataGrid.onRowDragStart(event, this.index);
  }

  onDragEnd(event) {
      this.dataGrid.onRowDragEnd(event);
      this.elementRef.nativeElement.draggable = false;
  }

  onDragOver(event) {
      this.dataGrid.onRowDragOver(event, this.index, this.elementRef.nativeElement);
      event.preventDefault();
  }

  onDragLeave(event) {
      this.dataGrid.onRowDragLeave(event, this.elementRef.nativeElement);
  }

  isEnabled() {
      return this.mReorderableRowDisabled !== true;
  }

  @HostListener('drop', ['$event'])
  onDrop(event) {
      if (this.isEnabled() && this.dataGrid.rowDragging) {
          this.dataGrid.onRowDrop(event, this.elementRef.nativeElement);
      }

      event.preventDefault();
  }
}
