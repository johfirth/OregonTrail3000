import type { GameSystem, GameState, NarrativeEntry, CrewMember } from '../engine/types';
import {
  HealthStatus,
  CrewRole,
  ResourceType,
  ILLNESS_MODIFIERS,
  DIFFICULTY_MODIFIERS,
  TURNS_BEFORE_HEALTH_WORSENS,
  BASE_ILLNESS_CHANCE,
} from '../engine/types';

function healthToStatus(health: number): HealthStatus {
  if (health <= 0) return HealthStatus.Dead;
  if (health <= 24) return HealthStatus.Critical;
  if (health <= 74) return HealthStatus.Ill;
  if (health <= 99) return HealthStatus.Stressed;
  return HealthStatus.Healthy;
}

function worsenStatus(status: HealthStatus): HealthStatus {
  switch (status) {
    case HealthStatus.Healthy: return HealthStatus.Stressed;
    case HealthStatus.Stressed: return HealthStatus.Ill;
    case HealthStatus.Ill: return HealthStatus.Critical;
    case HealthStatus.Critical: return HealthStatus.Dead;
    default: return status;
  }
}

/**
 * Crew Health & Morale System
 *
 * Manages individual crew member health (5-tier: Healthy→Dead),
 * crew morale (0-100), illness progression, and medical treatment.
 */
export class HealthSystem implements GameSystem {
  readonly name = 'health';

  initialize(state: GameState): GameState {
    const s = {
      ...state,
      crew: state.crew.map(c => ({
        ...c,
        health: 100,
        healthStatus: HealthStatus.Healthy,
        isAlive: true,
        turnsInState: 0,
      })),
      morale: 75,
    };
    return s;
  }

  processTurn(state: GameState): GameState {
    const s = {
      ...state,
      resources: { ...state.resources },
      crew: state.crew.map(c => ({ ...c })),
      narrativeLog: [...state.narrativeLog],
    };
    const narrative: NarrativeEntry[] = [];
    const mods = DIFFICULTY_MODIFIERS[s.difficulty];

    const hasMedicalOfficer = s.crew.some(
      c => c.role === CrewRole.Engineer && c.isAlive
    );

    // 1. Auto-deduct MU per ill/critical crew member
    for (const member of s.crew) {
      if (!member.isAlive) continue;

      if (
        member.healthStatus === HealthStatus.Ill ||
        member.healthStatus === HealthStatus.Critical
      ) {
        let muCost = 1;
        if (hasMedicalOfficer) {
          muCost = Math.max(1, Math.ceil(muCost * 0.5));
        }

        if (s.resources[ResourceType.Medical] >= muCost) {
          s.resources[ResourceType.Medical] -= muCost;
        } else {
          // No MU: health worsens
          member.turnsInState++;
          if (member.turnsInState >= mods.turnsBeforeHealthWorsens) {
            member.healthStatus = worsenStatus(member.healthStatus);
            member.turnsInState = 0;

            if (member.healthStatus === HealthStatus.Dead) {
              member.isAlive = false;
              member.health = 0;
              s.morale = Math.max(0, s.morale - 20);
              narrative.push({
                id: `narr-health-death-${member.id}-${s.turn}`,
                text: `${member.name} has died from untreated injuries. The crew mourns.`,
                type: 'DEATH',
                timestamp: s.turn,
              });
            } else {
              narrative.push({
                id: `narr-health-worsen-${member.id}-${s.turn}`,
                text: `${member.name}'s condition worsened to ${member.healthStatus} — no medical supplies available.`,
                type: 'WARNING',
                timestamp: s.turn,
              });
            }
          }
        }
      }
    }

    // 2. Illness check
    const illnessModifier = ILLNESS_MODIFIERS[s.consumptionLevel];
    const diffMod = mods.baseIllnessChance / BASE_ILLNESS_CHANCE;
    const baseChance = BASE_ILLNESS_CHANCE * illnessModifier * diffMod;

    for (const member of s.crew) {
      if (!member.isAlive) continue;
      if (
        member.healthStatus !== HealthStatus.Healthy &&
        member.healthStatus !== HealthStatus.Stressed
      )
        continue;

      // Simple deterministic pseudo-check using turn + member id hash
      const roll = this.pseudoRandom(s.turn, member.id);
      if (roll < baseChance) {
        const damage = 15 + Math.floor(roll * 1000) % 16; // 15-30
        member.health = Math.max(0, member.health - damage);
        member.healthStatus = healthToStatus(member.health);
        member.turnsInState = 0;

        if (member.healthStatus === HealthStatus.Dead) {
          member.isAlive = false;
          s.morale = Math.max(0, s.morale - 20);
          narrative.push({
            id: `narr-illness-death-${member.id}-${s.turn}`,
            text: `${member.name} has succumbed to sudden illness.`,
            type: 'DEATH',
            timestamp: s.turn,
          });
        } else {
          narrative.push({
            id: `narr-illness-${member.id}-${s.turn}`,
            text: `${member.name} has fallen ill. Health: ${member.health}. Status: ${member.healthStatus}.`,
            type: 'WARNING',
            timestamp: s.turn,
          });
        }
      }
    }

    // 3. Update health status based on current health value
    for (const member of s.crew) {
      if (!member.isAlive) continue;
      const newStatus = healthToStatus(member.health);
      if (newStatus !== member.healthStatus) {
        member.turnsInState = 0;
        member.healthStatus = newStatus;
        if (newStatus === HealthStatus.Dead) {
          member.isAlive = false;
          member.health = 0;
          s.morale = Math.max(0, s.morale - 20);
        }
      } else {
        member.turnsInState++;
      }
    }

    // 4. turnsInState — worsen if exceeded threshold
    for (const member of s.crew) {
      if (!member.isAlive) continue;
      if (
        (member.healthStatus === HealthStatus.Ill ||
          member.healthStatus === HealthStatus.Critical) &&
        member.turnsInState >= TURNS_BEFORE_HEALTH_WORSENS
      ) {
        member.healthStatus = worsenStatus(member.healthStatus);
        member.turnsInState = 0;
        if (member.healthStatus === HealthStatus.Dead) {
          member.isAlive = false;
          member.health = 0;
          s.morale = Math.max(0, s.morale - 20);
          narrative.push({
            id: `narr-health-decay-death-${member.id}-${s.turn}`,
            text: `${member.name} could not recover and has passed away.`,
            type: 'DEATH',
            timestamp: s.turn,
          });
        }
      }
    }

    // 5. Commander death = game over
    const commander = s.crew.find(c => c.role === CrewRole.Commander);
    if (commander && !commander.isAlive && !s.isGameOver) {
      s.isGameOver = true;
      s.gameOverReason =
        'The Commander has died. Without leadership, the mission cannot continue.';
      narrative.push({
        id: `narr-commander-dead-${s.turn}`,
        text: 'The Commander is dead. The mission is over.',
        type: 'DEATH',
        timestamp: s.turn,
      });
    }

    // Clamp morale
    s.morale = Math.max(0, Math.min(100, s.morale));

    s.narrativeLog.push(...narrative);
    return s;
  }

  /** Apply morale change for milestone events. */
  applyMoraleChange(
    state: GameState,
    reason: 'phase_milestone' | 'crew_death' | 'successful_eva',
  ): GameState {
    const s = { ...state };
    switch (reason) {
      case 'crew_death':
        s.morale = Math.max(0, s.morale - 20);
        break;
      case 'phase_milestone':
        s.morale = Math.min(100, s.morale + 10);
        break;
      case 'successful_eva':
        s.morale = Math.min(100, s.morale + 5);
        break;
    }
    return s;
  }

  private pseudoRandom(turn: number, id: string): number {
    let hash = turn * 2654435761;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
    }
    return Math.abs(hash % 10000) / 10000;
  }
}
