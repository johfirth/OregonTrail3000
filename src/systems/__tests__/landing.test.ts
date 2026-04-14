import { describe, it, expect } from 'vitest';
import { LandingSystem } from '../landing';
import { createInitialState } from '../../engine/state';
import {
  Difficulty,
  Phase,
  ResourceType,
  CrewRole,
  LANDING_SITES,
  LANDING_CRASH_THRESHOLD,
  SURFACE_MAX_TURNS,
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
    phase: Phase.Descent,
    selectedLandingSite: LANDING_SITES[0],
    resources: {
      ...base.resources,
      [ResourceType.Propulsion]: 100,
      [ResourceType.LifeSupport]: 30,
      [ResourceType.SpareParts]: 15,
      [ResourceType.Shielding]: 10,
      [ResourceType.Medical]: 8,
      [ResourceType.Budget]: 50,
    },
    ...overrides,
  };
}

describe('LandingSystem', () => {
  let system: LandingSystem;

  beforeEach(() => {
    system = new LandingSystem();
  });

  describe('getAvailableSites', () => {
    it('returns 5 landing sites', () => {
      const sites = system.getAvailableSites();
      expect(sites).toHaveLength(5);
    });

    it('each site has required properties', () => {
      const sites = system.getAvailableSites();
      for (const site of sites) {
        expect(site.id).toBeTruthy();
        expect(site.name).toBeTruthy();
        expect(site.sunlight).toBeGreaterThanOrEqual(1);
        expect(site.sunlight).toBeLessThanOrEqual(5);
        expect(site.iceAccess).toBeGreaterThanOrEqual(1);
        expect(site.iceAccess).toBeLessThanOrEqual(5);
        expect(site.terrainDifficulty).toBeGreaterThanOrEqual(1);
        expect(site.terrainDifficulty).toBeLessThanOrEqual(5);
        expect(site.communications).toBeGreaterThanOrEqual(1);
        expect(site.communications).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('calculateLandingScore', () => {
    it('more fuel = higher score', () => {
      const state = makeState();
      const lowFuel = system.calculateLandingScore(state, 45);
      const highFuel = system.calculateLandingScore(state, 80);
      expect(highFuel).toBeGreaterThan(lowFuel);
    });

    it('pilot alive gives bonus', () => {
      const state = makeState();
      const withPilot = system.calculateLandingScore(state, 60);

      const noPilotState = makeState();
      const pilot = noPilotState.crew.find(c => c.role === CrewRole.Pilot)!;
      pilot.isAlive = false;
      const noPilot = system.calculateLandingScore(noPilotState, 60);

      expect(withPilot).toBeGreaterThan(noPilot);
    });

    it('trajectory error penalizes score', () => {
      const lowError = makeState({
        phaseData: { ...makeState().phaseData, trajectoryError: 0 },
      });
      const highError = makeState({
        phaseData: { ...makeState().phaseData, trajectoryError: 10 },
      });

      const lowScore = system.calculateLandingScore(lowError, 60);
      const highScore = system.calculateLandingScore(highError, 60);

      expect(lowScore).toBeGreaterThan(highScore);
    });

    it('score is clamped to valid range', () => {
      const state = makeState({
        phaseData: { ...makeState().phaseData, trajectoryError: 0 },
      });
      const score = system.calculateLandingScore(state, 80);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBeGreaterThanOrEqual(LANDING_CRASH_THRESHOLD - 10);
    });
  });

  describe('calculateSurfaceTurns', () => {
    it('base turns from difficulty setting', () => {
      const state = makeState({
        resources: { ...makeState().resources, [ResourceType.Propulsion]: 0 },
      });
      const turns = system.calculateSurfaceTurns(state);
      expect(turns).toBe(DIFFICULTY_MODIFIERS[Difficulty.Astronaut].surfaceBaseTurns);
    });

    it('extra fuel adds bonus turns', () => {
      const state = makeState({
        resources: { ...makeState().resources, [ResourceType.Propulsion]: 90 },
      });
      const turns = system.calculateSurfaceTurns(state);
      expect(turns).toBeGreaterThan(DIFFICULTY_MODIFIERS[Difficulty.Astronaut].surfaceBaseTurns);
    });

    it('total turns clamped to SURFACE_MAX_TURNS', () => {
      const state = makeState({
        resources: { ...makeState().resources, [ResourceType.Propulsion]: 999 },
      });
      const turns = system.calculateSurfaceTurns(state);
      expect(turns).toBeLessThanOrEqual(SURFACE_MAX_TURNS);
    });
  });
});
