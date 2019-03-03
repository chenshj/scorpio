import { Directive, AfterViewInit, Input, ElementRef } from '@angular/core';
import { DomHandler } from '../../dom/domhandler';

@Directive({
  selector: '[mReorderableRowHandle]'
})
export class ReorderableRowHandleDirective implements AfterViewInit {

  // tslint:disable-next-line:no-input-rename
  @Input('mReorderableRowHandle') index: number;

  constructor(public elementRef: ElementRef) { }

  ngAfterViewInit() {
    DomHandler.addClass(this.elementRef.nativeElement, 'ui-table-reorderablerow-handle');
  }
}
