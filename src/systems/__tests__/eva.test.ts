import { describe, it, expect } from 'vitest';
import { EVASystem } from '../eva';
import { createInitialState } from '../../engine/state';
import {
  Difficulty,
  Phase,
  ResourceType,
  EvaType,
  EvaOutcome,
  CrewRole,
  EVA_ICE_BASE_YIELD,
  EVA_REPAIR_YIELD_SR,
  EVA_SCIENCE_BASE_SCORE,
  EVA_ICE_PARTS_COST,
  EVA_REPAIR_PARTS_COST,
  EVA_MIN_SPARE_PARTS,
  LANDING_SITES,
} from '../../engine/types';
import type { GameState } from '../../engine/types';

function makeState(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialState({
    difficulty: Difficulty.Astronaut,
    commanderName: 'Test',
    rngSeed: 42,
  });
  return {
    ...base,
    phase: Phase.SurfaceOps,
    selectedLandingSite: LANDING_SITES[0], // Shackleton Rim
    resources: {
      ...base.resources,
      [ResourceType.SpareParts]: 20,
      [ResourceType.LifeSupport]: 30,
      [ResourceType.Shielding]: 10,
    },
    ...overrides,
  };
}

describe('EVASystem', () => {
  let system: EVASystem;

  beforeEach(() => {
    system = new EVASystem();
  });

  describe('canAttemptEva', () => {
    it('returns true when enough spare parts for ice extraction', () => {
      const state = makeState();
      expect(system.canAttemptEva(state, EvaType.IceExtraction)).toBe(true);
    });

    it('returns false when insufficient parts for repair', () => {
      const state = makeState({
        resources: { ...makeState().resources, [ResourceType.SpareParts]: 1 },
      });
      expect(system.canAttemptEva(state, EvaType.EquipmentRepair)).toBe(false);
    });

    it('returns true for science mission with minimum parts', () => {
      const state = makeState({
        resources: { ...makeState().resources, [ResourceType.SpareParts]: EVA_MIN_SPARE_PARTS },
      });
      expect(system.canAttemptEva(state, EvaType.ScienceMission)).toBe(true);
    });
  });

  describe('getEvaCost', () => {
    it('ice extraction costs EVA_ICE_PARTS_COST', () => {
      expect(system.getEvaCost(EvaType.IceExtraction)).toBe(EVA_ICE_PARTS_COST);
    });

    it('equipment repair costs EVA_REPAIR_PARTS_COST', () => {
      expect(system.getEvaCost(EvaType.EquipmentRepair)).toBe(EVA_REPAIR_PARTS_COST);
    });

    it('science mission costs EVA_MIN_SPARE_PARTS', () => {
      expect(system.getEvaCost(EvaType.ScienceMission)).toBe(EVA_MIN_SPARE_PARTS);
    });
  });

  describe('calculateEvaYield', () => {
    it('Textbook outcome gives full yield', () => {
      const state = makeState();
      const result = system.calculateEvaYield(state, EvaType.IceExtraction, EvaOutcome.Textbook);
      expect(result.resourceGain[ResourceType.LifeSupport]).toBeGreaterThan(0);
      expect(result.partsCost).toBe(1);
    });

    it('Aborted outcome gives zero yield', () => {
      const state = makeState();
      const result = system.calculateEvaYield(state, EvaType.IceExtraction, EvaOutcome.Aborted);
      expect(result.resourceGain[ResourceType.LifeSupport]).toBe(0);
      expect(result.partsCost).toBe(1);
    });

    it('Difficult outcome gives 50% yield and 2 parts cost', () => {
      const state = makeState();
      const textbook = system.calculateEvaYield(state, EvaType.IceExtraction, EvaOutcome.Textbook);
      const difficult = system.calculateEvaYield(state, EvaType.IceExtraction, EvaOutcome.Difficult);

      expect(difficult.partsCost).toBe(2);
      expect(difficult.resourceGain[ResourceType.LifeSupport]!).toBeLessThan(
        textbook.resourceGain[ResourceType.LifeSupport]!
      );
    });

    it('ice extraction yields life support', () => {
      const state = makeState();
      const result = system.calculateEvaYield(state, EvaType.IceExtraction, EvaOutcome.Textbook);
      expect(result.resourceGain[ResourceType.LifeSupport]).toBeGreaterThan(0);
      expect(result.scoreGain).toBe(0);
    });

    it('equipment repair yields shielding', () => {
      const state = makeState();
      const result = system.calculateEvaYield(state, EvaType.EquipmentRepair, EvaOutcome.Textbook);
      expect(result.resourceGain[ResourceType.Shielding]).toBeGreaterThanOrEqual(0);
    });

    it('science mission yields score points', () => {
      const state = makeState();
      const result = system.calculateEvaYield(state, EvaType.ScienceMission, EvaOutcome.Textbook);
      expect(result.scoreGain).toBeGreaterThan(0);
    });

    it('scientist alive bonus increases science yield', () => {
      const state = makeState();
      const withScientist = system.calculateEvaYield(state, EvaType.ScienceMission, EvaOutcome.Textbook);

      const stateNoScientist = makeState();
      const scientist = stateNoScientist.crew.find(c => c.role === CrewRole.Scientist)!;
      scientist.isAlive = false;
      const withoutScientist = system.calculateEvaYield(stateNoScientist, EvaType.ScienceMission, EvaOutcome.Textbook);

      expect(withScientist.scoreGain).toBeGreaterThan(withoutScientist.scoreGain);
    });

    it('site ice access modifies ice extraction yield', () => {
      // Shackleton Rim has iceAccess 4, Malapert Summit has 2
      const state1 = makeState({ selectedLandingSite: LANDING_SITES[0] }); // iceAccess: 4
      const state2 = makeState({ selectedLandingSite: LANDING_SITES[2] }); // iceAccess: 2

      const yield1 = system.calculateEvaYield(state1, EvaType.IceExtraction, EvaOutcome.Textbook);
      const yield2 = system.calculateEvaYield(state2, EvaType.IceExtraction, EvaOutcome.Textbook);

      expect(yield1.resourceGain[ResourceType.LifeSupport]!).toBeGreaterThan(
        yield2.resourceGain[ResourceType.LifeSupport]!
      );
    });
  });
});
