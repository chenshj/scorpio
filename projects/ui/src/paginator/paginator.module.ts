import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from '../dropdown/dropdown.module';
import { SharedModule } from '../shared/shared.module';
import { PaginatorComponent } from './paginator.component';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    SharedModule
  ],
  exports: [PaginatorComponent, DropdownModule, FormsModule, SharedModule],
  declarations: [PaginatorComponent]
})
export class PaginatorModule { }
