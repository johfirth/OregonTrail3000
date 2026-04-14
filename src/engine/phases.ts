// Phase Transition Controller

import {
  type GameState,
  type NarrativeEntry,
  Phase,
  DIFFICULTY_MODIFIERS,
  SURFACE_BONUS_FUEL_DIVISOR,
  ResourceType,
} from './types';

const PHASE_ORDER: Phase[] = [
  Phase.MissionPrep,
  Phase.Launch,
  Phase.LunarTransit,
  Phase.Gateway,
  Phase.Descent,
  Phase.SurfaceOps,
  Phase.Colony,
];

function nextPhase(current: Phase): Phase | null {
  const idx = PHASE_ORDER.indexOf(current);
  if (idx < 0 || idx >= PHASE_ORDER.length - 1) return null;
  return PHASE_ORDER[idx + 1];
}

export function canAdvancePhase(state: GameState): boolean {
  if (state.isGameOver) return false;

  switch (state.phase) {
    case Phase.MissionPrep:
      // Resources must be allocated (at least propulsion) and START_MISSION issued
      return state.resources[ResourceType.Propulsion] > 0;

    case Phase.Launch:
      // Launch completes after 1 turn with a profile selected
      return state.phaseData.launchProfile !== null;

    case Phase.LunarTransit:
      return state.phaseData.transitTurnsRemaining <= 0;

    case Phase.Gateway:
      // Must have visited gateway (at least passed through)
      return state.phaseData.gatewayVisited;

    case Phase.Descent:
      return state.phaseData.landingAttempted;

    case Phase.SurfaceOps:
      return state.phaseData.surfaceTurnsCompleted >= state.phaseData.surfaceTurnsTotal;

    case Phase.Colony:
      return false; // Final phase

    default:
      return false;
  }
}

export function advancePhase(state: GameState): GameState {
  const next = nextPhase(state.phase);
  if (!next) return state;

  const newState = { ...state, phase: next };
  const narrative: NarrativeEntry[] = [];

  switch (next) {
    case Phase.Launch:
      narrative.push({
        id: `narrative-phase-launch-${state.turn}`,
        text: 'Mission Control confirms all systems nominal. The crew straps in as the launch countdown begins.',
        type: 'STORY',
        timestamp: state.turn,
      });
      break;

    case Phase.LunarTransit:
      narrative.push({
        id: `narrative-phase-transit-${state.turn}`,
        text: 'Earth shrinks behind you as the spacecraft settles into its trans-lunar trajectory. Three days of void lie ahead.',
        type: 'STORY',
        timestamp: state.turn,
      });
      break;

    case Phase.Gateway: {
      narrative.push({
        id: `narrative-phase-gateway-${state.turn}`,
        text: 'Lunar Gateway Station comes into view — humanity\'s waypoint orbiting the Moon. Time to dock and assess your options.',
        type: 'STORY',
        timestamp: state.turn,
      });

      // Apply trajectory error effects
      const err = newState.phaseData.trajectoryError;
      if (err >= 13) {
        newState.isGameOver = true;
        newState.gameOverReason = 'Trajectory error too large — spacecraft missed lunar orbit entirely.';
        narrative.push({
          id: `narrative-miss-orbit-${state.turn}`,
          text: 'CAPCOM: "We\'ve lost your trajectory lock. You\'re heading into deep space. We... we\'re sorry."',
          type: 'DEATH',
          timestamp: state.turn,
        });
      } else if (err >= 8) {
        // Emergency insertion: +20 FU, -2 SR
        newState.resources = { ...newState.resources };
        newState.resources[ResourceType.Propulsion] = Math.max(0, newState.resources[ResourceType.Propulsion] - 20);
        newState.resources[ResourceType.Shielding] = Math.max(0, newState.resources[ResourceType.Shielding] - 2);
        narrative.push({
          id: `narrative-emergency-insertion-${state.turn}`,
          text: 'Emergency orbital insertion! Excessive trajectory error forces a high-energy correction burn. -20 FU, -2 SR from stress damage.',
          type: 'WARNING',
          timestamp: state.turn,
        });
      } else if (err >= 4) {
        // Rough insertion: +10 FU
        newState.resources = { ...newState.resources };
        newState.resources[ResourceType.Propulsion] = Math.max(0, newState.resources[ResourceType.Propulsion] - 10);
        narrative.push({
          id: `narrative-rough-insertion-${state.turn}`,
          text: 'Rough orbital insertion — trajectory drift requires an extra correction burn. -10 FU.',
          type: 'WARNING',
          timestamp: state.turn,
        });
      }
      break;
    }

    case Phase.Descent:
      narrative.push({
        id: `narrative-phase-descent-${state.turn}`,
        text: `Landing site selected: ${newState.selectedLandingSite?.name ?? 'Unknown'}. Beginning powered descent to the lunar surface.`,
        type: 'STORY',
        timestamp: state.turn,
      });
      break;

    case Phase.SurfaceOps: {
      const mods = DIFFICULTY_MODIFIERS[state.difficulty];
      const bonusTurns = Math.floor(newState.resources[ResourceType.Propulsion] / SURFACE_BONUS_FUEL_DIVISOR);
      const totalTurns = Math.min(mods.surfaceBaseTurns + bonusTurns, mods.surfaceMaxTurns);
      newState.phaseData = {
        ...newState.phaseData,
        surfaceTurnsTotal: totalTurns,
        surfaceTurnsCompleted: 0,
      };

      narrative.push({
        id: `narrative-phase-surface-${state.turn}`,
        text: `Touchdown confirmed! The crew has ${totalTurns} days to establish a colony foothold on the lunar surface.`,
        type: 'STORY',
        timestamp: state.turn,
      });
      break;
    }

    case Phase.Colony:
      narrative.push({
        id: `narrative-phase-colony-${state.turn}`,
        text: 'Surface operations complete. The foundations of Artemis Trail stand against the stark lunar horizon. Time for the final assessment.',
        type: 'VICTORY',
        timestamp: state.turn,
      });
      break;
  }

  newState.narrativeLog = [...newState.narrativeLog, ...narrative];
  return newState;
}
