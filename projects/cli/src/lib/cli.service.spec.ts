import { TestBed } from '@angular/core/testing';

import { CliService } from './cli.service';

describe('CliService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CliService = TestBed.get(CliService);
    expect(service).toBeTruthy();
  });
});
