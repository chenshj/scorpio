import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScorpioTemplateDirective } from './directives/scorpio-template.directive';
import { HeaderComponent } from './components/header.component';
import { FooterComponent } from './components/footer.component';
import { ColumnComponent } from './components/column.component';
import { RowComponent } from './components/row.component';
import { HeaderColumnGroupComponent } from './components/header-column-group.component';
import { FooterColumnGroupComponent } from './components/footer-column-group.component';

@NgModule({
  declarations: [ScorpioTemplateDirective, HeaderComponent, FooterComponent, ColumnComponent,
    RowComponent, HeaderColumnGroupComponent, FooterColumnGroupComponent],
  imports: [
    CommonModule
  ],
  exports: [
    ScorpioTemplateDirective, HeaderComponent, FooterComponent, ColumnComponent,
    RowComponent, HeaderColumnGroupComponent, FooterColumnGroupComponent
  ]
})
export class SharedModule { }
