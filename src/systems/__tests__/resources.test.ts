import { describe, it, expect } from 'vitest';
import { ResourceSystem } from '../resources';
import { createInitialState } from '../../engine/state';
import {
  Difficulty,
  Phase,
  ResourceType,
  ConsumptionLevel,
  CONSUMPTION_RATES,
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
    phase: Phase.LunarTransit,
    turn: 1,
    resources: {
      ...base.resources,
      [ResourceType.Propulsion]: 200,
      [ResourceType.LifeSupport]: 30,
      [ResourceType.SpareParts]: 15,
      [ResourceType.Shielding]: 10,
      [ResourceType.Medical]: 8,
      [ResourceType.Budget]: 50,
    },
    ...overrides,
  };
}

describe('ResourceSystem', () => {
  let system: ResourceSystem;

  beforeEach(() => {
    system = new ResourceSystem();
  });

  describe('initialize', () => {
    it('returns state with copied resources', () => {
      const state = makeState();
      const initialized = system.initialize(state);
      expect(initialized.resources[ResourceType.Propulsion]).toBe(200);
    });
  });

  describe('processTurn', () => {
    it('deducts life support based on Standard consumption', () => {
      const state = makeState({ consumptionLevel: ConsumptionLevel.Standard });
      const initialized = system.initialize(state);
      const next = system.processTurn(initialized);

      const expected = 30 - CONSUMPTION_RATES[ConsumptionLevel.Standard];
      expect(next.resources[ResourceType.LifeSupport]).toBe(expected);
    });

    it('deducts life support based on Rationing consumption', () => {
      const state = makeState({ consumptionLevel: ConsumptionLevel.Rationing });
      const initialized = system.initialize(state);
      const next = system.processTurn(initialized);

      const expected = 30 - CONSUMPTION_RATES[ConsumptionLevel.Rationing];
      expect(next.resources[ResourceType.LifeSupport]).toBe(expected);
    });

    it('deducts life support based on Generous consumption', () => {
      const state = makeState({ consumptionLevel: ConsumptionLevel.Generous });
      const initialized = system.initialize(state);
      const next = system.processTurn(initialized);

      const expected = 30 - CONSUMPTION_RATES[ConsumptionLevel.Generous];
      expect(next.resources[ResourceType.LifeSupport]).toBe(expected);
    });

    it('clamps resources to 0', () => {
      const state = makeState({
        resources: {
          ...makeState().resources,
          [ResourceType.LifeSupport]: 0.3,
        },
      });
      const initialized = system.initialize(state);
      const next = system.processTurn(initialized);

      expect(next.resources[ResourceType.LifeSupport]).toBe(0);
    });

    it('triggers game over when life support depleted', () => {
      const state = makeState({
        resources: {
          ...makeState().resources,
          [ResourceType.LifeSupport]: 0,
        },
      });
      const initialized = system.initialize(state);
      const next = system.processTurn(initialized);

      expect(next.isGameOver).toBe(true);
      expect(next.gameOverReason).toContain('Life support');
    });

    it('does not trigger game over for depleted LS in Colony phase', () => {
      const state = makeState({
        phase: Phase.Colony,
        resources: {
          ...makeState().resources,
          [ResourceType.LifeSupport]: 0,
        },
      });
      const initialized = system.initialize(state);
      const next = system.processTurn(initialized);

      expect(next.isGameOver).toBe(false);
    });

    it('triggers game over when propulsion depleted during transit', () => {
      const state = makeState({
        phase: Phase.LunarTransit,
        resources: {
          ...makeState().resources,
          [ResourceType.Propulsion]: 0,
        },
      });
      const initialized = system.initialize(state);
      const next = system.processTurn(initialized);

      expect(next.isGameOver).toBe(true);
      expect(next.gameOverReason).toContain('Propulsion');
    });

    it('does not trigger propulsion game over during SurfaceOps', () => {
      const state = makeState({
        phase: Phase.SurfaceOps,
        resources: {
          ...makeState().resources,
          [ResourceType.Propulsion]: 0,
          [ResourceType.LifeSupport]: 30,
        },
      });
      const initialized = system.initialize(state);
      const next = system.processTurn(initialized);

      expect(next.isGameOver).toBe(false);
    });

    it('generates depletion warnings for low resources', () => {
      // Initialize with a high starting value, then drop it before processTurn
      const state = makeState({
        resources: {
          ...makeState().resources,
          [ResourceType.SpareParts]: 20, // Initialize with high value
        },
      });
      const initialized = system.initialize(state);
      // Now drop the resource to below 20% threshold (20% of 20 = 4)
      initialized.resources[ResourceType.SpareParts] = 2;
      const next = system.processTurn(initialized);

      const warnings = next.narrativeLog.filter(n =>
        n.type === 'WARNING' && n.text.includes('SPARE_PARTS')
      );
      expect(warnings.length).toBeGreaterThan(0);
    });
  });

  describe('pilot fuel discount', () => {
    it('isPilotAlive returns true when pilot is alive', () => {
      const state = makeState();
      expect(system.isPilotAlive(state)).toBe(true);
    });

    it('isPilotAlive returns false when pilot is dead', () => {
      const state = makeState();
      const pilot = state.crew.find(c => c.role === 'PILOT');
      if (pilot) {
        pilot.isAlive = false;
      }
      expect(system.isPilotAlive(state)).toBe(false);
    });

    it('applyPilotFuelDiscount reduces cost by 15% when pilot alive', () => {
      const state = makeState();
      expect(system.applyPilotFuelDiscount(100, state)).toBe(85);
    });

    it('applyPilotFuelDiscount returns full cost when pilot dead', () => {
      const state = makeState();
      const pilot = state.crew.find(c => c.role === 'PILOT');
      if (pilot) pilot.isAlive = false;
      expect(system.applyPilotFuelDiscount(100, state)).toBe(100);
    });
  });
});
