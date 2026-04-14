import type { GameSystem, GameState } from '../engine/types';

/**
 * Gateway Trading System
 *
 * Manages resupply at the Lunar Gateway station (Phase 4).
 * Items cost 50% more than initial prices (2/3 value per credit),
 * mirroring the Oregon Trail's fort trading mechanic.
 */
export class TradingSystem implements GameSystem {
  readonly name = 'trading';

  initialize(state: GameState): GameState {
    // TODO: Set up Gateway price tables (1.5× markup)
    return state;
  }

  processTurn(state: GameState): GameState {
    // TODO: Process trades at Gateway, deduct budget
    return state;
  }
}
