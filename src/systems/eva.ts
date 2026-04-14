import type { GameSystem, GameState, Resources } from '../engine/types';
import {
  EvaType,
  EvaOutcome,
  ResourceType,
  CrewRole,
  EVA_MIN_SPARE_PARTS,
  EVA_ICE_BASE_YIELD,
  EVA_REPAIR_YIELD_SR,
  EVA_REPAIR_YIELD_PU,
  EVA_SCIENCE_BASE_SCORE,
  EVA_ICE_PARTS_COST,
  EVA_REPAIR_PARTS_COST,
} from '../engine/types';

const OUTCOME_MULTIPLIERS: Record<EvaOutcome, number> = {
  [EvaOutcome.Textbook]: 1.0,
  [EvaOutcome.Successful]: 0.75,
  [EvaOutcome.Difficult]: 0.5,
  [EvaOutcome.Fumble]: 0.25,
  [EvaOutcome.Aborted]: 0,
};

const OUTCOME_PARTS_COST: Record<EvaOutcome, number> = {
  [EvaOutcome.Textbook]: 1,
  [EvaOutcome.Successful]: 1,
  [EvaOutcome.Difficult]: 2,
  [EvaOutcome.Fumble]: 2,
  [EvaOutcome.Aborted]: 1,
};

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
    return state;
  }

  processTurn(state: GameState): GameState {
    return state;
  }

  /** Check whether an EVA can be attempted given current spare parts. */
  canAttemptEva(state: GameState, type: EvaType): boolean {
    const cost = this.getEvaCost(type);
    return state.resources[ResourceType.SpareParts] >= cost;
  }

  /** Calculate the yield of an EVA based on type, outcome, crew, and site. */
  calculateEvaYield(
    state: GameState,
    type: EvaType,
    outcome: EvaOutcome,
  ): { resourceGain: Partial<Resources>; scoreGain: number; partsCost: number } {
    const yieldMult = OUTCOME_MULTIPLIERS[outcome];
    const partsCost = OUTCOME_PARTS_COST[outcome];
    const resourceGain: Partial<Resources> = {};
    let scoreGain = 0;

    const scientistAlive = state.crew.some(
      c => c.role === CrewRole.Scientist && c.isAlive
    );
    const site = state.selectedLandingSite;

    switch (type) {
      case EvaType.IceExtraction: {
        const siteModifier = site ? site.iceAccess / 3 : 1;
        let baseYield = EVA_ICE_BASE_YIELD * siteModifier;
        if (scientistAlive) baseYield *= 1.4;
        resourceGain[ResourceType.LifeSupport] = Math.floor(baseYield * yieldMult);
        break;
      }
      case EvaType.EquipmentRepair: {
        resourceGain[ResourceType.Shielding] = Math.floor(
          EVA_REPAIR_YIELD_SR * yieldMult
        );
        resourceGain[ResourceType.SpareParts] = Math.floor(
          EVA_REPAIR_YIELD_PU * yieldMult
        );
        break;
      }
      case EvaType.ScienceMission: {
        let baseScore = EVA_SCIENCE_BASE_SCORE;
        if (scientistAlive) baseScore *= 1.5;
        if (site) baseScore += (site.sunlight - 3) * 30;
        scoreGain = Math.floor(baseScore * yieldMult);
        break;
      }
    }

    return { resourceGain, scoreGain, partsCost };
  }

  /** Get the spare parts cost for an EVA type. */
  getEvaCost(type: EvaType): number {
    switch (type) {
      case EvaType.IceExtraction:
        return EVA_ICE_PARTS_COST;
      case EvaType.EquipmentRepair:
        return EVA_REPAIR_PARTS_COST;
      case EvaType.ScienceMission:
        return EVA_MIN_SPARE_PARTS;
    }
  }
}
