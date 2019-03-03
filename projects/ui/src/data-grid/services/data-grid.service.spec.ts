import { TestBed } from '@angular/core/testing';

import { DataGridService } from './data-grid.service';

describe('DataGridService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataGridService = TestBed.get(DataGridService);
    expect(service).toBeTruthy();
  });
});
