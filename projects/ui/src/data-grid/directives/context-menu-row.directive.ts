import { Directive, Input, HostListener, OnDestroy, HostBinding } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataGridComponent } from '../components/data-grid.component';
import { DataGridService } from '../services/data-grid.service';

@Directive({
    selector: '[mContextMenuRow]'
})
export class ContextMenuRowDirective implements OnDestroy {

    // tslint:disable-next-line:no-input-rename
    @Input('mContextMenuRow') data: any;

    // tslint:disable-next-line:no-input-rename
    @Input('mContextMenuRowIndex') index: number;

    @Input() mContextMenuRowDisabled: boolean;

    selected: boolean;

    subscription: Subscription;

    constructor(public dataGrid: DataGridComponent, public dataGridService: DataGridService) {
        if (this.isEnabled()) {
            this.subscription = this.dataGrid.dataGridService.contextMenuSource$.subscribe((data) => {
                this.selected = this.dataGrid.equals(this.data, data);
            });
        }
    }

    @HostListener('contextmenu', ['$event'])
    onContextMenu(event: Event) {
        if (this.isEnabled()) {
            this.dataGrid.handleRowRightClick({
                originalEvent: event,
                rowData: this.data,
                rowIndex: this.index
            });

            event.preventDefault();
        }
    }

    @HostBinding('class.ui-contextmenu-selected') get contextMenuSelected() { return this.selected; }

    isEnabled() {
        return this.mContextMenuRowDisabled !== true;
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
