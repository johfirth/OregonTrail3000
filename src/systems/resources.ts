import type { GameSystem, GameState, NarrativeEntry } from '../engine/types';
import {
  ResourceType,
  CrewRole,
  Phase,
  CONSUMPTION_RATES,
  DIFFICULTY_MODIFIERS,
} from '../engine/types';

/**
 * Resource Management System
 *
 * Tracks and updates the 6 mission resources (Propulsion, Life Support,
 * Spare Parts, Shielding, Medical, Budget). Handles consumption based
 * on consumption level, event effects, and depletion checks.
 */
export class ResourceSystem implements GameSystem {
  readonly name = 'resources';

  private initialResources: Partial<Record<ResourceType, number>> = {};

  initialize(state: GameState): GameState {
    // Snapshot initial resource values for depletion-warning thresholds
    const s = { ...state, resources: { ...state.resources } };
    for (const rt of Object.values(ResourceType)) {
      this.initialResources[rt] = s.resources[rt];
    }
    return s;
  }

  processTurn(state: GameState): GameState {
    const s = {
      ...state,
      resources: { ...state.resources },
      crew: state.crew.map(c => ({ ...c })),
      narrativeLog: [...state.narrativeLog],
    };
    const narrative: NarrativeEntry[] = [];

    // 1. Deduct life support based on consumption level
    let sdCost = CONSUMPTION_RATES[s.consumptionLevel];

    // Pilot bonus: reduce fuel costs by 15% (applies to propulsion drain)
    const pilotAlive = s.crew.some(
      c => c.role === CrewRole.Pilot && c.isAlive
    );

    s.resources[ResourceType.LifeSupport] = Math.max(
      0,
      s.resources[ResourceType.LifeSupport] - sdCost
    );

    // 2. Depletion warnings (< 20% of starting value)
    for (const rt of Object.values(ResourceType)) {
      if (rt === ResourceType.Budget) continue;
      const initial = this.initialResources[rt] ?? 0;
      if (initial <= 0) continue;
      const threshold = initial * 0.2;
      if (s.resources[rt] > 0 && s.resources[rt] < threshold) {
        narrative.push({
          id: `narr-res-warn-${rt}-${s.turn}`,
          text: `WARNING: ${rt} supplies critically low (${Math.floor(s.resources[rt])} remaining, below 20% of starting).`,
          type: 'WARNING',
          timestamp: s.turn,
        });
      }
    }

    // 3. Clamp all resources to minimum 0
    for (const rt of Object.values(ResourceType)) {
      s.resources[rt] = Math.max(0, s.resources[rt]);
    }

    // 4. Game-over conditions
    if (
      s.resources[ResourceType.LifeSupport] <= 0 &&
      s.phase !== Phase.Colony &&
      s.phase !== Phase.MissionPrep
    ) {
      s.isGameOver = true;
      s.gameOverReason =
        'Life support depleted. The crew cannot survive without oxygen and water.';
      narrative.push({
        id: `narr-res-ls-dead-${s.turn}`,
        text: 'Life support has been completely exhausted. There is no hope left.',
        type: 'DEATH',
        timestamp: s.turn,
      });
    }

    if (
      s.resources[ResourceType.Propulsion] <= 0 &&
      (s.phase === Phase.LunarTransit || s.phase === Phase.Descent)
    ) {
      s.isGameOver = true;
      s.gameOverReason =
        'Propulsion fuel exhausted during transit. The spacecraft is stranded.';
      narrative.push({
        id: `narr-res-fuel-dead-${s.turn}`,
        text: 'Propulsion fuel is gone. The spacecraft drifts powerless through the void.',
        type: 'DEATH',
        timestamp: s.turn,
      });
    }

    s.narrativeLog.push(...narrative);
    return s;
  }

  /** Returns true if the pilot is alive (used for fuel discount calculations). */
  isPilotAlive(state: GameState): boolean {
    return state.crew.some(c => c.role === CrewRole.Pilot && c.isAlive);
  }

  /** Calculate fuel cost with pilot bonus applied. */
  applyPilotFuelDiscount(baseCost: number, state: GameState): number {
    return this.isPilotAlive(state)
      ? Math.floor(baseCost * 0.85)
      : baseCost;
  }
}
