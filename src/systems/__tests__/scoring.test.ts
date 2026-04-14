import { describe, it, expect } from 'vitest';
import { ScoringSystem } from '../scoring';
import { createInitialState } from '../../engine/state';
import {
  Difficulty,
  Phase,
  ResourceType,
  HealthStatus,
  VictoryTier,
  ScoreRating,
  SCORE_PER_CREW,
  SCORE_PER_HEALTHY_CREW,
  SCORE_PER_SD,
  SCORE_NO_DEATHS_BONUS,
  LANDING_SITES,
} from '../../engine/types';
import type { GameState } from '../../engine/types';

function makeVictoryState(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialState({
    difficulty: Difficulty.Astronaut,
    commanderName: 'Test',
    rngSeed: 42,
  });
  return {
    ...base,
    phase: Phase.Colony,
    totalTurns: 10,
    selectedLandingSite: LANDING_SITES[0],
    resources: {
      ...base.resources,
      [ResourceType.Propulsion]: 50,
      [ResourceType.LifeSupport]: 20,
      [ResourceType.SpareParts]: 10,
      [ResourceType.Shielding]: 5,
      [ResourceType.Medical]: 5,
      [ResourceType.Budget]: 0,
    },
    phaseData: {
      ...base.phaseData,
      scienceEvasCompleted: 2,
      landingScore: 80,
    },
    ...overrides,
  };
}

describe('ScoringSystem', () => {
  let system: ScoringSystem;

  beforeEach(() => {
    system = new ScoringSystem();
  });

  describe('calculateFinalScore', () => {
    it('includes surviving crew points', () => {
      const state = makeVictoryState();
      const breakdown = system.calculateFinalScore(state);

      expect(breakdown.survivingCrew).toBe(4 * SCORE_PER_CREW);
    });

    it('includes healthy crew bonus', () => {
      const state = makeVictoryState();
      const breakdown = system.calculateFinalScore(state);

      expect(breakdown.crewHealthBonus).toBe(4 * SCORE_PER_HEALTHY_CREW);
    });

    it('includes no-deaths bonus when all 4 alive', () => {
      const state = makeVictoryState();
      const breakdown = system.calculateFinalScore(state);

      expect(breakdown.noDeathsBonus).toBe(SCORE_NO_DEATHS_BONUS);
    });

    it('no-deaths bonus is 0 when a crew member is dead', () => {
      const state = makeVictoryState();
      state.crew[1].isAlive = false;
      const breakdown = system.calculateFinalScore(state);

      expect(breakdown.noDeathsBonus).toBe(0);
    });

    it('includes resource scores', () => {
      const state = makeVictoryState();
      const breakdown = system.calculateFinalScore(state);

      expect(breakdown.remainingLifeSupport).toBe(20 * SCORE_PER_SD);
      expect(breakdown.remainingFuel).toBe(50 * 5); // SCORE_PER_FU = 5
    });

    it('speed bonus rewards fewer turns', () => {
      const fast = makeVictoryState({ totalTurns: 8 });
      const slow = makeVictoryState({ totalTurns: 15 });

      const fastScore = system.calculateFinalScore(fast);
      const slowScore = system.calculateFinalScore(slow);

      expect(fastScore.speedBonus).toBeGreaterThan(slowScore.speedBonus);
    });

    it('total is sum of all components plus state.score', () => {
      const state = makeVictoryState({ score: 100 });
      const breakdown = system.calculateFinalScore(state);

      const expectedTotal =
        breakdown.survivingCrew +
        breakdown.crewHealthBonus +
        breakdown.remainingLifeSupport +
        breakdown.remainingSpareParts +
        breakdown.remainingShielding +
        breakdown.remainingMedical +
        breakdown.remainingFuel +
        breakdown.scienceEvas +
        breakdown.landingQuality +
        breakdown.siteDifficulty +
        breakdown.speedBonus +
        breakdown.noDeathsBonus +
        100; // state.score

      expect(breakdown.total).toBe(expectedTotal);
    });
  });

  describe('getVictoryTier', () => {
    it('ThrivingColony with 4 alive crew and high score', () => {
      const state = makeVictoryState({ score: 500 });
      const tier = system.getVictoryTier(state);
      expect(tier).toBe(VictoryTier.ThrivingColony);
    });

    it('SustainableOutpost with 3 alive crew', () => {
      const state = makeVictoryState({ score: 0 });
      state.crew[3].isAlive = false;
      state.crew[3].health = 0;
      const tier = system.getVictoryTier(state);
      expect(tier).toBe(VictoryTier.SustainableOutpost);
    });

    it('BareSurvival with 2 alive crew', () => {
      const state = makeVictoryState({ score: 0 });
      state.crew[2].isAlive = false;
      state.crew[3].isAlive = false;
      const tier = system.getVictoryTier(state);
      expect(tier).toBe(VictoryTier.BareSurvival);
    });

    it('null with fewer than 2 alive crew', () => {
      const state = makeVictoryState({ score: 0 });
      state.crew[1].isAlive = false;
      state.crew[2].isAlive = false;
      state.crew[3].isAlive = false;
      const tier = system.getVictoryTier(state);
      expect(tier).toBeNull();
    });
  });

  describe('getScoreRating', () => {
    it('S rating for 3000+', () => {
      expect(system.getScoreRating(3000)).toBe(ScoreRating.S);
      expect(system.getScoreRating(5000)).toBe(ScoreRating.S);
    });

    it('A rating for 2200-2999', () => {
      expect(system.getScoreRating(2200)).toBe(ScoreRating.A);
      expect(system.getScoreRating(2999)).toBe(ScoreRating.A);
    });

    it('B rating for 1500-2199', () => {
      expect(system.getScoreRating(1500)).toBe(ScoreRating.B);
      expect(system.getScoreRating(2199)).toBe(ScoreRating.B);
    });

    it('C rating for 1000-1499', () => {
      expect(system.getScoreRating(1000)).toBe(ScoreRating.C);
      expect(system.getScoreRating(1499)).toBe(ScoreRating.C);
    });

    it('D rating for 500-999', () => {
      expect(system.getScoreRating(500)).toBe(ScoreRating.D);
      expect(system.getScoreRating(999)).toBe(ScoreRating.D);
    });

    it('F rating for below 500', () => {
      expect(system.getScoreRating(0)).toBe(ScoreRating.F);
      expect(system.getScoreRating(499)).toBe(ScoreRating.F);
    });
  });
});
