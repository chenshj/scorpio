import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DomHandler } from '../../dom/domhandler';
import { DataGridComponent } from './data-grid.component';
import { DataGridService } from '../services/data-grid.service';

@Component({
    selector: 'm-table-radio-button',
    templateUrl: './table-radio-button.component.html',
    styleUrls: ['./table-radio-button.component.css']
})
export class TableRadioButtonComponent implements OnInit, OnDestroy {
    @Input() disabled: boolean;

    @Input() value: any;

    @Input() index: number;

    @ViewChild('box') boxViewChild: ElementRef;

    checked: boolean;

    subscription: Subscription;

    constructor(public dataGrid: DataGridComponent, public dataGridService: DataGridService) {
        this.subscription = this.dataGrid.dataGridService.selectionSource$.subscribe(() => {
            this.checked = this.dataGrid.isSelected(this.value);
        });
    }

    ngOnInit() {
        this.checked = this.dataGrid.isSelected(this.value);
    }

    onClick(event: Event) {
        if (!this.disabled) {
            this.dataGrid.toggleRowWithRadio({
                originalEvent: event,
                rowIndex: this.index
            }, this.value);
        }
        DomHandler.clearSelection();
    }

    onFocus() {
        DomHandler.addClass(this.boxViewChild.nativeElement, 'ui-state-focus');
    }

    onBlur() {
        DomHandler.removeClass(this.boxViewChild.nativeElement, 'ui-state-focus');
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
