import { describe, it, expect } from 'vitest';
import { TradingSystem } from '../trading';
import { createInitialState } from '../../engine/state';
import {
  Difficulty,
  Phase,
  ResourceType,
  RESOURCE_COSTS,
  GATEWAY_BASE_PRICE_MULTIPLIER,
  DIFFICULTY_MODIFIERS,
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
    phase: Phase.Gateway,
    resources: {
      ...base.resources,
      [ResourceType.Propulsion]: 200,
      [ResourceType.LifeSupport]: 20,
      [ResourceType.SpareParts]: 10,
      [ResourceType.Shielding]: 5,
      [ResourceType.Medical]: 5,
      [ResourceType.Budget]: 200,
    },
    ...overrides,
  };
}

describe('TradingSystem', () => {
  let system: TradingSystem;

  beforeEach(() => {
    system = new TradingSystem();
  });

  describe('getGatewayPrices', () => {
    it('returns prices higher than base costs', () => {
      const state = makeState();
      const prices = system.getGatewayPrices(state);

      for (const rt of Object.values(ResourceType)) {
        const baseCost = RESOURCE_COSTS[rt].costPerUnit;
        expect(prices[rt]).toBeGreaterThanOrEqual(baseCost);
      }
    });

    it('prices scale with difficulty', () => {
      const cadetState = makeState({
        difficulty: Difficulty.Cadet,
      });
      const ironmanState = makeState({
        difficulty: Difficulty.Ironman,
      });

      const cadetPrices = system.getGatewayPrices(cadetState);
      const ironmanPrices = system.getGatewayPrices(ironmanState);

      // Ironman gateway price multiplier is higher
      expect(ironmanPrices[ResourceType.LifeSupport]).toBeGreaterThanOrEqual(
        cadetPrices[ResourceType.LifeSupport]
      );
    });
  });

  describe('canAfford', () => {
    it('returns true when budget is sufficient', () => {
      const state = makeState();
      expect(system.canAfford(state, { [ResourceType.LifeSupport]: 5 })).toBe(true);
    });

    it('returns false when budget is insufficient', () => {
      const state = makeState({
        resources: { ...makeState().resources, [ResourceType.Budget]: 0 },
      });
      expect(system.canAfford(state, { [ResourceType.LifeSupport]: 5 })).toBe(false);
    });

    it('ignores Budget resource type in purchases', () => {
      const state = makeState();
      expect(system.canAfford(state, { [ResourceType.Budget]: 999 })).toBe(true);
    });
  });

  describe('executePurchase', () => {
    it('adds resources and deducts budget', () => {
      const state = makeState();
      const initial = state.resources[ResourceType.LifeSupport];
      const initialBudget = state.resources[ResourceType.Budget];

      const result = system.executePurchase(state, { [ResourceType.LifeSupport]: 5 });

      expect(result.resources[ResourceType.LifeSupport]).toBe(initial + 5);
      expect(result.resources[ResourceType.Budget]).toBeLessThan(initialBudget);
    });

    it('budget clamps to 0', () => {
      const state = makeState({
        resources: { ...makeState().resources, [ResourceType.Budget]: 1 },
      });
      // Try to buy something expensive
      const result = system.executePurchase(state, { [ResourceType.Medical]: 10 });
      expect(result.resources[ResourceType.Budget]).toBe(0);
    });

    it('handles multiple resource purchases', () => {
      const state = makeState();
      const result = system.executePurchase(state, {
        [ResourceType.LifeSupport]: 2,
        [ResourceType.SpareParts]: 3,
      });

      expect(result.resources[ResourceType.LifeSupport]).toBe(
        state.resources[ResourceType.LifeSupport] + 2
      );
      expect(result.resources[ResourceType.SpareParts]).toBe(
        state.resources[ResourceType.SpareParts] + 3
      );
    });
  });
});
