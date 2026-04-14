import { describe, it, expect } from 'vitest';
import { processTurn } from '../turns';
import { createRng } from '../rng';
import { createInitialState } from '../state';
import {
  Phase,
  Difficulty,
  ResourceType,
  HealthStatus,
  ConsumptionLevel,
  CONSUMPTION_RATES,
  MAX_MISSION_TURNS,
} from '../types';
import type { GameState } from '../types';

function makeTransitState(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialState({
    difficulty: Difficulty.Cadet,
    commanderName: 'Test',
    rngSeed: 42,
  });
  return {
    ...base,
    phase: Phase.LunarTransit,
    resources: {
      ...base.resources,
      [ResourceType.Propulsion]: 200,
      [ResourceType.LifeSupport]: 30,
      [ResourceType.SpareParts]: 20,
      [ResourceType.Shielding]: 10,
      [ResourceType.Medical]: 10,
      [ResourceType.Budget]: 100,
    },
    ...overrides,
  };
}

describe('processTurn', () => {
  it('increments turn counters', () => {
    const state = makeTransitState();
    const rng = createRng(42);
    const { state: next } = processTurn(state, rng);

    expect(next.turn).toBe(state.turn + 1);
    expect(next.totalTurns).toBe(state.totalTurns + 1);
    expect(next.missionDay).toBe(state.missionDay + 1);
  });

  it('deducts life support based on consumption level', () => {
    for (const level of [ConsumptionLevel.Rationing, ConsumptionLevel.Standard, ConsumptionLevel.Generous]) {
      const state = makeTransitState({ consumptionLevel: level });
      const rng = createRng(99999); // Use a seed that minimizes event interference
      const { state: next } = processTurn(state, rng);

      // Life support should decrease by at least the consumption rate
      const expectedMin = state.resources[ResourceType.LifeSupport] - CONSUMPTION_RATES[level];
      expect(next.resources[ResourceType.LifeSupport]).toBeLessThanOrEqual(expectedMin);
    }
  });

  it('life support clamps to 0', () => {
    const state = makeTransitState({
      resources: {
        ...makeTransitState().resources,
        [ResourceType.LifeSupport]: 0.3,
      },
    });
    const rng = createRng(42);
    const { state: next } = processTurn(state, rng);

    expect(next.resources[ResourceType.LifeSupport]).toBe(0);
  });

  it('depleted life support triggers game over', () => {
    const state = makeTransitState({
      resources: {
        ...makeTransitState().resources,
        [ResourceType.LifeSupport]: 0,
      },
    });
    const rng = createRng(42);
    const { state: next } = processTurn(state, rng);

    expect(next.isGameOver).toBe(true);
    expect(next.gameOverReason).toBeTruthy();
  });

  it('all crew dead triggers game over', () => {
    const state = makeTransitState();
    for (const member of state.crew) {
      member.isAlive = false;
      member.healthStatus = HealthStatus.Dead;
      member.health = 0;
    }
    const rng = createRng(42);
    const { state: next } = processTurn(state, rng);

    expect(next.isGameOver).toBe(true);
    expect(next.gameOverReason).toContain('perished');
  });

  it('max turns exceeded triggers game over', () => {
    const state = makeTransitState({ totalTurns: MAX_MISSION_TURNS - 1 });
    const rng = createRng(42);
    const { state: next } = processTurn(state, rng);

    expect(next.isGameOver).toBe(true);
    expect(next.gameOverReason).toContain('expired');
  });

  it('decrements transit turns remaining during LunarTransit', () => {
    const state = makeTransitState({
      phaseData: { ...makeTransitState().phaseData, transitTurnsRemaining: 3 },
    });
    const rng = createRng(42);
    const { state: next } = processTurn(state, rng);

    expect(next.phaseData.transitTurnsRemaining).toBe(2);
  });

  it('increments surface turns during SurfaceOps', () => {
    const state = makeTransitState({
      phase: Phase.SurfaceOps,
      phaseData: {
        ...makeTransitState().phaseData,
        surfaceTurnsCompleted: 2,
        surfaceTurnsTotal: 6,
      },
    });
    const rng = createRng(42);
    const { state: next } = processTurn(state, rng);

    expect(next.phaseData.surfaceTurnsCompleted).toBe(3);
  });

  it('auto-deducts MU for ill/critical crew', () => {
    const state = makeTransitState();
    state.crew[1].healthStatus = HealthStatus.Ill;
    state.crew[1].isAlive = true;
    const initialMU = state.resources[ResourceType.Medical];

    const rng = createRng(99999);
    const { state: next } = processTurn(state, rng);

    expect(next.resources[ResourceType.Medical]).toBeLessThan(initialMU);
  });

  it('returns narrative entries', () => {
    const state = makeTransitState();
    const rng = createRng(42);
    const { narrative } = processTurn(state, rng);

    expect(Array.isArray(narrative)).toBe(true);
  });
});
