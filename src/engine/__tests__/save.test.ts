import { describe, it, expect } from 'vitest';
import { createSaveData, loadSaveData } from '../save';
import { createInitialState } from '../state';
import { Difficulty, Phase, SAVE_VERSION, ResourceType, CrewRole } from '../types';

describe('Save/Load System', () => {
  const config = {
    difficulty: Difficulty.Astronaut,
    commanderName: 'SaveTest',
    rngSeed: 42,
  };

  it('createSaveData produces valid SaveData', () => {
    const state = createInitialState(config);
    const save = createSaveData(state);

    expect(save.version).toBe(SAVE_VERSION);
    expect(save.timestamp).toBeTruthy();
    expect(new Date(save.timestamp).getTime()).not.toBeNaN();
    expect(save.gameState).toBeDefined();
  });

  it('includes correct metadata', () => {
    const state = createInitialState(config);
    const save = createSaveData(state);

    expect(save.metadata.commanderName).toBe('SaveTest');
    expect(save.metadata.difficulty).toBe(Difficulty.Astronaut);
    expect(save.metadata.turn).toBe(0);
    expect(save.metadata.phase).toBe(Phase.MissionPrep);
    expect(save.metadata.crewAlive).toBe(4);
  });

  it('saves and loads game state correctly (round-trip)', () => {
    const state = createInitialState(config);
    // Modify state to have non-default values
    state.turn = 5;
    state.morale = 60;
    state.resources[ResourceType.Propulsion] = 250;
    state.resources[ResourceType.LifeSupport] = 30;
    state.phase = Phase.LunarTransit;

    const save = createSaveData(state);
    const loaded = loadSaveData(save);

    expect(loaded.turn).toBe(5);
    expect(loaded.morale).toBe(60);
    expect(loaded.resources[ResourceType.Propulsion]).toBe(250);
    expect(loaded.resources[ResourceType.LifeSupport]).toBe(30);
    expect(loaded.phase).toBe(Phase.LunarTransit);
  });

  it('loaded state is a deep clone (no reference sharing)', () => {
    const state = createInitialState(config);
    const save = createSaveData(state);
    const loaded = loadSaveData(save);

    // Mutating loaded should not affect save data
    loaded.morale = 0;
    loaded.crew[0].health = 0;
    loaded.resources[ResourceType.Propulsion] = 999;

    expect(save.gameState.morale).toBe(75);
    expect(save.gameState.crew[0].health).toBe(100);
    expect(save.gameState.resources[ResourceType.Propulsion]).toBe(0);
  });

  it('validates save version on load', () => {
    const state = createInitialState(config);
    const save = createSaveData(state);
    save.version = 999;

    expect(() => loadSaveData(save)).toThrow(/version mismatch/i);
  });

  it('metadata reflects crew deaths', () => {
    const state = createInitialState(config);
    state.crew[1].isAlive = false;
    state.crew[2].isAlive = false;

    const save = createSaveData(state);
    expect(save.metadata.crewAlive).toBe(2);
  });
});
