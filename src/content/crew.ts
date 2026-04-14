// ============================================================
// Artemis Trail — Default Crew Data
// The Commander is added dynamically with the player's name.
// ============================================================

import { CrewMember, CrewRole, HealthStatus } from '../engine/types';

export const DEFAULT_CREW: Omit<CrewMember, 'id'>[] = [
  {
    name: 'Dr. Alex Chen',
    role: CrewRole.Pilot,
    health: 100,
    healthStatus: HealthStatus.Healthy,
    isAlive: true,
    turnsInState: 0,
    specialAbility: 'Propulsion Efficiency — 15% fuel savings on all maneuvers',
  },
  {
    name: 'Specialist Jordan Rivera',
    role: CrewRole.Engineer,
    health: 100,
    healthStatus: HealthStatus.Healthy,
    isAlive: true,
    turnsInState: 0,
    specialAbility: 'Efficient Repairs — 30% reduction in spare parts usage',
  },
  {
    name: 'Dr. Sam Okafor',
    role: CrewRole.Scientist,
    health: 100,
    healthStatus: HealthStatus.Healthy,
    isAlive: true,
    turnsInState: 0,
    specialAbility: 'Enhanced Resource Extraction — 40% bonus on EVA yields',
  },
];
