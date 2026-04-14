import { describe, it, expect } from 'vitest';
import { canAdvancePhase, advancePhase } from '../phases';
import { createInitialState } from '../state';
import { Phase, Difficulty, ResourceType, LaunchProfile } from '../types';
import type { GameState } from '../types';

function makeState(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialState({
    difficulty: Difficulty.Cadet,
    commanderName: 'Test',
    rngSeed: 42,
  });
  return { ...base, ...overrides };
}

describe('canAdvancePhase', () => {
  it('MissionPrep: cannot advance without propulsion', () => {
    const state = makeState({ phase: Phase.MissionPrep });
    expect(canAdvancePhase(state)).toBe(false);
  });

  it('MissionPrep: can advance with propulsion allocated', () => {
    const state = makeState({
      phase: Phase.MissionPrep,
      resources: {
        ...makeState().resources,
        [ResourceType.Propulsion]: 300,
      },
    });
    expect(canAdvancePhase(state)).toBe(true);
  });

  it('Launch: cannot advance without launch profile', () => {
    const state = makeState({ phase: Phase.Launch });
    expect(canAdvancePhase(state)).toBe(false);
  });

  it('Launch: can advance with launch profile selected', () => {
    const state = makeState({
      phase: Phase.Launch,
      phaseData: {
        ...makeState().phaseData,
        launchProfile: LaunchProfile.Standard,
      },
    });
    expect(canAdvancePhase(state)).toBe(true);
  });

  it('LunarTransit: cannot advance with turns remaining', () => {
    const state = makeState({
      phase: Phase.LunarTransit,
      phaseData: { ...makeState().phaseData, transitTurnsRemaining: 2 },
    });
    expect(canAdvancePhase(state)).toBe(false);
  });

  it('LunarTransit: can advance when turns reach 0', () => {
    const state = makeState({
      phase: Phase.LunarTransit,
      phaseData: { ...makeState().phaseData, transitTurnsRemaining: 0 },
    });
    expect(canAdvancePhase(state)).toBe(true);
  });

  it('Gateway: can advance when visited', () => {
    const state = makeState({
      phase: Phase.Gateway,
      phaseData: { ...makeState().phaseData, gatewayVisited: true },
    });
    expect(canAdvancePhase(state)).toBe(true);
  });

  it('Descent: can advance when landing attempted', () => {
    const state = makeState({
      phase: Phase.Descent,
      phaseData: { ...makeState().phaseData, landingAttempted: true },
    });
    expect(canAdvancePhase(state)).toBe(true);
  });

  it('SurfaceOps: can advance when turns completed', () => {
    const state = makeState({
      phase: Phase.SurfaceOps,
      phaseData: {
        ...makeState().phaseData,
        surfaceTurnsCompleted: 6,
        surfaceTurnsTotal: 6,
      },
    });
    expect(canAdvancePhase(state)).toBe(true);
  });

  it('Colony: cannot advance (final phase)', () => {
    const state = makeState({ phase: Phase.Colony });
    expect(canAdvancePhase(state)).toBe(false);
  });

  it('returns false when game is over', () => {
    const state = makeState({
      phase: Phase.Launch,
      isGameOver: true,
      phaseData: { ...makeState().phaseData, launchProfile: LaunchProfile.Standard },
    });
    expect(canAdvancePhase(state)).toBe(false);
  });
});

describe('advancePhase', () => {
  it('MissionPrep → Launch', () => {
    const state = makeState({ phase: Phase.MissionPrep });
    const next = advancePhase(state);
    expect(next.phase).toBe(Phase.Launch);
  });

  it('Launch → LunarTransit', () => {
    const state = makeState({ phase: Phase.Launch });
    const next = advancePhase(state);
    expect(next.phase).toBe(Phase.LunarTransit);
  });

  it('LunarTransit → Gateway', () => {
    const state = makeState({ phase: Phase.LunarTransit });
    const next = advancePhase(state);
    expect(next.phase).toBe(Phase.Gateway);
  });

  it('Colony does not advance (returns same phase)', () => {
    const state = makeState({ phase: Phase.Colony });
    const next = advancePhase(state);
    expect(next.phase).toBe(Phase.Colony);
  });

  it('adds narrative entries on phase transition', () => {
    const state = makeState({ phase: Phase.MissionPrep, narrativeLog: [] });
    const next = advancePhase(state);
    expect(next.narrativeLog.length).toBeGreaterThan(0);
    expect(next.narrativeLog[0].type).toBe('STORY');
  });

  it('Gateway phase applies trajectory error effects', () => {
    // High trajectory error → game over
    const state = makeState({
      phase: Phase.LunarTransit,
      phaseData: { ...makeState().phaseData, trajectoryError: 15 },
    });
    const next = advancePhase(state);
    expect(next.phase).toBe(Phase.Gateway);
    expect(next.isGameOver).toBe(true);
  });

  it('Gateway phase applies fuel penalty for moderate trajectory error', () => {
    const state = makeState({
      phase: Phase.LunarTransit,
      resources: { ...makeState().resources, [ResourceType.Propulsion]: 100 },
      phaseData: { ...makeState().phaseData, trajectoryError: 10 },
    });
    const next = advancePhase(state);
    expect(next.phase).toBe(Phase.Gateway);
    expect(next.resources[ResourceType.Propulsion]).toBe(80); // -20 FU
  });
});
