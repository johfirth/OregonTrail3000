// Turn Processing — implements the per-turn game loop

import {
  type GameState,
  type NarrativeEntry,
  Phase,
  ResourceType,
  HealthStatus,
  ConsumptionLevel,
  CONSUMPTION_RATES,
  ILLNESS_MODIFIERS,
  DIFFICULTY_MODIFIERS,
  MAX_MISSION_TURNS,
} from './types';
import type { Rng } from './rng';
import { rollEvent, applyEventEffects } from './events';

function healthStatusToNum(status: HealthStatus): number {
  switch (status) {
    case HealthStatus.Healthy: return 0;
    case HealthStatus.Stressed: return 1;
    case HealthStatus.Ill: return 2;
    case HealthStatus.Critical: return 3;
    case HealthStatus.Dead: return 4;
    default: return 0;
  }
}

function worsenHealth(status: HealthStatus): HealthStatus {
  switch (status) {
    case HealthStatus.Healthy: return HealthStatus.Stressed;
    case HealthStatus.Stressed: return HealthStatus.Ill;
    case HealthStatus.Ill: return HealthStatus.Critical;
    case HealthStatus.Critical: return HealthStatus.Dead;
    default: return status;
  }
}

export function processTurn(state: GameState, rng: Rng): { state: GameState; narrative: NarrativeEntry[] } {
  let s: GameState = {
    ...state,
    resources: { ...state.resources },
    crew: state.crew.map(c => ({ ...c })),
    phaseData: { ...state.phaseData },
  };
  const narrative: NarrativeEntry[] = [];

  // Increment turn counters
  s.turn++;
  s.totalTurns++;
  s.missionDay++;

  // ---- 1. Medical Check ----
  // Auto-deduct 1 MU per ill/critical crew member
  for (const member of s.crew) {
    if (!member.isAlive) continue;
    if (member.healthStatus === HealthStatus.Ill || member.healthStatus === HealthStatus.Critical) {
      if (s.resources[ResourceType.Medical] > 0) {
        s.resources[ResourceType.Medical] = Math.max(0, s.resources[ResourceType.Medical] - 1);
      } else {
        // No MU available — condition worsens
        const mods = DIFFICULTY_MODIFIERS[s.difficulty];
        member.turnsInState++;
        if (member.turnsInState >= mods.turnsBeforeHealthWorsens) {
          member.healthStatus = worsenHealth(member.healthStatus);
          member.turnsInState = 0;
          if (member.healthStatus === HealthStatus.Dead) {
            member.isAlive = false;
            member.health = 0;
            narrative.push({
              id: `narrative-untreated-death-${member.id}-${s.turn}`,
              text: `${member.name} succumbs to untreated illness. Without medical supplies, there was nothing the crew could do.`,
              type: 'DEATH',
              timestamp: s.turn,
            });
          } else {
            narrative.push({
              id: `narrative-health-worsen-${member.id}-${s.turn}`,
              text: `${member.name}'s condition has worsened to ${member.healthStatus}. Medical supplies are depleted.`,
              type: 'WARNING',
              timestamp: s.turn,
            });
          }
        } else if (mods.healthWorsenEarlyChance > 0 && rng.chance(mods.healthWorsenEarlyChance)) {
          // Commander difficulty: 50% chance to worsen early
          member.healthStatus = worsenHealth(member.healthStatus);
          member.turnsInState = 0;
          if (member.healthStatus === HealthStatus.Dead) {
            member.isAlive = false;
            member.health = 0;
            narrative.push({
              id: `narrative-early-death-${member.id}-${s.turn}`,
              text: `${member.name}'s condition deteriorated rapidly. They didn't make it.`,
              type: 'DEATH',
              timestamp: s.turn,
            });
          }
        }
      }
    } else {
      member.turnsInState++;
    }
  }

  // ---- 2. Resource Consumption ----
  // Life support based on consumption level
  const sdRate = CONSUMPTION_RATES[s.consumptionLevel];
  s.resources[ResourceType.LifeSupport] = Math.max(0, s.resources[ResourceType.LifeSupport] - sdRate);

  // Ill crew members consume extra SD
  const illCrew = s.crew.filter(c => c.isAlive && c.healthStatus === HealthStatus.Ill);
  const critCrew = s.crew.filter(c => c.isAlive && c.healthStatus === HealthStatus.Critical);
  const extraSD = illCrew.length * 0.25 + critCrew.length * 0.5;
  if (extraSD > 0) {
    s.resources[ResourceType.LifeSupport] = Math.max(0, s.resources[ResourceType.LifeSupport] - extraSD);
  }

  // Sunlight modifier during surface ops
  if (s.phase === Phase.SurfaceOps && s.selectedLandingSite) {
    const sunlightMod = (s.selectedLandingSite.sunlight - 3) * 0.1;
    // Positive sunlight = less consumption (bonus), negative = more consumption
    s.resources[ResourceType.LifeSupport] = Math.max(0, s.resources[ResourceType.LifeSupport] + sunlightMod);
  }

  // Check life support depletion
  if (s.resources[ResourceType.LifeSupport] <= 0) {
    narrative.push({
      id: `narrative-ls-critical-${s.turn}`,
      text: 'Life support supplies running critically low. The crew rations what remains.',
      type: 'WARNING',
      timestamp: s.turn,
    });
  }

  // ---- 3. Event Roll ----
  if (!s.isGameOver && s.currentEvent === null) {
    const event = rollEvent(s, rng);
    if (event) {
      if (event.choices && event.choices.length > 0) {
        // Event requires player choice — store it and wait
        s.currentEvent = event;
        narrative.push({
          id: `narrative-event-pending-${event.id}-${s.turn}`,
          text: event.description,
          type: 'EVENT',
          timestamp: s.turn,
        });
      } else {
        // Auto-resolve event
        const result = applyEventEffects(s, event, undefined, rng);
        s = result.state;
        narrative.push(...result.narrative);
      }
    }
  }

  // ---- 4. Health Check ----
  // Illness probability check for each healthy/stressed crew member
  if (!s.isGameOver) {
    const mods = DIFFICULTY_MODIFIERS[s.difficulty];
    const illnessModifier = ILLNESS_MODIFIERS[s.consumptionLevel];
    let conditionMod = 1.0;
    if (s.resources[ResourceType.Shielding] <= 0) conditionMod *= 2.0;
    else if (s.resources[ResourceType.Shielding] <= 3) conditionMod *= 1.3;
    if (s.resources[ResourceType.SpareParts] <= 0) conditionMod *= 1.5;
    const illCrewCount = s.crew.filter(c => c.isAlive && c.healthStatus === HealthStatus.Ill).length;
    conditionMod *= Math.pow(1.1, illCrewCount);

    const illnessChance = mods.baseIllnessChance * illnessModifier * conditionMod;

    for (const member of s.crew) {
      if (!member.isAlive) continue;
      if (member.healthStatus === HealthStatus.Healthy || member.healthStatus === HealthStatus.Stressed) {
        if (rng.chance(illnessChance)) {
          member.healthStatus = worsenHealth(member.healthStatus);
          member.turnsInState = 0;
          narrative.push({
            id: `narrative-illness-${member.id}-${s.turn}`,
            text: `${member.name} has fallen ${member.healthStatus === HealthStatus.Ill ? 'ill' : 'into a stressed state'}. ${
              s.resources[ResourceType.Medical] > 0 ? 'Medical treatment recommended.' : 'No medical supplies available!'
            }`,
            type: 'WARNING',
            timestamp: s.turn,
          });
        }
      }
    }
  }

  // ---- 5. Phase-specific updates ----
  if (s.phase === Phase.LunarTransit) {
    s.phaseData.transitTurnsRemaining = Math.max(0, s.phaseData.transitTurnsRemaining - 1);
  }
  if (s.phase === Phase.SurfaceOps) {
    s.phaseData.surfaceTurnsCompleted++;
  }

  // ---- 6. Game Over Checks ----
  if (!s.isGameOver) {
    // All crew dead
    if (s.crew.every(c => !c.isAlive)) {
      s.isGameOver = true;
      s.gameOverReason = 'All crew members have perished. The mission is lost.';
      narrative.push({
        id: `narrative-all-dead-${s.turn}`,
        text: 'MISSION CONTROL: "We\'ve lost contact with all crew members. Mission status: Failed."',
        type: 'DEATH',
        timestamp: s.turn,
      });
    }

    // Life support depleted for too long
    if (s.resources[ResourceType.LifeSupport] <= 0 && s.phase !== Phase.Colony) {
      s.isGameOver = true;
      s.gameOverReason = 'Life support systems have failed. The crew could not survive.';
      narrative.push({
        id: `narrative-ls-death-${s.turn}`,
        text: 'MISSION CONTROL: "We\'ve lost telemetry from Artemis Trail." Would you like us to name the crater after your crew?',
        type: 'DEATH',
        timestamp: s.turn,
      });
    }

    // Max turns exceeded
    if (s.totalTurns >= MAX_MISSION_TURNS) {
      s.isGameOver = true;
      s.gameOverReason = 'Mission window has expired. The colony could not be established in time.';
      narrative.push({
        id: `narrative-timeout-${s.turn}`,
        text: 'Mission window has expired. Earth cannot maintain support for a colony established this late. Mission aborted.',
        type: 'DEATH',
        timestamp: s.turn,
      });
    }
  }

  // Update narrative log
  s.narrativeLog = [...s.narrativeLog, ...narrative];

  return { state: s, narrative };
}
