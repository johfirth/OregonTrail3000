import type { GameSystem, GameState, LandingSite } from '../engine/types';
import {
  CrewRole,
  ResourceType,
  LANDING_SITES,
  LANDING_CRASH_THRESHOLD,
  DIFFICULTY_MODIFIERS,
  SURFACE_MAX_TURNS,
  SURFACE_BONUS_FUEL_DIVISOR,
} from '../engine/types';

/**
 * Landing Site Selection & Descent System
 *
 * Manages landing site selection from 5 Artemis candidates and
 * the powered descent sequence. Each site has ratings for sunlight,
 * ice access, terrain difficulty, and Earth communications.
 */
export class LandingSystem implements GameSystem {
  readonly name = 'landing';

  initialize(state: GameState): GameState {
    return state;
  }

  processTurn(state: GameState): GameState {
    return state;
  }

  /** Return all available landing sites. */
  getAvailableSites(): LandingSite[] {
    return LANDING_SITES;
  }

  /**
   * Calculate landing score (0–100).
   * Based on fuel allocated, terrain difficulty, pilot alive bonus,
   * trajectory error penalty, and difficulty modifier.
   */
  calculateLandingScore(state: GameState, fuelUsed: number): number {
    const site = state.selectedLandingSite;
    const mods = DIFFICULTY_MODIFIERS[state.difficulty];

    // Base score from fuel: more fuel = better controlled descent
    const fuelScore = (fuelUsed / 80) * 60;

    // Terrain penalty: higher difficulty = harder landing
    const terrainPenalty = site ? (site.terrainDifficulty - 3) * 8 : 0;

    // Pilot alive bonus
    const pilotAlive = state.crew.some(
      c => c.role === CrewRole.Pilot && c.isAlive
    );
    const pilotBonus = pilotAlive ? 15 : 0;

    // Trajectory error penalty
    const trajectoryPenalty = state.phaseData.trajectoryError * 2;

    // Difficulty bonus/penalty
    const diffBonus = mods.landingScoreBonus;

    const score = Math.floor(
      fuelScore - terrainPenalty + pilotBonus - trajectoryPenalty + diffBonus
    );

    return Math.max(LANDING_CRASH_THRESHOLD - 10, Math.min(100, score));
  }

  /**
   * Calculate the number of surface turns available.
   * Base turns from difficulty + bonus turns from remaining fuel.
   * Clamped to SURFACE_MAX_TURNS.
   */
  calculateSurfaceTurns(state: GameState): number {
    const mods = DIFFICULTY_MODIFIERS[state.difficulty];
    const baseTurns = mods.surfaceBaseTurns;
    const bonusTurns = Math.floor(
      state.resources[ResourceType.Propulsion] / SURFACE_BONUS_FUEL_DIVISOR
    );
    return Math.min(SURFACE_MAX_TURNS, baseTurns + bonusTurns);
  }
}
