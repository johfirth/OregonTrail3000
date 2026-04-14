// Game State Factory — creates initial GameState from config

import {
  type GameConfig,
  type GameState,
  type CrewMember,
  type Resources,
  type PhaseData,
  Phase,
  ResourceType,
  CrewRole,
  HealthStatus,
  ConsumptionLevel,
  LaunchProfile,
  Difficulty,
  DIFFICULTY_MODIFIERS,
  INITIAL_TRAJECTORY_ERROR,
} from './types';

function createDefaultCrew(commanderName: string): CrewMember[] {
  return [
    {
      id: 'crew-commander',
      name: commanderName,
      role: CrewRole.Commander,
      health: 100,
      healthStatus: HealthStatus.Healthy,
      isAlive: true,
      turnsInState: 0,
      specialAbility: 'Leadership: event severity reduced by 1 level',
    },
    {
      id: 'crew-pilot',
      name: 'Dr. Alex Chen',
      role: CrewRole.Pilot,
      health: 100,
      healthStatus: HealthStatus.Healthy,
      isAlive: true,
      turnsInState: 0,
      specialAbility: 'Navigation: maneuver complication chance -15%',
    },
    {
      id: 'crew-engineer',
      name: 'Specialist Jordan Rivera',
      role: CrewRole.Engineer,
      health: 100,
      healthStatus: HealthStatus.Healthy,
      isAlive: true,
      turnsInState: 0,
      specialAbility: 'Repair: repair costs reduced by 1 PU',
    },
    {
      id: 'crew-scientist',
      name: 'Dr. Sam Okafor',
      role: CrewRole.Scientist,
      health: 100,
      healthStatus: HealthStatus.Healthy,
      isAlive: true,
      turnsInState: 0,
      specialAbility: 'Research: science EVA score +50%',
    },
  ];
}

function createEmptyResources(): Resources {
  return {
    [ResourceType.Propulsion]: 0,
    [ResourceType.LifeSupport]: 0,
    [ResourceType.SpareParts]: 0,
    [ResourceType.Shielding]: 0,
    [ResourceType.Medical]: 0,
    [ResourceType.Budget]: 0,
  };
}

function createInitialPhaseData(difficulty: Difficulty): PhaseData {
  const mods = DIFFICULTY_MODIFIERS[difficulty];
  return {
    launchProfile: null,
    launchComplicationOccurred: false,
    trajectoryError: INITIAL_TRAJECTORY_ERROR,
    transitTurnsRemaining: 3,
    gatewayVisited: false,
    gatewayResupplied: false,
    landingAttempted: false,
    landingScore: 0,
    landingAbortUsed: false,
    surfaceTurnsCompleted: 0,
    surfaceTurnsTotal: mods.surfaceBaseTurns,
    evasCompleted: 0,
    scienceEvasCompleted: 0,
    baseConstructionProgress: 0,
  };
}

export function createInitialState(config: GameConfig): GameState {
  const seed = config.rngSeed ?? Math.floor(Math.random() * 2147483647);

  return {
    phase: Phase.MissionPrep,
    turn: 0,
    totalTurns: 0,
    missionDay: 0,
    resources: createEmptyResources(),
    crew: createDefaultCrew(config.commanderName),
    morale: 75,
    consumptionLevel: ConsumptionLevel.Standard,
    selectedLandingSite: null,
    narrativeLog: [],
    currentEvent: null,
    phaseData: createInitialPhaseData(config.difficulty),
    rngSeed: seed,
    isGameOver: false,
    gameOverReason: null,
    victoryTier: null,
    score: 0,
    difficulty: config.difficulty,
  };
}
