import { TestBed } from '@angular/core/testing';

import { GameService } from './gameService.service';

describe('WebserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GameService = TestBed.get(GameService);
    expect(service).toBeTruthy();
  });
});
