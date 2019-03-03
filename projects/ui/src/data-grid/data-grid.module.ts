import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGridComponent } from './components/data-grid.component';
import { DataGridBodyComponent } from './components/data-grid-body.component';
import { ScrollableViewComponent } from './components/scrollable-view.component';
import { SortIconComponent } from './components/sort-icon.component';
import { CellEditorComponent } from './components/cell-editor.component';
import { TableRadioButtonComponent } from './components/table-radio-button.component';
import { DataGridCheckboxComponent } from './components/data-grid-checkbox.component';
import { DataGridHeaderCheckboxComponent } from './components/data-grid-header-checkbox.component';
import { SortableColumnDirective } from './directives/sortable-column.directive';
import { SelectableRowDirective } from './directives/selectable-row.directive';
import { SelectableRowDblClickDirective } from './directives/selectable-row-dbl-click.directive';
import { ContextMenuRowDirective } from './directives/context-menu-row.directive';
import { RowTogglerDirective } from './directives/row-toggler.directive';
import { ResizableColumnDirective } from './directives/resizable-column.directive';
import { ReorderableColumnDirective } from './directives/reorderable-column.directive';
import { EditableColumnDirective } from './directives/editable-column.directive';
import { ReorderableRowHandleDirective } from './directives/reorderable-row-handle.directive';
import { ReorderableRowDirective } from './directives/reorderable-row.directive';

@NgModule({
  declarations: [
    DataGridComponent,
    DataGridBodyComponent,
    ScrollableViewComponent,
    SortIconComponent,
    CellEditorComponent,
    TableRadioButtonComponent,
    DataGridCheckboxComponent,
    DataGridHeaderCheckboxComponent,
    SortableColumnDirective,
    SelectableRowDirective,
    SelectableRowDblClickDirective,
    ContextMenuRowDirective,
    RowTogglerDirective,
    ResizableColumnDirective,
    ReorderableColumnDirective,
    EditableColumnDirective,
    ReorderableRowHandleDirective,
    ReorderableRowDirective
  ],
  imports: [
    CommonModule
  ]
})
export class DataGridModule { }
