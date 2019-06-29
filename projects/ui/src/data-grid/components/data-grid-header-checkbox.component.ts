import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DomHandler } from '../../dom/domhandler';
import { DataGridComponent } from './data-grid.component';
import { DataGridService } from '../services/data-grid.service';

@Component({
    selector: 'm-data-grid-header-checkbox',
    templateUrl: './data-grid-header-checkbox.component.html',
    styleUrls: ['./data-grid-header-checkbox.component.css']
})
export class DataGridHeaderCheckboxComponent implements OnInit, OnDestroy {

    @ViewChild('box', { read: true, static: true }) boxViewChild: ElementRef;

    @Input() disabled: boolean;

    checked: boolean;

    selectionChangeSubscription: Subscription;

    valueChangeSubscription: Subscription;

    constructor(public dataGrid: DataGridComponent, public dataGridService: DataGridService) {
        this.valueChangeSubscription = this.dataGrid.dataGridService.valueSource$.subscribe(() => {
            this.checked = this.updateCheckedState();
        });

        this.selectionChangeSubscription = this.dataGrid.dataGridService.selectionSource$.subscribe(() => {
            this.checked = this.updateCheckedState();
        });
    }

    ngOnInit() {
        this.checked = this.updateCheckedState();
    }

    onClick(event: Event) {
        if (!this.disabled) {
            if (this.dataGrid.value && this.dataGrid.value.length > 0) {
                this.dataGrid.toggleRowsWithCheckbox(event, !this.checked);
            }
        }

        DomHandler.clearSelection();
    }

    onFocus() {
        DomHandler.addClass(this.boxViewChild.nativeElement, 'ui-state-focus');
    }

    onBlur() {
        DomHandler.removeClass(this.boxViewChild.nativeElement, 'ui-state-focus');
    }

    isDisabled() {
        return this.disabled || !this.dataGrid.value || !this.dataGrid.value.length;
    }

    ngOnDestroy() {
        if (this.selectionChangeSubscription) {
            this.selectionChangeSubscription.unsubscribe();
        }

        if (this.valueChangeSubscription) {
            this.valueChangeSubscription.unsubscribe();
        }
    }

    updateCheckedState() {
        if (this.dataGrid.filteredValue) {
            const val = this.dataGrid.filteredValue;
            return (val && val.length > 0 &&
                this.dataGrid.selection && this.dataGrid.selection.length > 0
                && this.isAllFilteredValuesChecked());
        } else {
            const val = this.dataGrid.value;
            return (val && val.length > 0 &&
                this.dataGrid.selection && this.dataGrid.selection.length > 0
                && this.dataGrid.selection.length === val.length);
        }
    }

    isAllFilteredValuesChecked() {
        if (!this.dataGrid.filteredValue) {
            return false;
        } else {
            for (const rowData of this.dataGrid.filteredValue) {
                if (!this.dataGrid.isSelected(rowData)) {
                    return false;
                }
            }
            return true;
        }
    }

}
