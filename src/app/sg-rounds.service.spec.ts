import { TestBed, inject } from '@angular/core/testing';

import { SgRoundsService } from './sg-rounds.service';

describe('SgRoundsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SgRoundsService]
    });
  });

  it('should be created', inject([SgRoundsService], (service: SgRoundsService) => {
    expect(service).toBeTruthy();
  }));
});
