import type { GameSystem, GameState } from '../engine/types';

/**
 * EVA Mission System
 *
 * Handles extravehicular activity missions: resource extraction (ice mining),
 * equipment repair, and science objectives. Includes skill challenge mechanic
 * (replaces Oregon Trail's hunting/shooting).
 */
export class EVASystem implements GameSystem {
  readonly name = 'eva';

  initialize(state: GameState): GameState {
    // TODO: Set up available EVA mission types and equipment
    return state;
  }

  processTurn(state: GameState): GameState {
    // TODO: Process active EVA missions and resolve outcomes
    return state;
  }
}
