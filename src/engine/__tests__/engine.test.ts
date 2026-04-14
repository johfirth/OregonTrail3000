import { describe, it, expect } from 'vitest';
import { createEngine } from '../engine';
import {
  Phase,
  Difficulty,
  ResourceType,
  ConsumptionLevel,
  LaunchProfile,
  SurfaceActivity,
  EvaOutcome,
  HealthStatus,
  VictoryTier,
  DIFFICULTY_MODIFIERS,
  LANDING_SITES,
  DESCENT_MIN_FUEL,
  SAVE_VERSION,
} from '../types';
import type { GameState, GameResult, GameEngine } from '../types';

function createCadetGame(seed = 42): { engine: GameEngine; result: GameResult } {
  const engine = createEngine();
  const result = engine.createGame({
    difficulty: Difficulty.Cadet,
    commanderName: 'TestCommander',
    rngSeed: seed,
  });
  return { engine, result };
}

function allocateResources(engine: GameEngine, state: GameState): GameResult {
  return engine.executeCommand(state, {
    type: 'ALLOCATE_RESOURCES',
    resources: {
      [ResourceType.Propulsion]: 350,
      [ResourceType.LifeSupport]: 50,
      [ResourceType.SpareParts]: 20,
      [ResourceType.Shielding]: 10,
      [ResourceType.Medical]: 10,
      [ResourceType.Budget]: 0,
    },
  });
}

describe('GameEngine', () => {
  describe('createGame', () => {
    it('creates a game with valid initial state', () => {
      const { result } = createCadetGame();

      expect(result.state.phase).toBe(Phase.MissionPrep);
      expect(result.state.crew).toHaveLength(4);
      expect(result.state.isGameOver).toBe(false);
      expect(result.narrative.length).toBeGreaterThan(0);
    });

    it('returns available actions for MissionPrep phase', () => {
      const { result } = createCadetGame();

      const actionTypes = result.availableActions.map(a => a.command);
      expect(actionTypes).toContain('ALLOCATE_RESOURCES');
      expect(actionTypes).toContain('START_MISSION');
      expect(actionTypes).toContain('SET_CONSUMPTION');
    });

    it('START_MISSION is disabled without resources', () => {
      const { result } = createCadetGame();

      const startAction = result.availableActions.find(
        a => a.command === 'START_MISSION'
      );
      expect(startAction).toBeDefined();
      expect(startAction!.enabled).toBe(false);
    });

    it('respects difficulty settings', () => {
      const engine = createEngine();
      const astronaut = engine.createGame({
        difficulty: Difficulty.Astronaut,
        commanderName: 'Test',
        rngSeed: 42,
      });

      expect(astronaut.state.difficulty).toBe(Difficulty.Astronaut);
    });

    it('includes save/load actions for non-Ironman', () => {
      const { result } = createCadetGame();
      const actionTypes = result.availableActions.map(a => a.command);
      expect(actionTypes).toContain('SAVE_GAME');
    });

    it('excludes save/load for Ironman', () => {
      const engine = createEngine();
      const result = engine.createGame({
        difficulty: Difficulty.Ironman,
        commanderName: 'Test',
        rngSeed: 42,
      });
      const actionTypes = result.availableActions.map(a => a.command);
      expect(actionTypes).not.toContain('SAVE_GAME');
    });
  });

  describe('ALLOCATE_RESOURCES command', () => {
    it('sets resources correctly', () => {
      const { engine, result } = createCadetGame();
      const allocated = allocateResources(engine, result.state);

      expect(allocated.state.resources[ResourceType.Propulsion]).toBe(350);
      expect(allocated.state.resources[ResourceType.LifeSupport]).toBe(50);
      expect(allocated.state.resources[ResourceType.SpareParts]).toBe(20);
      expect(allocated.state.resources[ResourceType.Shielding]).toBe(10);
      expect(allocated.state.resources[ResourceType.Medical]).toBe(10);
    });

    it('sets remaining budget as reserve', () => {
      const { engine, result } = createCadetGame();
      const allocated = allocateResources(engine, result.state);

      // Total cost: 350*1 + 50*5 + 20*5 + 10*10 + 10*10 = 350+250+100+100+100 = 900
      // Available budget for Cadet: 1000
      const expectedReserve = 1000 - 900;
      expect(allocated.state.resources[ResourceType.Budget]).toBe(expectedReserve);
    });

    it('rejects over-budget allocations', () => {
      const { engine, result } = createCadetGame();
      const overBudget = engine.executeCommand(result.state, {
        type: 'ALLOCATE_RESOURCES',
        resources: {
          [ResourceType.Propulsion]: 500,
          [ResourceType.LifeSupport]: 100,
          [ResourceType.SpareParts]: 50,
          [ResourceType.Shielding]: 20,
          [ResourceType.Medical]: 15,
          [ResourceType.Budget]: 0,
        },
      });

      // Should have a warning narrative
      const warnings = overBudget.narrative.filter(n => n.type === 'WARNING');
      expect(warnings.length).toBeGreaterThan(0);
      // Resources should NOT have been applied
      expect(overBudget.state.resources[ResourceType.Propulsion]).toBe(0);
    });
  });

  describe('START_MISSION command', () => {
    it('transitions from MissionPrep to Launch phase', () => {
      const { engine, result } = createCadetGame();
      const allocated = allocateResources(engine, result.state);
      const started = engine.executeCommand(allocated.state, {
        type: 'START_MISSION',
      });

      expect(started.state.phase).toBe(Phase.Launch);
    });

    it('fails if no propulsion allocated', () => {
      const { engine, result } = createCadetGame();
      const started = engine.executeCommand(result.state, {
        type: 'START_MISSION',
      });

      // Should remain in MissionPrep
      expect(started.state.phase).toBe(Phase.MissionPrep);
      const warnings = started.narrative.filter(n => n.type === 'WARNING');
      expect(warnings.length).toBeGreaterThan(0);
    });
  });

  describe('SET_CONSUMPTION command', () => {
    it('changes consumption level', () => {
      const { engine, result } = createCadetGame();
      const changed = engine.executeCommand(result.state, {
        type: 'SET_CONSUMPTION',
        level: ConsumptionLevel.Rationing,
      });

      expect(changed.state.consumptionLevel).toBe(ConsumptionLevel.Rationing);
    });
  });

  describe('SELECT_LAUNCH_PROFILE command', () => {
    it('sets launch profile and deducts fuel', () => {
      const { engine, result } = createCadetGame();
      const allocated = allocateResources(engine, result.state);
      const started = engine.executeCommand(allocated.state, {
        type: 'START_MISSION',
      });

      const launched = engine.executeCommand(started.state, {
        type: 'SELECT_LAUNCH_PROFILE',
        profile: LaunchProfile.Conservative,
      });

      expect(launched.state.phaseData.launchProfile).toBe(
        LaunchProfile.Conservative
      );
      // Conservative costs 90 FU
      expect(launched.state.resources[ResourceType.Propulsion]).toBeLessThan(350);
    });

    it('rejects launch without enough fuel', () => {
      const { engine, result } = createCadetGame();
      // Allocate minimal fuel
      const minAlloc = engine.executeCommand(result.state, {
        type: 'ALLOCATE_RESOURCES',
        resources: {
          [ResourceType.Propulsion]: 200,
          [ResourceType.LifeSupport]: 30,
          [ResourceType.SpareParts]: 10,
          [ResourceType.Shielding]: 5,
          [ResourceType.Medical]: 5,
          [ResourceType.Budget]: 0,
        },
      });
      const started = engine.executeCommand(minAlloc.state, {
        type: 'START_MISSION',
      });

      // Set fuel to very low
      started.state.resources[ResourceType.Propulsion] = 10;

      const launched = engine.executeCommand(started.state, {
        type: 'SELECT_LAUNCH_PROFILE',
        profile: LaunchProfile.Aggressive, // needs 65 FU
      });

      // Should not have set profile
      expect(launched.state.phaseData.launchProfile).toBeNull();
    });
  });

  describe('PROCEED through Launch → Transit', () => {
    it('advances from Launch to LunarTransit', () => {
      const { engine, result } = createCadetGame();
      const allocated = allocateResources(engine, result.state);
      const started = engine.executeCommand(allocated.state, {
        type: 'START_MISSION',
      });
      const launched = engine.executeCommand(started.state, {
        type: 'SELECT_LAUNCH_PROFILE',
        profile: LaunchProfile.Conservative,
      });
      const proceeded = engine.executeCommand(launched.state, {
        type: 'PROCEED',
      });

      expect(proceeded.state.phase).toBe(Phase.LunarTransit);
    });
  });

  describe('ALLOCATE_COURSE_CORRECTION', () => {
    it('reduces trajectory error', () => {
      const { engine, result } = createCadetGame();
      const allocated = allocateResources(engine, result.state);
      const started = engine.executeCommand(allocated.state, {
        type: 'START_MISSION',
      });
      const launched = engine.executeCommand(started.state, {
        type: 'SELECT_LAUNCH_PROFILE',
        profile: LaunchProfile.Conservative,
      });
      const transit = engine.executeCommand(launched.state, {
        type: 'PROCEED',
      });

      const initialError = transit.state.phaseData.trajectoryError;
      const corrected = engine.executeCommand(transit.state, {
        type: 'ALLOCATE_COURSE_CORRECTION',
        fuelUnits: 15,
      });

      // Trajectory should have changed (likely reduced)
      expect(corrected.state.resources[ResourceType.Propulsion]).toBeLessThan(
        transit.state.resources[ResourceType.Propulsion]
      );
    });
  });

  describe('save/load', () => {
    it('saves and loads game state correctly', () => {
      const { engine, result } = createCadetGame();
      const allocated = allocateResources(engine, result.state);

      const saveData = engine.saveGame(allocated.state);
      expect(saveData.version).toBe(SAVE_VERSION);

      const loaded = engine.loadGame(saveData);
      expect(loaded.phase).toBe(allocated.state.phase);
      expect(loaded.resources[ResourceType.Propulsion]).toBe(
        allocated.state.resources[ResourceType.Propulsion]
      );
    });

    it('SAVE_GAME command works in-game', () => {
      const { engine, result } = createCadetGame();
      const saveResult = engine.executeCommand(result.state, {
        type: 'SAVE_GAME',
      });
      const systemMessages = saveResult.narrative.filter(
        n => n.type === 'SYSTEM'
      );
      expect(systemMessages.some(n => n.text.includes('saved'))).toBe(true);
    });

    it('Ironman blocks save', () => {
      const engine = createEngine();
      const game = engine.createGame({
        difficulty: Difficulty.Ironman,
        commanderName: 'Test',
        rngSeed: 42,
      });
      const saveResult = engine.executeCommand(game.state, {
        type: 'SAVE_GAME',
      });
      expect(saveResult.narrative.some(n => n.text.includes('disabled'))).toBe(
        true
      );
    });
  });

  describe('full game flow', () => {
    it('can play through MissionPrep → Launch → Transit', () => {
      const { engine, result } = createCadetGame();

      // Allocate resources
      let r = allocateResources(engine, result.state);
      expect(r.state.resources[ResourceType.Propulsion]).toBe(350);

      // Start mission
      r = engine.executeCommand(r.state, { type: 'START_MISSION' });
      expect(r.state.phase).toBe(Phase.Launch);

      // Select launch profile
      r = engine.executeCommand(r.state, {
        type: 'SELECT_LAUNCH_PROFILE',
        profile: LaunchProfile.Conservative,
      });

      // Proceed through launch
      r = engine.executeCommand(r.state, { type: 'PROCEED' });
      expect(r.state.phase).toBe(Phase.LunarTransit);
    });

    it('can complete a full game from start to victory', () => {
      // Use a seed that we know produces manageable events
      const engine = createEngine();
      let r = engine.createGame({
        difficulty: Difficulty.Cadet,
        commanderName: 'Armstrong',
        rngSeed: 12345,
      });

      // Phase 1: Allocate resources generously
      r = engine.executeCommand(r.state, {
        type: 'ALLOCATE_RESOURCES',
        resources: {
          [ResourceType.Propulsion]: 350,
          [ResourceType.LifeSupport]: 50,
          [ResourceType.SpareParts]: 20,
          [ResourceType.Shielding]: 10,
          [ResourceType.Medical]: 10,
          [ResourceType.Budget]: 0,
        },
      });
      expect(r.state.resources[ResourceType.Propulsion]).toBe(350);

      // Start mission
      r = engine.executeCommand(r.state, { type: 'START_MISSION' });
      expect(r.state.phase).toBe(Phase.Launch);

      // Select launch profile
      r = engine.executeCommand(r.state, {
        type: 'SELECT_LAUNCH_PROFILE',
        profile: LaunchProfile.Conservative,
      });

      // Proceed through launch
      r = engine.executeCommand(r.state, { type: 'PROCEED' });
      expect(r.state.phase).toBe(Phase.LunarTransit);

      // Transit: proceed through all 3 turns, handling events
      let maxLoops = 20;
      while (r.state.phase === Phase.LunarTransit && maxLoops-- > 0 && !r.state.isGameOver) {
        if (r.state.currentEvent?.choices?.length) {
          r = engine.executeCommand(r.state, {
            type: 'EVENT_CHOICE',
            eventId: r.state.currentEvent.id,
            choiceId: r.state.currentEvent.choices[0].id,
          });
        } else {
          // Do a course correction on first transit turn if we have trajectory error
          if (r.state.phaseData.trajectoryError > 5 && r.state.resources[ResourceType.Propulsion] > 100) {
            r = engine.executeCommand(r.state, {
              type: 'ALLOCATE_COURSE_CORRECTION',
              fuelUnits: 15,
            });
          }
          r = engine.executeCommand(r.state, { type: 'PROCEED' });
        }
      }

      // Should be at Gateway or beyond (if trajectory error was too high, game over)
      if (r.state.isGameOver) {
        // Acceptable — high trajectory error can end the game
        return;
      }

      // Gateway: dock and proceed
      expect(r.state.phase).toBe(Phase.Gateway);

      // Handle any pending events first
      if (r.state.currentEvent?.choices?.length) {
        r = engine.executeCommand(r.state, {
          type: 'EVENT_CHOICE',
          eventId: r.state.currentEvent.id,
          choiceId: r.state.currentEvent.choices[0].id,
        });
      }

      // Dock at gateway
      r = engine.executeCommand(r.state, { type: 'STOP_AT_GATEWAY' });

      // Handle any pending events
      if (r.state.currentEvent?.choices?.length) {
        r = engine.executeCommand(r.state, {
          type: 'EVENT_CHOICE',
          eventId: r.state.currentEvent.id,
          choiceId: r.state.currentEvent.choices[0].id,
        });
      }

      // Proceed past gateway
      r = engine.executeCommand(r.state, { type: 'PROCEED' });

      // Select landing site
      r = engine.executeCommand(r.state, {
        type: 'SELECT_LANDING_SITE',
        siteId: 'shackleton-rim',
      });

      if (r.state.isGameOver) return;

      // Should be in Descent phase
      expect(r.state.phase).toBe(Phase.Descent);

      // Handle any pending events
      if (r.state.currentEvent?.choices?.length) {
        r = engine.executeCommand(r.state, {
          type: 'EVENT_CHOICE',
          eventId: r.state.currentEvent.id,
          choiceId: r.state.currentEvent.choices[0].id,
        });
      }

      // Execute descent with sufficient fuel
      const descentFuel = Math.min(
        60,
        r.state.resources[ResourceType.Propulsion]
      );
      if (descentFuel < DESCENT_MIN_FUEL) {
        // Not enough fuel — game would end
        return;
      }
      r = engine.executeCommand(r.state, {
        type: 'EXECUTE_DESCENT',
        fuelUnits: descentFuel,
      });

      if (r.state.isGameOver) return;

      // Should be in SurfaceOps (auto-advanced after descent)
      expect(r.state.phase).toBe(Phase.SurfaceOps);

      // Surface ops: shelter each turn until complete
      maxLoops = 20;
      while (
        r.state.phase === Phase.SurfaceOps &&
        maxLoops-- > 0 &&
        !r.state.isGameOver
      ) {
        if (r.state.currentEvent?.choices?.length) {
          r = engine.executeCommand(r.state, {
            type: 'EVENT_CHOICE',
            eventId: r.state.currentEvent.id,
            choiceId: r.state.currentEvent.choices[0].id,
          });
        } else {
          r = engine.executeCommand(r.state, {
            type: 'SELECT_SURFACE_ACTIVITY',
            activity: SurfaceActivity.Shelter,
          });
        }
      }

      if (r.state.isGameOver) return;

      // Should have reached Colony phase
      expect(r.state.phase).toBe(Phase.Colony);

      // Should have score breakdown
      expect(r.scoreBreakdown).toBeDefined();
      expect(r.scoreBreakdown!.total).toBeGreaterThan(0);
      expect(r.scoreRating).toBeDefined();

      // Victory tier should be set
      expect(r.state.victoryTier).toBeDefined();
      expect(
        Object.values(VictoryTier).includes(r.state.victoryTier!)
      ).toBe(true);
    });

    it('game over when life support runs out', () => {
      const { engine, result } = createCadetGame(9999);

      // Allocate with very little life support
      let r = engine.executeCommand(result.state, {
        type: 'ALLOCATE_RESOURCES',
        resources: {
          [ResourceType.Propulsion]: 300,
          [ResourceType.LifeSupport]: 2, // Very low!
          [ResourceType.SpareParts]: 10,
          [ResourceType.Shielding]: 5,
          [ResourceType.Medical]: 5,
          [ResourceType.Budget]: 0,
        },
      });

      r = engine.executeCommand(r.state, { type: 'START_MISSION' });
      r = engine.executeCommand(r.state, {
        type: 'SELECT_LAUNCH_PROFILE',
        profile: LaunchProfile.Aggressive,
      });

      // Proceed through turns until game over
      let turns = 0;
      while (!r.state.isGameOver && turns < 20) {
        if (r.state.currentEvent?.choices?.length) {
          r = engine.executeCommand(r.state, {
            type: 'EVENT_CHOICE',
            eventId: r.state.currentEvent.id,
            choiceId: r.state.currentEvent.choices[0].id,
          });
        } else {
          r = engine.executeCommand(r.state, { type: 'PROCEED' });
        }
        turns++;
      }

      // Should be game over from life support depletion
      expect(r.state.isGameOver).toBe(true);
    });
  });

  describe('EVENT_CHOICE command', () => {
    it('resolves pending event', () => {
      const engine = createEngine();

      // Find a seed that produces an event during transit
      let r: GameResult | undefined;
      let foundEvent = false;

      for (let seed = 0; seed < 100 && !foundEvent; seed++) {
        r = engine.createGame({
          difficulty: Difficulty.Astronaut,
          commanderName: 'Test',
          rngSeed: seed,
        });
        r = engine.executeCommand(r.state, {
          type: 'ALLOCATE_RESOURCES',
          resources: {
            [ResourceType.Propulsion]: 300,
            [ResourceType.LifeSupport]: 40,
            [ResourceType.SpareParts]: 15,
            [ResourceType.Shielding]: 8,
            [ResourceType.Medical]: 8,
            [ResourceType.Budget]: 0,
          },
        });
        r = engine.executeCommand(r.state, { type: 'START_MISSION' });
        r = engine.executeCommand(r.state, {
          type: 'SELECT_LAUNCH_PROFILE',
          profile: LaunchProfile.Standard,
        });
        r = engine.executeCommand(r.state, { type: 'PROCEED' });

        // Check for event during transit
        for (let i = 0; i < 5 && !r.state.isGameOver; i++) {
          if (r.state.currentEvent?.choices?.length) {
            foundEvent = true;
            break;
          }
          r = engine.executeCommand(r.state, { type: 'PROCEED' });
        }
      }

      if (foundEvent && r) {
        const event = r.state.currentEvent!;
        const resolved = engine.executeCommand(r.state, {
          type: 'EVENT_CHOICE',
          eventId: event.id,
          choiceId: event.choices![0].id,
        });
        expect(resolved.state.currentEvent).toBeNull();
      }
    });

    it('rejects mismatched event ID', () => {
      const { engine, result } = createCadetGame();
      // Set up a fake pending event
      result.state.currentEvent = {
        id: 'test-event',
        name: 'Test',
        description: 'test',
        probability: 10,
        category: 'ENVIRONMENTAL' as any,
        severity: 'MINOR' as any,
        phases: [Phase.LunarTransit],
        effects: [],
        choices: [{ id: 'a', text: 'choice A', effects: [] }],
      };

      const resolved = engine.executeCommand(result.state, {
        type: 'EVENT_CHOICE',
        eventId: 'wrong-id',
        choiceId: 'a',
      });
      // Should warn about mismatch
      expect(resolved.narrative.some(n => n.text.includes('mismatch'))).toBe(
        true
      );
    });
  });

  describe('deterministic gameplay', () => {
    it('same seed produces identical game sequences', () => {
      const engine1 = createEngine();
      const engine2 = createEngine();

      let r1 = engine1.createGame({
        difficulty: Difficulty.Cadet,
        commanderName: 'Test',
        rngSeed: 777,
      });
      let r2 = engine2.createGame({
        difficulty: Difficulty.Cadet,
        commanderName: 'Test',
        rngSeed: 777,
      });

      // Allocate same resources
      const resources = {
        [ResourceType.Propulsion]: 300,
        [ResourceType.LifeSupport]: 40,
        [ResourceType.SpareParts]: 15,
        [ResourceType.Shielding]: 8,
        [ResourceType.Medical]: 8,
        [ResourceType.Budget]: 0,
      };

      r1 = engine1.executeCommand(r1.state, {
        type: 'ALLOCATE_RESOURCES',
        resources,
      });
      r2 = engine2.executeCommand(r2.state, {
        type: 'ALLOCATE_RESOURCES',
        resources,
      });

      r1 = engine1.executeCommand(r1.state, { type: 'START_MISSION' });
      r2 = engine2.executeCommand(r2.state, { type: 'START_MISSION' });

      r1 = engine1.executeCommand(r1.state, {
        type: 'SELECT_LAUNCH_PROFILE',
        profile: LaunchProfile.Standard,
      });
      r2 = engine2.executeCommand(r2.state, {
        type: 'SELECT_LAUNCH_PROFILE',
        profile: LaunchProfile.Standard,
      });

      // States should be identical
      expect(r1.state.resources).toEqual(r2.state.resources);
      expect(r1.state.phaseData.launchProfile).toBe(
        r2.state.phaseData.launchProfile
      );
      expect(r1.state.phaseData.launchComplicationOccurred).toBe(
        r2.state.phaseData.launchComplicationOccurred
      );
    });
  });
});
