import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown.component';
import { DropdownItemComponent } from './dropdown-item.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, SharedModule, ScrollingModule],
  exports: [DropdownComponent, SharedModule, ScrollingModule],
  declarations: [DropdownComponent, DropdownItemComponent]
})
export class DropdownModule { }
