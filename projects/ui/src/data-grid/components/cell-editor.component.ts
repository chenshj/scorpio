import { Component, OnInit, AfterContentInit, ContentChildren, QueryList, TemplateRef } from '@angular/core';
import { PrimeTemplate } from '../../common/shared';
import { DataGridComponent } from './data-grid.component';
import { EditableColumnDirective } from '../directives/editable-column.directive';

@Component({
  selector: 'm-cell-editor',
  templateUrl: './cell-editor.component.html',
  styleUrls: ['./cell-editor.component.css']
})
export class CellEditorComponent implements AfterContentInit {

  @ContentChildren(PrimeTemplate) templates: QueryList<PrimeTemplate>;

  inputTemplate: TemplateRef<any>;

  outputTemplate: TemplateRef<any>;

  constructor(public dataGrid: DataGridComponent, public editableColumn: EditableColumnDirective) { }

  ngAfterContentInit() {
    this.templates.forEach((item) => {
      switch (item.getType()) {
        case 'input':
          this.inputTemplate = item.template;
          break;

        case 'output':
          this.outputTemplate = item.template;
          break;
      }
    });
  }

}
