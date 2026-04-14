import type { GameSystem, GameState, ScoreBreakdown } from '../engine/types';
import {
  HealthStatus,
  ResourceType,
  VictoryTier,
  ScoreRating,
  SCORE_PER_CREW,
  SCORE_PER_HEALTHY_CREW,
  SCORE_PER_SD,
  SCORE_PER_PU,
  SCORE_PER_SR,
  SCORE_PER_MU,
  SCORE_PER_FU,
  SCORE_PER_SCIENCE_EVA,
  SCORE_LANDING_MAX,
  SCORE_SITE_DIFFICULTY_MAX,
  SCORE_SPEED_PER_TURN,
  SCORE_SPEED_TARGET_TURNS,
  SCORE_NO_DEATHS_BONUS,
} from '../engine/types';

/**
 * Victory Scoring System
 *
 * Calculates score based on: surviving crew (×250), remaining resources,
 * landing site difficulty bonus, science objectives, speed bonus.
 * Determines victory tier (Thriving Colony / Sustainable / Bare Survival).
 */
export class ScoringSystem implements GameSystem {
  readonly name = 'scoring';

  initialize(state: GameState): GameState {
    return { ...state, score: 0 };
  }

  processTurn(state: GameState): GameState {
    return state;
  }

  /** Calculate the full final score breakdown. */
  calculateFinalScore(state: GameState): ScoreBreakdown {
    const aliveCrew = state.crew.filter(c => c.isAlive);
    const healthyCrew = aliveCrew.filter(
      c => c.healthStatus === HealthStatus.Healthy
    );

    const site = state.selectedLandingSite;
    const siteAvg = site
      ? (site.sunlight + site.iceAccess + site.terrainDifficulty + site.communications) / 4
      : 3;

    const breakdown: ScoreBreakdown = {
      survivingCrew: aliveCrew.length * SCORE_PER_CREW,
      crewHealthBonus: healthyCrew.length * SCORE_PER_HEALTHY_CREW,
      remainingLifeSupport:
        Math.floor(state.resources[ResourceType.LifeSupport]) * SCORE_PER_SD,
      remainingSpareParts:
        state.resources[ResourceType.SpareParts] * SCORE_PER_PU,
      remainingShielding:
        state.resources[ResourceType.Shielding] * SCORE_PER_SR,
      remainingMedical:
        state.resources[ResourceType.Medical] * SCORE_PER_MU,
      remainingFuel:
        state.resources[ResourceType.Propulsion] * SCORE_PER_FU,
      scienceEvas:
        state.phaseData.scienceEvasCompleted * SCORE_PER_SCIENCE_EVA,
      landingQuality: Math.min(
        SCORE_LANDING_MAX,
        Math.max(0, Math.floor(state.phaseData.landingScore / 2))
      ),
      siteDifficulty: Math.min(
        SCORE_SITE_DIFFICULTY_MAX,
        Math.floor((6 - siteAvg) * 25)
      ),
      speedBonus:
        Math.max(0, SCORE_SPEED_TARGET_TURNS - state.totalTurns) *
        SCORE_SPEED_PER_TURN,
      noDeathsBonus: aliveCrew.length === 4 ? SCORE_NO_DEATHS_BONUS : 0,
      total: 0,
    };

    breakdown.total =
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
      state.score;

    return breakdown;
  }

  /** Determine victory tier, or null if failure. */
  getVictoryTier(state: GameState): VictoryTier | null {
    const aliveCount = state.crew.filter(c => c.isAlive).length;
    const score = this.calculateFinalScore(state).total;

    if (aliveCount >= 4 && score >= 2200) {
      return VictoryTier.ThrivingColony;
    }
    if (aliveCount >= 3 && score >= 1000) {
      return VictoryTier.SustainableOutpost;
    }
    if (aliveCount >= 2) {
      return VictoryTier.BareSurvival;
    }
    return null;
  }

  /** Map a numeric score to a letter rating. */
  getScoreRating(score: number): ScoreRating {
    if (score >= 3000) return ScoreRating.S;
    if (score >= 2200) return ScoreRating.A;
    if (score >= 1500) return ScoreRating.B;
    if (score >= 1000) return ScoreRating.C;
    if (score >= 500) return ScoreRating.D;
    return ScoreRating.F;
  }
}
