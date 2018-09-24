import { TestBed, inject } from '@angular/core/testing';

import { SGCouresService } from './sgcoures.service';

describe('SGCouresService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SGCouresService]
    });
  });

  it('should be created', inject([SGCouresService], (service: SGCouresService) => {
    expect(service).toBeTruthy();
  }));
});
