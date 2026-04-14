// Event System — weighted probability event selection and effect application

import {
  type GameState,
  type GameEvent,
  type EventEffect,
  type NarrativeEntry,
  Phase,
  EventCategory,
  EventSeverity,
  ResourceType,
  HealthStatus,
  DIFFICULTY_MODIFIERS,
} from './types';
import type { Rng } from './rng';

// --- Event Definitions ---

const EVENTS: GameEvent[] = [
  // === LAUNCH (Phase 2) ===
  {
    id: 'launch-engine-vibration',
    name: 'Engine Vibration',
    description: 'Anomalous vibration detected in main engine cluster. Engineering team scrambles to stabilize.',
    probability: 8,
    category: EventCategory.Mechanical,
    severity: EventSeverity.Minor,
    phases: [Phase.Launch],
    effects: [{ type: 'RESOURCE', target: ResourceType.SpareParts, value: -2, description: 'Parts used for emergency repair' }],
  },
  {
    id: 'launch-hold-weather',
    name: 'Weather Hold',
    description: 'Upper atmosphere wind shear forces a launch hold. When the window reopens, extra fuel is burned.',
    probability: 6,
    category: EventCategory.Environmental,
    severity: EventSeverity.Minor,
    phases: [Phase.Launch],
    effects: [{ type: 'RESOURCE', target: ResourceType.Propulsion, value: -5, description: 'Extra fuel burned for delayed window' }],
  },
  {
    id: 'launch-partial-thrust',
    name: 'Partial Thrust',
    description: 'One booster underperforms. Compensating with remaining engines costs additional fuel.',
    probability: 5,
    category: EventCategory.Mechanical,
    severity: EventSeverity.Moderate,
    phases: [Phase.Launch],
    effects: [{ type: 'RESOURCE', target: ResourceType.Propulsion, value: -10, description: 'Extra fuel to compensate' }],
  },
  {
    id: 'launch-debris-strike',
    name: 'Minor Debris Strike',
    description: 'A piece of orbital debris grazes the hull. Shielding absorbs the impact.',
    probability: 4,
    category: EventCategory.Environmental,
    severity: EventSeverity.Minor,
    phases: [Phase.Launch],
    effects: [{ type: 'RESOURCE', target: ResourceType.Shielding, value: -1, description: 'Shielding absorbed debris impact' }],
  },
  {
    id: 'launch-system-malfunction',
    name: 'System Malfunction',
    description: 'Multiple system warnings trigger simultaneously. Emergency repairs consume parts and shielding.',
    probability: 3,
    category: EventCategory.Mechanical,
    severity: EventSeverity.Severe,
    phases: [Phase.Launch],
    effects: [
      { type: 'RESOURCE', target: ResourceType.SpareParts, value: -3, description: 'Emergency repairs' },
      { type: 'RESOURCE', target: ResourceType.Shielding, value: -1, description: 'Stress damage' },
      { type: 'HEALTH', target: 'random', value: -1, description: 'Crew member stressed from malfunction' },
    ],
  },

  // === TRANSIT (Phase 3) ===
  {
    id: 'transit-solar-flare',
    name: 'Solar Flare Warning',
    description: 'Solar flare warning! Radiation levels are spiking. Take shelter or risk exposure.',
    probability: 15,
    category: EventCategory.Environmental,
    severity: EventSeverity.Moderate,
    phases: [Phase.LunarTransit],
    choices: [
      {
        id: 'shelter',
        text: 'Take shelter (lose course correction this turn)',
        effects: [{ type: 'NARRATIVE', value: 0, description: 'Crew shelters from radiation. No course correction this turn.' }],
      },
      {
        id: 'risk-it',
        text: 'Continue operations (risk radiation exposure)',
        effects: [
          { type: 'RESOURCE', target: ResourceType.Shielding, value: -2, description: 'Radiation degrades shielding' },
          { type: 'HEALTH', target: 'random', value: -1, description: 'Crew member stressed from radiation' },
        ],
      },
    ],
    effects: [],
  },
  {
    id: 'transit-micrometeorite',
    name: 'Micrometeorite Impact',
    description: 'Impact alarm! A micrometeorite swarm peppers the hull.',
    probability: 10,
    category: EventCategory.Environmental,
    severity: EventSeverity.Moderate,
    phases: [Phase.LunarTransit],
    effects: [{ type: 'RESOURCE', target: ResourceType.Shielding, value: -2, description: 'Hull absorbs impacts' }],
  },
  {
    id: 'transit-equipment-malfunction',
    name: 'Equipment Malfunction',
    description: 'Navigation system throws errors. Spare parts needed for repair.',
    probability: 15,
    category: EventCategory.Mechanical,
    severity: EventSeverity.Moderate,
    phases: [Phase.LunarTransit],
    effects: [{ type: 'RESOURCE', target: ResourceType.SpareParts, value: -2, description: 'Parts used for repair' }],
  },
  {
    id: 'transit-crew-conflict',
    name: 'Crew Conflict',
    description: 'Tensions flare in the cramped capsule. Two crew members clash over procedure.',
    probability: 10,
    category: EventCategory.Medical,
    severity: EventSeverity.Minor,
    phases: [Phase.LunarTransit],
    choices: [
      {
        id: 'intervene',
        text: 'Use medical supplies to counsel (costs 1 MU)',
        effects: [
          { type: 'RESOURCE', target: ResourceType.Medical, value: -1, description: 'Counseling session' },
          { type: 'MORALE', value: 5, description: 'Conflict resolved' },
        ],
      },
      {
        id: 'ignore',
        text: 'Let them work it out',
        effects: [
          { type: 'HEALTH', target: 'random', value: -1, description: 'Crew member stressed from conflict' },
          { type: 'MORALE', value: -5, description: 'Unresolved tension' },
        ],
      },
    ],
    effects: [],
  },
  {
    id: 'transit-earth-view',
    name: 'Beautiful Earth View',
    description: 'A breathtaking view of Earth from the observation window. The crew pauses in shared wonder.',
    probability: 5,
    category: EventCategory.Positive,
    severity: EventSeverity.Positive,
    phases: [Phase.LunarTransit],
    effects: [{ type: 'MORALE', value: 15, description: 'Morale boost from Earth view' }],
  },
  {
    id: 'transit-comms-delay',
    name: 'Communications Delay',
    description: 'Signal bounce delay makes real-time communication with Mission Control impossible this turn.',
    probability: 10,
    category: EventCategory.Supply,
    severity: EventSeverity.Minor,
    phases: [Phase.LunarTransit],
    effects: [{ type: 'MORALE', value: -3, description: 'Isolation weighs on crew' }],
  },
  {
    id: 'transit-food-contamination',
    name: 'Food Contamination',
    description: 'Bacterial contamination found in a food storage module. Affected supplies must be jettisoned.',
    probability: 8,
    category: EventCategory.Supply,
    severity: EventSeverity.Moderate,
    phases: [Phase.LunarTransit],
    effects: [{ type: 'RESOURCE', target: ResourceType.LifeSupport, value: -2, description: 'Contaminated food destroyed' }],
  },
  {
    id: 'transit-nav-glitch',
    name: 'Navigation Computer Glitch',
    description: 'The navigation computer freezes. Without a fix, trajectory error increases.',
    probability: 7,
    category: EventCategory.Mechanical,
    severity: EventSeverity.Moderate,
    phases: [Phase.LunarTransit],
    choices: [
      {
        id: 'fix',
        text: 'Spend 2 PU to repair the computer',
        effects: [{ type: 'RESOURCE', target: ResourceType.SpareParts, value: -2, description: 'Computer repair parts' }],
      },
      {
        id: 'leave',
        text: 'Accept the trajectory drift',
        effects: [{ type: 'TRAJECTORY', value: 3, description: 'Trajectory error increases' }],
      },
    ],
    effects: [],
  },

  // === GATEWAY (Phase 4) ===
  {
    id: 'gateway-supply-shortage',
    name: 'Supply Shortage',
    description: 'Gateway Station reports a supply shortage. Some resources unavailable for purchase.',
    probability: 15,
    category: EventCategory.Supply,
    severity: EventSeverity.Minor,
    phases: [Phase.Gateway],
    effects: [{ type: 'MORALE', value: -3, description: 'Supply shortage frustrates crew' }],
  },
  {
    id: 'gateway-bargain',
    name: 'Bargain Supplies',
    description: 'A departing mission offloads surplus supplies at cost. Lucky find!',
    probability: 10,
    category: EventCategory.Positive,
    severity: EventSeverity.Positive,
    phases: [Phase.Gateway],
    effects: [
      { type: 'RESOURCE', target: ResourceType.LifeSupport, value: 3, description: 'Surplus supplies acquired' },
      { type: 'MORALE', value: 5, description: 'Good fortune boosts spirits' },
    ],
  },
  {
    id: 'gateway-news-from-earth',
    name: 'News from Earth',
    description: 'A video message from families back home arrives. Tears and laughter fill the station module.',
    probability: 20,
    category: EventCategory.Positive,
    severity: EventSeverity.Positive,
    phases: [Phase.Gateway],
    effects: [{ type: 'MORALE', value: 10, description: 'Family messages boost morale' }],
  },
  {
    id: 'gateway-maintenance-delay',
    name: 'Station Maintenance Delay',
    description: 'Gateway Station is undergoing emergency maintenance. Docking takes longer than expected.',
    probability: 10,
    category: EventCategory.Mechanical,
    severity: EventSeverity.Minor,
    phases: [Phase.Gateway],
    effects: [{ type: 'MORALE', value: -2, description: 'Delay is frustrating' }],
  },

  // === SURFACE OPS (Phase 6) ===
  {
    id: 'surface-dust-contamination',
    name: 'Lunar Dust Contamination',
    description: 'Fine lunar regolith has infiltrated the air filtration system. Filters need replacement.',
    probability: 12,
    category: EventCategory.Environmental,
    severity: EventSeverity.Minor,
    phases: [Phase.SurfaceOps],
    effects: [{ type: 'RESOURCE', target: ResourceType.SpareParts, value: -1, description: 'Filter replacement' }],
  },
  {
    id: 'surface-radiation-spike',
    name: 'Solar Radiation Spike',
    description: 'Radiation monitors spike. The crew retreats to the shielded habitat core.',
    probability: 10,
    category: EventCategory.Environmental,
    severity: EventSeverity.Moderate,
    phases: [Phase.SurfaceOps],
    effects: [{ type: 'RESOURCE', target: ResourceType.Shielding, value: -2, description: 'Shielding absorbs radiation' }],
  },
  {
    id: 'surface-temp-hot',
    name: 'Temperature Extreme (Hot)',
    description: 'Direct sunlight heats the habitat beyond comfortable levels. Extra cooling needed.',
    probability: 8,
    category: EventCategory.Environmental,
    severity: EventSeverity.Minor,
    phases: [Phase.SurfaceOps],
    effects: [{ type: 'RESOURCE', target: ResourceType.LifeSupport, value: -1, description: 'Extra cooling consumes supplies' }],
  },
  {
    id: 'surface-temp-cold',
    name: 'Temperature Extreme (Cold)',
    description: 'Lunar night drops temperatures to -173°C. Extra heating required.',
    probability: 8,
    category: EventCategory.Environmental,
    severity: EventSeverity.Minor,
    phases: [Phase.SurfaceOps],
    effects: [{ type: 'RESOURCE', target: ResourceType.LifeSupport, value: -1, description: 'Extra heating consumes supplies' }],
  },
  {
    id: 'surface-equipment-failure',
    name: 'Equipment Failure',
    description: 'A critical system component has failed. Parts are needed for repair.',
    probability: 10,
    category: EventCategory.Mechanical,
    severity: EventSeverity.Moderate,
    phases: [Phase.SurfaceOps],
    effects: [{ type: 'RESOURCE', target: ResourceType.SpareParts, value: -2, description: 'Parts consumed by repair' }],
  },
  {
    id: 'surface-psych-stress',
    name: 'Psychological Stress',
    description: 'The isolation and confinement are taking their toll. A crew member shows signs of breakdown.',
    probability: 8,
    category: EventCategory.Medical,
    severity: EventSeverity.Minor,
    phases: [Phase.SurfaceOps],
    choices: [
      {
        id: 'counsel',
        text: 'Use medical supplies to counsel (1 MU)',
        effects: [
          { type: 'RESOURCE', target: ResourceType.Medical, value: -1, description: 'Counseling session' },
          { type: 'MORALE', value: 5, description: 'Crew feels supported' },
        ],
      },
      {
        id: 'ignore',
        text: 'Let them cope on their own',
        effects: [
          { type: 'HEALTH', target: 'random', value: -1, description: 'Crew member\'s condition worsens' },
          { type: 'MORALE', value: -5, description: 'Morale drops' },
        ],
      },
    ],
    effects: [],
  },
  {
    id: 'surface-moonquake',
    name: 'Moonquake',
    description: 'A deep moonquake rumbles through the base. Equipment rattles and dust rises from the floor.',
    probability: 5,
    category: EventCategory.Environmental,
    severity: EventSeverity.Moderate,
    phases: [Phase.SurfaceOps],
    effects: [
      { type: 'RESOURCE', target: ResourceType.Shielding, value: -1, description: 'Structural stress' },
      { type: 'RESOURCE', target: ResourceType.SpareParts, value: -1, description: 'Equipment displaced' },
    ],
  },
  {
    id: 'surface-discovery',
    name: 'Stunning Discovery',
    description: 'The science team discovers unusual mineral formations — a major scientific find!',
    probability: 5,
    category: EventCategory.Positive,
    severity: EventSeverity.Positive,
    phases: [Phase.SurfaceOps],
    effects: [
      { type: 'SCORE', value: 150, description: 'Major scientific discovery' },
      { type: 'MORALE', value: 10, description: 'Excitement over discovery' },
    ],
  },
  {
    id: 'surface-dust-storm',
    name: 'Dust Storm',
    description: 'A localized dust storm reduces visibility to zero. All EVA operations suspended.',
    probability: 7,
    category: EventCategory.Environmental,
    severity: EventSeverity.Minor,
    phases: [Phase.SurfaceOps],
    effects: [{ type: 'MORALE', value: -3, description: 'Dust storm delays operations' }],
  },
  {
    id: 'surface-comms-blackout',
    name: 'Communication Blackout',
    description: 'All communications with Earth are lost. The crew is truly alone.',
    probability: 5,
    category: EventCategory.Supply,
    severity: EventSeverity.Minor,
    phases: [Phase.SurfaceOps],
    effects: [
      { type: 'HEALTH', target: 'random', value: -1, description: 'Isolation stress' },
      { type: 'MORALE', value: -5, description: 'Loss of Earth contact' },
    ],
  },
  {
    id: 'surface-supply-cache',
    name: 'Supply Cache Found',
    description: 'Emergency supplies from a previous unmanned mission found nearby!',
    probability: 2,
    category: EventCategory.Positive,
    severity: EventSeverity.Positive,
    phases: [Phase.SurfaceOps],
    effects: [
      { type: 'RESOURCE', target: ResourceType.LifeSupport, value: 2, description: 'Cached supplies recovered' },
      { type: 'RESOURCE', target: ResourceType.SpareParts, value: 1, description: 'Spare parts found' },
      { type: 'MORALE', value: 5, description: 'Lucky find!' },
    ],
  },
];

export function getEventsForPhase(phase: Phase): GameEvent[] {
  return EVENTS.filter(e => e.phases.includes(phase));
}

export function rollEvent(state: GameState, rng: Rng): GameEvent | null {
  const phaseEvents = getEventsForPhase(state.phase);
  if (phaseEvents.length === 0) return null;

  const mods = DIFFICULTY_MODIFIERS[state.difficulty];
  const eventChanceMultiplier = mods.eventProbabilityMultiplier;

  // First, check if any event fires at all
  // Sum of all weights gives the denominator; "no event" fills the rest
  const totalWeight = phaseEvents.reduce((sum, e) => sum + e.probability, 0);
  const noEventWeight = Math.max(0, 100 - totalWeight);
  const adjustedTotal = totalWeight * eventChanceMultiplier + noEventWeight;

  const roll = rng.next() * adjustedTotal;

  // Check if "no event"
  if (roll >= totalWeight * eventChanceMultiplier) {
    return null;
  }

  // Select which event
  let cumulative = 0;
  for (const event of phaseEvents) {
    cumulative += event.probability * eventChanceMultiplier;
    if (roll < cumulative) {
      return event;
    }
  }

  return null;
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

export function applyEventEffects(
  state: GameState,
  event: GameEvent,
  choiceId?: string,
  rng?: Rng,
): { state: GameState; narrative: NarrativeEntry[] } {
  let newState: GameState = {
    ...state,
    resources: { ...state.resources },
    crew: state.crew.map(c => ({ ...c })),
  };

  const narrative: NarrativeEntry[] = [];
  const effectsToApply: EventEffect[] = [];

  // If choice, use choice effects; otherwise use base effects
  if (choiceId && event.choices) {
    const choice = event.choices.find(c => c.id === choiceId);
    if (choice) {
      effectsToApply.push(...choice.effects);
    }
  } else {
    effectsToApply.push(...event.effects);
  }

  for (const effect of effectsToApply) {
    switch (effect.type) {
      case 'RESOURCE': {
        const rt = effect.target as ResourceType;
        if (rt && rt in newState.resources) {
          newState.resources[rt] = Math.max(0, newState.resources[rt] + effect.value);
        }
        break;
      }

      case 'HEALTH': {
        const aliveCrew = newState.crew.filter(c => c.isAlive);
        if (aliveCrew.length > 0) {
          let target: typeof aliveCrew[0];
          if (effect.target === 'random') {
            const idx = rng ? rng.nextInt(0, aliveCrew.length - 1) : 0;
            target = aliveCrew[idx];
          } else {
            target = aliveCrew.find(c => c.id === effect.target) ?? aliveCrew[0];
          }

          const crewIdx = newState.crew.findIndex(c => c.id === target.id);
          if (crewIdx >= 0 && effect.value < 0) {
            // Worsen health
            const stepsDown = Math.abs(effect.value);
            for (let i = 0; i < stepsDown; i++) {
              newState.crew[crewIdx].healthStatus = worsenHealth(newState.crew[crewIdx].healthStatus);
            }
            if (newState.crew[crewIdx].healthStatus === HealthStatus.Dead) {
              newState.crew[crewIdx].isAlive = false;
              newState.crew[crewIdx].health = 0;
              narrative.push({
                id: `narrative-death-${target.id}-${state.turn}`,
                text: `${target.name} has died. The crew observes a moment of silence in the cold void.`,
                type: 'DEATH',
                timestamp: state.turn,
              });
            }
            newState.crew[crewIdx].turnsInState = 0;
          }
        }
        break;
      }

      case 'MORALE':
        newState.morale = Math.max(0, Math.min(100, newState.morale + effect.value));
        break;

      case 'TRAJECTORY':
        newState.phaseData = { ...newState.phaseData };
        newState.phaseData.trajectoryError += effect.value;
        break;

      case 'SCORE':
        newState.score += effect.value;
        break;

      case 'CREW_DEATH': {
        const alive = newState.crew.filter(c => c.isAlive);
        if (alive.length > 0) {
          const targetIdx = rng ? rng.nextInt(0, alive.length - 1) : 0;
          const victim = alive[targetIdx];
          const idx = newState.crew.findIndex(c => c.id === victim.id);
          newState.crew[idx].healthStatus = HealthStatus.Dead;
          newState.crew[idx].isAlive = false;
          newState.crew[idx].health = 0;
          narrative.push({
            id: `narrative-crew-death-${victim.id}-${state.turn}`,
            text: `${victim.name} succumbs to ${effect.description ?? 'fatal injuries'}. The mission continues, but the loss is felt deeply.`,
            type: 'DEATH',
            timestamp: state.turn,
          });
        }
        break;
      }

      case 'NARRATIVE':
        if (effect.description) {
          narrative.push({
            id: `narrative-effect-${event.id}-${state.turn}`,
            text: effect.description,
            type: 'EVENT',
            timestamp: state.turn,
          });
        }
        break;

      case 'PHASE':
        // Phase effects handled by phase controller
        break;
    }
  }

  // Add event narrative
  narrative.unshift({
    id: `narrative-event-${event.id}-${state.turn}`,
    text: event.description,
    type: event.severity === EventSeverity.Positive ? 'EVENT' : 'WARNING',
    timestamp: state.turn,
  });

  // Check for all crew dead
  if (newState.crew.every(c => !c.isAlive)) {
    newState.isGameOver = true;
    newState.gameOverReason = 'All crew members have perished. The mission is lost.';
  }

  return { state: newState, narrative };
}
