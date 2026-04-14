import { describe, it, expect } from 'vitest';
import { createInitialState } from '../state';
import {
  Phase,
  Difficulty,
  ResourceType,
  CrewRole,
  HealthStatus,
  ConsumptionLevel,
  DIFFICULTY_MODIFIERS,
  INITIAL_TRAJECTORY_ERROR,
} from '../types';

describe('createInitialState', () => {
  const baseConfig = {
    difficulty: Difficulty.Cadet,
    commanderName: 'TestCommander',
    rngSeed: 42,
  };

  it('creates valid GameState with correct defaults', () => {
    const state = createInitialState(baseConfig);

    expect(state.phase).toBe(Phase.MissionPrep);
    expect(state.turn).toBe(0);
    expect(state.totalTurns).toBe(0);
    expect(state.missionDay).toBe(0);
    expect(state.morale).toBe(75);
    expect(state.consumptionLevel).toBe(ConsumptionLevel.Standard);
    expect(state.selectedLandingSite).toBeNull();
    expect(state.narrativeLog).toEqual([]);
    expect(state.currentEvent).toBeNull();
    expect(state.isGameOver).toBe(false);
    expect(state.gameOverReason).toBeNull();
    expect(state.victoryTier).toBeNull();
    expect(state.score).toBe(0);
    expect(state.difficulty).toBe(Difficulty.Cadet);
    expect(state.rngSeed).toBe(42);
  });

  it('crew has 4 members (Commander + 3 specialists)', () => {
    const state = createInitialState(baseConfig);

    expect(state.crew).toHaveLength(4);

    const roles = state.crew.map(c => c.role);
    expect(roles).toContain(CrewRole.Commander);
    expect(roles).toContain(CrewRole.Pilot);
    expect(roles).toContain(CrewRole.Engineer);
    expect(roles).toContain(CrewRole.Scientist);
  });

  it('commander has the player-specified name', () => {
    const state = createInitialState(baseConfig);
    const commander = state.crew.find(c => c.role === CrewRole.Commander);

    expect(commander).toBeDefined();
    expect(commander!.name).toBe('TestCommander');
  });

  it('all crew start healthy and alive', () => {
    const state = createInitialState(baseConfig);

    for (const member of state.crew) {
      expect(member.health).toBe(100);
      expect(member.healthStatus).toBe(HealthStatus.Healthy);
      expect(member.isAlive).toBe(true);
      expect(member.turnsInState).toBe(0);
    }
  });

  it('resources start at 0 (allocated during prep)', () => {
    const state = createInitialState(baseConfig);

    expect(state.resources[ResourceType.Propulsion]).toBe(0);
    expect(state.resources[ResourceType.LifeSupport]).toBe(0);
    expect(state.resources[ResourceType.SpareParts]).toBe(0);
    expect(state.resources[ResourceType.Shielding]).toBe(0);
    expect(state.resources[ResourceType.Medical]).toBe(0);
    expect(state.resources[ResourceType.Budget]).toBe(0);
  });

  it('phase starts at MissionPrep', () => {
    const state = createInitialState(baseConfig);
    expect(state.phase).toBe(Phase.MissionPrep);
  });

  it('phaseData has correct initial values', () => {
    const state = createInitialState(baseConfig);

    expect(state.phaseData.launchProfile).toBeNull();
    expect(state.phaseData.launchComplicationOccurred).toBe(false);
    expect(state.phaseData.trajectoryError).toBe(INITIAL_TRAJECTORY_ERROR);
    expect(state.phaseData.transitTurnsRemaining).toBe(3);
    expect(state.phaseData.gatewayVisited).toBe(false);
    expect(state.phaseData.gatewayResupplied).toBe(false);
    expect(state.phaseData.landingAttempted).toBe(false);
    expect(state.phaseData.landingScore).toBe(0);
    expect(state.phaseData.landingAbortUsed).toBe(false);
    expect(state.phaseData.surfaceTurnsCompleted).toBe(0);
    expect(state.phaseData.evasCompleted).toBe(0);
    expect(state.phaseData.scienceEvasCompleted).toBe(0);
    expect(state.phaseData.baseConstructionProgress).toBe(0);
  });

  it('different difficulties produce different surface base turns', () => {
    const cadet = createInitialState({ ...baseConfig, difficulty: Difficulty.Cadet });
    const astronaut = createInitialState({ ...baseConfig, difficulty: Difficulty.Astronaut });
    const commander = createInitialState({ ...baseConfig, difficulty: Difficulty.Commander });
    const ironman = createInitialState({ ...baseConfig, difficulty: Difficulty.Ironman });

    expect(cadet.phaseData.surfaceTurnsTotal).toBe(DIFFICULTY_MODIFIERS[Difficulty.Cadet].surfaceBaseTurns);
    expect(astronaut.phaseData.surfaceTurnsTotal).toBe(DIFFICULTY_MODIFIERS[Difficulty.Astronaut].surfaceBaseTurns);
    expect(commander.phaseData.surfaceTurnsTotal).toBe(DIFFICULTY_MODIFIERS[Difficulty.Commander].surfaceBaseTurns);
    expect(ironman.phaseData.surfaceTurnsTotal).toBe(DIFFICULTY_MODIFIERS[Difficulty.Ironman].surfaceBaseTurns);

    // Cadet should have the most generous turns
    expect(cadet.phaseData.surfaceTurnsTotal).toBeGreaterThanOrEqual(ironman.phaseData.surfaceTurnsTotal);
  });

  it('generates random seed when none provided', () => {
    const state1 = createInitialState({ difficulty: Difficulty.Cadet, commanderName: 'A' });
    const state2 = createInitialState({ difficulty: Difficulty.Cadet, commanderName: 'A' });

    // Seeds should be numbers (though not guaranteed different due to randomness)
    expect(typeof state1.rngSeed).toBe('number');
    expect(typeof state2.rngSeed).toBe('number');
  });
});
