import { Directive, Input, HostListener, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataGridComponent } from '../components/data-grid.component';
import { DomHandler } from '../../dom/domhandler';

@Directive({
    selector: '[mSortableColumn]'
})
export class SortableColumnDirective implements OnInit, OnDestroy {

    // tslint:disable-next-line:no-input-rename
    @Input('mSortableColumn') field: string;

    @Input() mSortableColumnDisabled: boolean;

    sorted: boolean;

    subscription: Subscription;

    constructor(public dataGrid: DataGridComponent) {
        if (this.isEnabled()) {
            this.subscription = this.dataGrid.dataGridService.sortSource$.subscribe(sortMeta => {
                this.updateSortState();
            });
        }
    }

    ngOnInit() {
        if (this.isEnabled()) {
            this.updateSortState();
        }
    }

    updateSortState() {
        this.sorted = this.dataGrid.isSorted(this.field);
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        if (this.isEnabled()) {
            this.updateSortState();
            this.dataGrid.sort({
                originalEvent: event,
                field: this.field
            });

            DomHandler.clearSelection();
        }
    }

    @HostListener('keydown.enter', ['$event'])
    onEnterKey(event: MouseEvent) {
        this.onClick(event);
    }

    @HostBinding('class.ui-sortable-row') get rowSortable() { return this.isEnabled(); }

    @HostBinding('class.ui-state-highlight') get rowHighlight() { return this.sorted; }

    @HostBinding('attr.tabindex') get tabIndex() { return this.isEnabled() ? 0 : undefined; }

    isEnabled() {
        return this.mSortableColumnDisabled !== true;
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }


}
