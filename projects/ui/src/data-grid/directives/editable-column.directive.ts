import { Directive, AfterViewInit, Input, ElementRef, NgZone, HostListener } from '@angular/core';
import { DomHandler } from '../../dom/domhandler';
import { DataGridComponent } from '../components/data-grid.component';

@Directive({
    selector: '[mEditableColumn]'
})
export class EditableColumnDirective implements AfterViewInit {

    // tslint:disable-next-line:no-input-rename
    @Input('mEditableColumn') data: any;

    // tslint:disable-next-line:no-input-rename
    @Input('mEditableColumnField') field: any;

    @Input() pEditableColumnDisabled: boolean;

    @Input() pFocusCellSelector: string;

    constructor(public dataGrid: DataGridComponent, public elementRef: ElementRef, public zone: NgZone) { }
    ngAfterViewInit() {
        if (this.isEnabled()) {
            DomHandler.addClass(this.elementRef.nativeElement, 'ui-editable-column');
        }
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        if (this.isEnabled()) {
            this.dataGrid.editingCellClick = true;

            if (this.dataGrid.editingCell) {
                if (this.dataGrid.editingCell !== this.elementRef.nativeElement) {
                    if (!this.dataGrid.isEditingCellValid()) {
                        return;
                    }
                    DomHandler.removeClass(this.dataGrid.editingCell, 'ui-editing-cell');
                    this.openCell();
                }
            } else {
                this.openCell();
            }
        }
    }

    openCell() {
        this.dataGrid.updateEditingCell(this.elementRef.nativeElement);
        DomHandler.addClass(this.elementRef.nativeElement, 'ui-editing-cell');
        this.dataGrid.editInit.emit({ field: this.field, data: this.data });
        this.zone.runOutsideAngular(() => {
            setTimeout(() => {
                const focusCellSelector = this.pFocusCellSelector || 'input, textarea, select';
                const focusableElement = DomHandler.findSingle(this.elementRef.nativeElement, focusCellSelector);

                if (focusableElement) {
                    focusableElement.focus();
                }
            }, 50);
        });
    }

    closeEditingCell() {
        DomHandler.removeClass(this.dataGrid.editingCell, 'ui-editing-cell');
        this.dataGrid.editingCell = null;
        this.dataGrid.unbindDocumentEditListener();
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (this.isEnabled()) {
            // enter
            if (event.keyCode === 13) {
                if (this.dataGrid.isEditingCellValid()) {
                    this.closeEditingCell();
                    this.dataGrid.editComplete.emit({ field: this.field, data: this.data });
                }

                event.preventDefault();
            } else if (event.keyCode === 27) { // escape
                if (this.dataGrid.isEditingCellValid()) {
                    this.closeEditingCell();
                    this.dataGrid.editCancel.emit({ field: this.field, data: this.data });
                }

                event.preventDefault();
            } else if (event.keyCode === 9) { // tab
                this.dataGrid.editComplete.emit({ field: this.field, data: this.data });

                if (event.shiftKey) {
                    this.moveToPreviousCell(event);
                } else {
                    this.moveToNextCell(event);
                }
            }
        }
    }

    findCell(element) {
        if (element) {
            let cell = element;
            while (cell && !DomHandler.hasClass(cell, 'ui-editing-cell')) {
                cell = cell.parentElement;
            }

            return cell;
        } else {
            return null;
        }
    }

    moveToPreviousCell(event: KeyboardEvent) {
        const currentCell = this.findCell(event.target);
        const row = currentCell.parentElement;
        const targetCell = this.findPreviousEditableColumn(currentCell);

        if (targetCell) {
            DomHandler.invokeElementMethod(event.target, 'blur');
            DomHandler.invokeElementMethod(targetCell, 'click');
            event.preventDefault();
        }
    }

    moveToNextCell(event: KeyboardEvent) {
        const currentCell = this.findCell(event.target);
        const row = currentCell.parentElement;
        const targetCell = this.findNextEditableColumn(currentCell);

        if (targetCell) {
            DomHandler.invokeElementMethod(event.target, 'blur');
            DomHandler.invokeElementMethod(targetCell, 'click');
            event.preventDefault();
        }
    }

    findPreviousEditableColumn(cell: Element) {
        let prevCell = cell.previousElementSibling;

        if (!prevCell) {
            const previousRow = cell.parentElement.previousElementSibling;
            if (previousRow) {
                prevCell = previousRow.lastElementChild;
            }
        }

        if (prevCell) {
            if (DomHandler.hasClass(prevCell, 'ui-editable-column')) {
                return prevCell;
            } else {
                return this.findPreviousEditableColumn(prevCell);
            }
        } else {
            return null;
        }
    }

    findNextEditableColumn(cell: Element) {
        let nextCell = cell.nextElementSibling;

        if (!nextCell) {
            const nextRow = cell.parentElement.nextElementSibling;
            if (nextRow) {
                nextCell = nextRow.firstElementChild;
            }
        }

        if (nextCell) {
            if (DomHandler.hasClass(nextCell, 'ui-editable-column')) {
                return nextCell;
            } else {
                return this.findNextEditableColumn(nextCell);
            }
        } else {
            return null;
        }
    }

    isEnabled() {
        return this.pEditableColumnDisabled !== true;
    }

}
