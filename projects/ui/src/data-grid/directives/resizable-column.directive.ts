import { Directive, AfterViewInit, OnDestroy, Input, ElementRef, NgZone } from '@angular/core';
import { DomHandler } from '../../dom/domhandler';
import { DataGridComponent } from '../components/data-grid.component';

@Directive({
    selector: '[mResizableColumn]'
})
export class ResizableColumnDirective implements AfterViewInit, OnDestroy {

    @Input() mResizableColumnDisabled: boolean;

    resizer: HTMLSpanElement;

    resizerMouseDownListener: any;

    documentMouseMoveListener: any;

    documentMouseUpListener: any;

    constructor(public dataGrid: DataGridComponent, public elementRef: ElementRef, public zone: NgZone) { }

    ngAfterViewInit() {
        if (this.isEnabled()) {
            DomHandler.addClass(this.elementRef.nativeElement, 'ui-resizable-column');
            this.resizer = document.createElement('span');
            this.resizer.className = 'ui-column-resizer ui-clickable';
            this.elementRef.nativeElement.appendChild(this.resizer);

            this.zone.runOutsideAngular(() => {
                this.resizerMouseDownListener = this.onMouseDown.bind(this);
                this.resizer.addEventListener('mousedown', this.resizerMouseDownListener);
            });
        }
    }

    bindDocumentEvents() {
        this.zone.runOutsideAngular(() => {
            this.documentMouseMoveListener = this.onDocumentMouseMove.bind(this);
            document.addEventListener('mousemove', this.documentMouseMoveListener);

            this.documentMouseUpListener = this.onDocumentMouseUp.bind(this);
            document.addEventListener('mouseup', this.documentMouseUpListener);
        });
    }

    unbindDocumentEvents() {
        if (this.documentMouseMoveListener) {
            document.removeEventListener('mousemove', this.documentMouseMoveListener);
            this.documentMouseMoveListener = null;
        }

        if (this.documentMouseUpListener) {
            document.removeEventListener('mouseup', this.documentMouseUpListener);
            this.documentMouseUpListener = null;
        }
    }

    onMouseDown(event: Event) {
        this.dataGrid.onColumnResizeBegin(event);
        this.bindDocumentEvents();
    }

    onDocumentMouseMove(event: Event) {
        this.dataGrid.onColumnResize(event);
    }

    onDocumentMouseUp(event: Event) {
        this.dataGrid.onColumnResizeEnd(event, this.elementRef.nativeElement);
        this.unbindDocumentEvents();
    }

    isEnabled() {
        return this.mResizableColumnDisabled !== true;
    }

    ngOnDestroy() {
        if (this.resizerMouseDownListener) {
            this.resizer.removeEventListener('mousedown', this.resizerMouseDownListener);
        }

        this.unbindDocumentEvents();
    }
}
