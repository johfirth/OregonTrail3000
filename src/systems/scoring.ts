import type { GameSystem, GameState } from '../engine/types';

/**
 * Victory Scoring System
 *
 * Calculates score based on: surviving crew (×500), remaining resources,
 * landing site difficulty bonus, science objectives, speed bonus.
 * Determines victory tier (Thriving Colony / Sustainable / Bare Survival).
 */
export class ScoringSystem implements GameSystem {
  readonly name = 'scoring';

  initialize(state: GameState): GameState {
    // TODO: Set up scoring rubric and milestone tracking
    return state;
  }

  processTurn(state: GameState): GameState {
    // TODO: Update running score and check victory/defeat conditions
    return state;
  }
}
