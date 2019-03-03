import { TestBed } from '@angular/core/testing';

import { DevkitService } from './devkit.service';

describe('DevkitService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DevkitService = TestBed.get(DevkitService);
    expect(service).toBeTruthy();
  });
});
