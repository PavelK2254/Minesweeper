import { TestBed } from '@angular/core/testing';

import { GamesolverService } from './gamesolver.service';

describe('GamesolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GamesolverService = TestBed.get(GamesolverService);
    expect(service).toBeTruthy();
  });
});
