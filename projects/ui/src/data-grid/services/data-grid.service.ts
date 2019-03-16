import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SortMeta } from '../../common/sortmeta';

@Injectable({
  providedIn: 'root'
})
export class DataGridService {

  constructor() { }

  private sortSource = new Subject<SortMeta | SortMeta[]>();
  private selectionSource = new Subject();
  private contextMenuSource = new Subject<any>();
  private valueSource = new Subject<any>();
  private totalRecordsSource = new Subject<any>();
  private columnsSource = new Subject();

  sortSource$ = this.sortSource.asObservable();
  selectionSource$ = this.selectionSource.asObservable();
  contextMenuSource$ = this.contextMenuSource.asObservable();
  valueSource$ = this.valueSource.asObservable();
  totalRecordsSource$ = this.totalRecordsSource.asObservable();
  columnsSource$ = this.columnsSource.asObservable();

  onSort(sortMeta: SortMeta | SortMeta[]) {
    this.sortSource.next(sortMeta);
  }

  onSelectionChange() {
    this.selectionSource.next();
  }

  onContextMenu(data: any) {
    this.contextMenuSource.next(data);
  }

  onValueChange(value: any) {
    this.valueSource.next(value);
  }

  onTotalRecordsChange(value: number) {
    this.totalRecordsSource.next(value);
  }

  onColumnsChange(columns: any[]) {
    this.columnsSource.next(columns);
  }
}
