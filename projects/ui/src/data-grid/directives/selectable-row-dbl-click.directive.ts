import { Directive, OnInit, OnDestroy, Input, HostListener, HostBinding } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataGridComponent } from '../components/data-grid.component';
import { DataGridService } from '../services/data-grid.service';

@Directive({
    selector: '[mSelectableRowDblClick]'
})
export class SelectableRowDblClickDirective implements OnInit, OnDestroy {

    // tslint:disable-next-line:no-input-rename
    @Input('mSelectableRowDblClick') data: any;

    // tslint:disable-next-line:no-input-rename
    @Input('mSelectableRowIndex') index: number;

    @Input() mSelectableRowDisabled: boolean;

    selected: boolean;

    subscription: Subscription;

    constructor(public dataGrid: DataGridComponent, public dataGridService: DataGridService) {
        if (this.isEnabled()) {
            this.subscription = this.dataGrid.dataGridService.selectionSource$.subscribe(() => {
                this.selected = this.dataGrid.isSelected(this.data);
            });
        }
    }

    ngOnInit() {
        if (this.isEnabled()) {
            this.selected = this.dataGrid.isSelected(this.data);
        }
    }

    @HostListener('dblclick', ['$event'])
    onClick(event: Event) {
        if (this.isEnabled()) {
            this.dataGrid.handleRowClick({
                originalEvent: event,
                rowData: this.data,
                rowIndex: this.index
            });
        }
    }

    @HostBinding('class.ui-state-highlight') get rowHighlight() { return this.selected; }

    isEnabled() {
        return this.mSelectableRowDisabled !== true;
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
