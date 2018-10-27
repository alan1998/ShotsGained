import { TestBed, inject } from '@angular/core/testing';

import { HoleoutSgService } from './holeout-sg.service';

describe('HoleoutSgService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HoleoutSgService]
    });
  });

  it('should be created', inject([HoleoutSgService], (service: HoleoutSgService) => {
    expect(service).toBeTruthy();
  }));
});
