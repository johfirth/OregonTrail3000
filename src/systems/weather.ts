import type { GameSystem, GameState, NarrativeEntry } from '../engine/types';
import { ResourceType } from '../engine/types';

export type SolarWeatherState = 'quiet' | 'active' | 'storm';

/**
 * Solar Weather System
 *
 * Simulates solar weather: quiet, active, and storm states.
 * Solar flares and CMEs affect shielding, crew health, and
 * equipment. Weather state uses a Markov chain model.
 */
export class WeatherSystem implements GameSystem {
  readonly name = 'weather';

  private weatherState: SolarWeatherState = 'quiet';

  /** Get the current solar weather state. */
  getWeatherState(): SolarWeatherState {
    return this.weatherState;
  }

  initialize(state: GameState): GameState {
    this.weatherState = 'quiet';
    return state;
  }

  processTurn(state: GameState): GameState {
    const s = {
      ...state,
      resources: { ...state.resources },
      narrativeLog: [...state.narrativeLog],
    };
    const narrative: NarrativeEntry[] = [];

    // Markov chain transition
    const prevWeather = this.weatherState;
    const roll = this.pseudoRandom(s.turn);

    switch (this.weatherState) {
      case 'quiet':
        if (roll < 0.2) this.weatherState = 'active';
        break;
      case 'active':
        if (roll < 0.3) this.weatherState = 'storm';
        else if (roll < 0.5) this.weatherState = 'quiet';
        break;
      case 'storm':
        if (roll < 0.5) this.weatherState = 'quiet';
        else if (roll < 0.7) this.weatherState = 'active';
        break;
    }

    // Narrative for weather changes
    if (this.weatherState !== prevWeather) {
      const descriptions: Record<SolarWeatherState, string> = {
        quiet: 'Solar activity has subsided. Conditions are calm.',
        active: 'Solar activity is increasing. Elevated radiation levels detected.',
        storm: 'SOLAR STORM WARNING! Intense radiation and particle bombardment detected.',
      };
      narrative.push({
        id: `narr-weather-change-${s.turn}`,
        text: descriptions[this.weatherState],
        type: this.weatherState === 'storm' ? 'WARNING' : 'STATUS',
        timestamp: s.turn,
      });
    }

    // Apply weather effects
    switch (this.weatherState) {
      case 'active':
        s.resources[ResourceType.Shielding] = Math.max(
          0,
          s.resources[ResourceType.Shielding] - 1
        );
        break;
      case 'storm':
        s.resources[ResourceType.Shielding] = Math.max(
          0,
          s.resources[ResourceType.Shielding] - 2
        );
        break;
    }

    s.narrativeLog.push(...narrative);
    return s;
  }

  /** Get the illness chance boost from current weather (additive). */
  getIllnessChanceBoost(): number {
    return this.weatherState === 'storm' ? 0.1 : 0;
  }

  private pseudoRandom(turn: number): number {
    // Simple hash for deterministic weather per turn
    let x = ((turn + 7) * 2654435761) >>> 0;
    x = ((x ^ (x >> 16)) * 0x45d9f3b) >>> 0;
    x = (x ^ (x >> 16)) >>> 0;
    return (x % 10000) / 10000;
  }
}
