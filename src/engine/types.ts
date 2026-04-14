// ============================================================
// Artemis Trail — Engine Type Definitions
// This file defines ALL shared types for the game engine.
// ZERO DOM or Electron dependencies allowed.
// ============================================================

// --- Game Phases (7 distinct phases from game design) ---
export enum Phase {
  MissionPrep = 'MISSION_PREP',
  Launch = 'LAUNCH',
  LunarTransit = 'LUNAR_TRANSIT',
  Gateway = 'GATEWAY',
  Descent = 'DESCENT',
  SurfaceOps = 'SURFACE_OPS',
  Colony = 'COLONY',
}

// --- Resources (6 resources mapped from Oregon Trail) ---
export enum ResourceType {
  Propulsion = 'PROPULSION',
  LifeSupport = 'LIFE_SUPPORT',
  SpareParts = 'SPARE_PARTS',
  Shielding = 'SHIELDING',
  Medical = 'MEDICAL',
  Budget = 'BUDGET',
}

export interface Resources {
  [ResourceType.Propulsion]: number;    // Fuel Units (FU)
  [ResourceType.LifeSupport]: number;   // Supply Days (SD)
  [ResourceType.SpareParts]: number;    // Part Units (PU)
  [ResourceType.Shielding]: number;     // Shield Rating (SR)
  [ResourceType.Medical]: number;       // Med Units (MU)
  [ResourceType.Budget]: number;        // Credits (CR)
}

// --- Resource purchase constraints (from resource table) ---
export interface ResourceCost {
  resourceType: ResourceType;
  costPerUnit: number;        // CR per unit
  minPurchase: number;        // minimum CR spend
  maxPurchase: number;        // maximum CR spend
  unitLabel: string;          // e.g. "Fuel Units (FU)"
}

// --- Crew (4-person crew per game design) ---
export enum CrewRole {
  Commander = 'COMMANDER',
  Pilot = 'PILOT',
  Engineer = 'ENGINEER',
  Scientist = 'SCIENTIST',
}

export enum HealthStatus {
  Healthy = 'HEALTHY',
  Stressed = 'STRESSED',
  Ill = 'ILL',
  Critical = 'CRITICAL',
  Dead = 'DEAD',
}

export interface CrewMember {
  id: string;
  name: string;
  role: CrewRole;
  health: number;              // 0–100
  healthStatus: HealthStatus;
  isAlive: boolean;
  turnsInState: number;        // turns spent in current health state
  specialAbility: string;
}

// --- Life Support Consumption Level ---
export enum ConsumptionLevel {
  Rationing = 'RATIONING',     // 0.5 SD/turn, ×2.0 illness risk
  Standard = 'STANDARD',       // 1.0 SD/turn, ×1.0 illness risk
  Generous = 'GENEROUS',       // 1.5 SD/turn, ×0.5 illness risk
}

// --- Launch Profile (Phase 2) ---
export enum LaunchProfile {
  Conservative = 'CONSERVATIVE',   // 90 FU, 5% complication
  Standard = 'STANDARD',           // 80 FU, 12% complication
  Aggressive = 'AGGRESSIVE',       // 65 FU, 25% complication
}

// --- EVA Types (Phase 6 activities, replaces hunting) ---
export enum EvaType {
  IceExtraction = 'ICE_EXTRACTION',     // +3 SD base (modified by site)
  EquipmentRepair = 'EQUIPMENT_REPAIR', // +2 SR or +1 PU
  ScienceMission = 'SCIENCE_MISSION',   // +150 score (±30 by site)
}

// --- EVA Outcome (skill challenge result) ---
export enum EvaOutcome {
  Textbook = 'TEXTBOOK',           // Fast + perfect: full yield, 1 PU
  Successful = 'SUCCESSFUL',       // Medium + perfect: 75% yield, 1 PU
  Difficult = 'DIFFICULT',         // Slow + perfect: 50% yield, 2 PU
  Fumble = 'FUMBLE',               // Typo: 25% yield, 2 PU
  Aborted = 'ABORTED',             // Timeout: 0% yield, 1 PU
}

// --- Surface Activity (Phase 6 turn actions) ---
export enum SurfaceActivity {
  EvaIceExtraction = 'EVA_ICE_EXTRACTION',
  EvaEquipmentRepair = 'EVA_EQUIPMENT_REPAIR',
  EvaScienceMission = 'EVA_SCIENCE_MISSION',
  Shelter = 'SHELTER',
  MedicalTreatment = 'MEDICAL_TREATMENT',
}

// --- Landing Sites (5 sites from game design) ---
export interface LandingSite {
  id: string;
  name: string;
  sunlight: number;            // 1–5: solar power → life support efficiency
  iceAccess: number;           // 1–5: water extraction → SD renewal
  terrainDifficulty: number;   // 1–5: higher = harder landing
  communications: number;      // 1–5: Earth contact → event resolution
  description: string;
}

// --- Illness Types ---
export enum IllnessType {
  RadiationSickness = 'RADIATION_SICKNESS',
  DecompressionInjury = 'DECOMPRESSION_INJURY',
  PsychologicalBreakdown = 'PSYCHOLOGICAL_BREAKDOWN',
  DustInhalation = 'DUST_INHALATION',
  PhysicalInjury = 'PHYSICAL_INJURY',
  Hypothermia = 'HYPOTHERMIA',
}

// --- Event System ---
export enum EventCategory {
  Environmental = 'ENVIRONMENTAL',
  Mechanical = 'MECHANICAL',
  Medical = 'MEDICAL',
  Supply = 'SUPPLY',
  Positive = 'POSITIVE',
}

export enum EventSeverity {
  Minor = 'MINOR',             // 1 unit cost, Stressed at worst
  Moderate = 'MODERATE',       // 2–3 units, Ill at worst
  Severe = 'SEVERE',           // 4–5 units, Critical at worst
  Catastrophic = 'CATASTROPHIC', // 6+ units, Dead possible
  Positive = 'POSITIVE',       // beneficial event
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  probability: number;         // weight in probability table
  category: EventCategory;
  severity: EventSeverity;
  phases: Phase[];             // which phases this event can occur in
  choices?: EventChoice[];
  effects: EventEffect[];
}

export interface EventChoice {
  id: string;
  text: string;
  effects: EventEffect[];
}

export interface EventEffect {
  type: 'RESOURCE' | 'HEALTH' | 'MORALE' | 'PHASE' | 'CREW_DEATH' | 'NARRATIVE' | 'TRAJECTORY' | 'SCORE';
  target?: ResourceType | string;
  value: number;               // positive = gain, negative = loss
  description?: string;
}

// --- Game Commands (player actions) ---
export type GameCommand =
  | { type: 'ALLOCATE_RESOURCES'; resources: Resources }
  | { type: 'SELECT_CREW'; crew: CrewMember[] }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'START_MISSION' }
  | { type: 'SET_CONSUMPTION'; level: ConsumptionLevel }
  | { type: 'SELECT_LAUNCH_PROFILE'; profile: LaunchProfile }
  | { type: 'ALLOCATE_COURSE_CORRECTION'; fuelUnits: number }
  | { type: 'PROCEED' }
  | { type: 'STOP_AT_GATEWAY' }
  | { type: 'GATEWAY_RESUPPLY'; purchases: Partial<Resources> }
  | { type: 'GATEWAY_MEDICAL'; crewId: string }
  | { type: 'SELECT_LANDING_SITE'; siteId: string }
  | { type: 'EXECUTE_DESCENT'; fuelUnits: number }
  | { type: 'ABORT_LANDING' }
  | { type: 'SELECT_SURFACE_ACTIVITY'; activity: SurfaceActivity; targetCrewId?: string }
  | { type: 'EVA_SKILL_RESULT'; outcome: EvaOutcome }
  | { type: 'EVENT_CHOICE'; eventId: string; choiceId: string }
  | { type: 'SAVE_GAME' }
  | { type: 'LOAD_GAME'; saveData: SaveData };

// --- Available Actions ---
export interface GameAction {
  command: GameCommand['type'];
  label: string;
  description: string;
  enabled: boolean;
  disabledReason?: string;
  cost?: Partial<Resources>;
}

// --- Narrative Output ---
export interface NarrativeEntry {
  id: string;
  text: string;
  type: 'STORY' | 'EVENT' | 'STATUS' | 'WARNING' | 'DEATH' | 'VICTORY' | 'SYSTEM';
  timestamp: number;           // turn number
}

// --- Phase-Specific State ---
export interface PhaseData {
  // Phase 2: Launch
  launchProfile: LaunchProfile | null;
  launchComplicationOccurred: boolean;

  // Phase 3: Lunar Transit
  trajectoryError: number;              // starts at 10, reduced by corrections
  transitTurnsRemaining: number;        // starts at 3

  // Phase 4: Gateway
  gatewayVisited: boolean;
  gatewayResupplied: boolean;

  // Phase 5: Descent
  landingAttempted: boolean;
  landingScore: number;
  landingAbortUsed: boolean;

  // Phase 6: Surface Ops
  surfaceTurnsCompleted: number;
  surfaceTurnsTotal: number;            // 5–8 based on fuel + supplies
  evasCompleted: number;
  scienceEvasCompleted: number;
  baseConstructionProgress: number;     // 0–100
}

// --- Game State ---
export interface GameState {
  phase: Phase;
  turn: number;
  totalTurns: number;
  missionDay: number;
  resources: Resources;
  crew: CrewMember[];
  morale: number;                       // 0–100
  consumptionLevel: ConsumptionLevel;
  selectedLandingSite: LandingSite | null;
  narrativeLog: NarrativeEntry[];
  currentEvent: GameEvent | null;
  phaseData: PhaseData;
  rngSeed: number;
  isGameOver: boolean;
  gameOverReason: string | null;
  victoryTier: VictoryTier | null;
  score: number;
  difficulty: Difficulty;
}

// --- Victory / Defeat ---
export enum VictoryTier {
  ThrivingColony = 'THRIVING_COLONY',         // 4+ crew, high resources, all science
  SustainableOutpost = 'SUSTAINABLE_OUTPOST', // 3+ crew, adequate resources
  BareSurvival = 'BARE_SURVIVAL',             // 2 crew, minimum resources
}

export enum Difficulty {
  Cadet = 'CADET',
  Astronaut = 'ASTRONAUT',
  Commander = 'COMMANDER',
  Ironman = 'IRONMAN',
}

// --- Difficulty Modifier Table ---
export interface DifficultyModifiers {
  startingBudget: number;             // total CR
  spacecraftCost: number;             // pre-allocated CR
  availableBudget: number;            // startingBudget - spacecraftCost
  eventProbabilityMultiplier: number; // ×0.7 to ×1.5
  turnsBeforeHealthWorsens: number;
  healthWorsenEarlyChance: number;    // 0 for Cadet/Astronaut, 0.5 for Commander
  evaAccidentMultiplier: number;      // ×0.5 to ×1.5
  gatewayPriceMultiplier: number;     // ×1.25 to ×2.0
  landingScoreBonus: number;          // +10 to -15
  surfaceBaseTurns: number;           // 4–6
  surfaceMaxTurns: number;
  baseIllnessChance: number;          // 0.05 to 0.15
  saveLoadAllowed: boolean;
}

// --- Score Components ---
export interface ScoreBreakdown {
  survivingCrew: number;              // 250 per crew
  crewHealthBonus: number;            // 50 per Healthy crew
  remainingLifeSupport: number;       // 10 per SD
  remainingSpareParts: number;        // 15 per PU
  remainingShielding: number;         // 20 per SR
  remainingMedical: number;           // 25 per MU
  remainingFuel: number;              // 5 per FU
  scienceEvas: number;                // 150 per science EVA
  landingQuality: number;             // 0–50
  siteDifficulty: number;             // 0–100
  speedBonus: number;                 // 20 per turn under 13
  noDeathsBonus: number;              // 500 if all 4 alive
  total: number;
}

export enum ScoreRating {
  S = 'S',   // 3000+  "One Giant Leap"
  A = 'A',   // 2200–2999  "Mission Success"
  B = 'B',   // 1500–2199  "Colony Established"
  C = 'C',   // 1000–1499  "Survived"
  D = 'D',   // 500–999   "Barely Made It"
  F = 'F',   // 0–499     "Pyrrhic Victory"
}

// --- Maneuver Fuel Costs (from propulsion table) ---
export interface ManeuverCost {
  name: string;
  phase: Phase;
  baseFuelCost: number;
  minimumFuel: number;
}

// --- Game Result (returned after executing a command) ---
export interface GameResult {
  state: GameState;
  narrative: NarrativeEntry[];        // new entries generated by this command
  availableActions: GameAction[];
  scoreBreakdown?: ScoreBreakdown;    // included in Colony phase
  scoreRating?: ScoreRating;
}

// --- Game Configuration ---
export interface GameConfig {
  difficulty: Difficulty;
  commanderName: string;
  rngSeed?: number;                   // optional — random if not provided
}

// --- Save / Load ---
export interface SaveData {
  version: number;
  timestamp: string;                  // ISO 8601
  gameState: GameState;
  metadata: {
    commanderName: string;
    difficulty: Difficulty;
    turn: number;
    phase: Phase;
    crewAlive: number;
  };
}

export const SAVE_VERSION = 1;

// --- Engine Interface ---
export interface GameEngine {
  createGame(config: GameConfig): GameResult;
  executeCommand(state: GameState, command: GameCommand): GameResult;
  getAvailableActions(state: GameState): GameAction[];
  saveGame(state: GameState): SaveData;
  loadGame(data: SaveData): GameState;
}

// --- System Interface (for game systems to implement) ---
export interface GameSystem {
  name: string;
  initialize(state: GameState): GameState;
  processTurn(state: GameState): GameState;
}

// ============================================================
// Game Constants — sourced from game-mechanics-mission.md
// All balance-tunable values externalized here.
// ============================================================

export const TOTAL_BUDGET = 1000;
export const SPACECRAFT_COST = 200;

// Life support consumption rates (SD per turn)
export const CONSUMPTION_RATES: Record<ConsumptionLevel, number> = {
  [ConsumptionLevel.Rationing]: 0.5,
  [ConsumptionLevel.Standard]: 1.0,
  [ConsumptionLevel.Generous]: 1.5,
};

// Illness risk multipliers by consumption level
export const ILLNESS_MODIFIERS: Record<ConsumptionLevel, number> = {
  [ConsumptionLevel.Rationing]: 2.0,
  [ConsumptionLevel.Standard]: 1.0,
  [ConsumptionLevel.Generous]: 0.5,
};

// Resource purchase costs (CR per unit)
export const RESOURCE_COSTS: Record<ResourceType, ResourceCost> = {
  [ResourceType.Propulsion]: {
    resourceType: ResourceType.Propulsion,
    costPerUnit: 1,
    minPurchase: 200,
    maxPurchase: 400,
    unitLabel: 'Fuel Units (FU)',
  },
  [ResourceType.LifeSupport]: {
    resourceType: ResourceType.LifeSupport,
    costPerUnit: 5,
    minPurchase: 0,
    maxPurchase: 400,
    unitLabel: 'Supply Days (SD)',
  },
  [ResourceType.SpareParts]: {
    resourceType: ResourceType.SpareParts,
    costPerUnit: 5,
    minPurchase: 0,
    maxPurchase: 250,
    unitLabel: 'Part Units (PU)',
  },
  [ResourceType.Shielding]: {
    resourceType: ResourceType.Shielding,
    costPerUnit: 10,
    minPurchase: 0,
    maxPurchase: 200,
    unitLabel: 'Shield Rating (SR)',
  },
  [ResourceType.Medical]: {
    resourceType: ResourceType.Medical,
    costPerUnit: 10,
    minPurchase: 0,
    maxPurchase: 150,
    unitLabel: 'Med Units (MU)',
  },
  [ResourceType.Budget]: {
    resourceType: ResourceType.Budget,
    costPerUnit: 1,
    minPurchase: 0,
    maxPurchase: Infinity,
    unitLabel: 'Credits (CR)',
  },
};

// Launch profile parameters
export const LAUNCH_PROFILES: Record<LaunchProfile, { fuelCost: number; complicationChance: number }> = {
  [LaunchProfile.Conservative]: { fuelCost: 90, complicationChance: 0.05 },
  [LaunchProfile.Standard]: { fuelCost: 80, complicationChance: 0.12 },
  [LaunchProfile.Aggressive]: { fuelCost: 65, complicationChance: 0.25 },
};

// Maneuver fuel costs
export const MANEUVER_COSTS: ManeuverCost[] = [
  { name: 'Trans-Lunar Injection',  phase: Phase.Launch,       baseFuelCost: 80,  minimumFuel: 60 },
  { name: 'Course Correction 1',    phase: Phase.LunarTransit, baseFuelCost: 15,  minimumFuel: 5 },
  { name: 'Course Correction 2',    phase: Phase.LunarTransit, baseFuelCost: 15,  minimumFuel: 5 },
  { name: 'Course Correction 3',    phase: Phase.LunarTransit, baseFuelCost: 10,  minimumFuel: 0 },
  { name: 'Lunar Orbital Insertion', phase: Phase.Gateway,     baseFuelCost: 50,  minimumFuel: 40 },
  { name: 'Gateway Docking',        phase: Phase.Gateway,      baseFuelCost: 5,   minimumFuel: 3 },
  { name: 'Descent Burn',           phase: Phase.Descent,      baseFuelCost: 60,  minimumFuel: 45 },
  { name: 'Landing Abort',          phase: Phase.Descent,      baseFuelCost: 40,  minimumFuel: 40 },
];

// Gateway resupply price multiplier (base × this)
export const GATEWAY_BASE_PRICE_MULTIPLIER = 1.5;
export const GATEWAY_MEDICAL_COST = 20; // CR per crew member

// EVA constants
export const EVA_MIN_SPARE_PARTS = 1;
export const EVA_ICE_BASE_YIELD = 3;         // SD
export const EVA_REPAIR_YIELD_SR = 2;        // SR
export const EVA_REPAIR_YIELD_PU = 1;        // PU
export const EVA_SCIENCE_BASE_SCORE = 150;   // score points
export const EVA_ICE_PARTS_COST = 2;         // PU consumed per ice extraction
export const EVA_REPAIR_PARTS_COST = 3;      // PU required for repair

// Health system
export const BASE_ILLNESS_CHANCE = 0.08;
export const TURNS_BEFORE_HEALTH_WORSENS = 2;

// Surface ops
export const SURFACE_BASE_TURNS = 5;
export const SURFACE_MAX_TURNS = 8;
export const SURFACE_BONUS_FUEL_DIVISOR = 30; // bonus_turns = floor(FU / 30)

// Descent
export const LANDING_CRASH_THRESHOLD = 0;
export const DESCENT_MIN_FUEL = 45;
export const DESCENT_MAX_FUEL = 80;
export const LANDING_ABORT_FUEL_COST = 40;

// Trajectory
export const INITIAL_TRAJECTORY_ERROR = 10;

// Score point values
export const SCORE_PER_CREW = 250;
export const SCORE_PER_HEALTHY_CREW = 50;
export const SCORE_PER_SD = 10;
export const SCORE_PER_PU = 15;
export const SCORE_PER_SR = 20;
export const SCORE_PER_MU = 25;
export const SCORE_PER_FU = 5;
export const SCORE_PER_SCIENCE_EVA = 150;
export const SCORE_LANDING_MAX = 50;
export const SCORE_SITE_DIFFICULTY_MAX = 100;
export const SCORE_SPEED_PER_TURN = 20;
export const SCORE_SPEED_TARGET_TURNS = 13;
export const SCORE_NO_DEATHS_BONUS = 500;

// Max mission turns before time-limit failure
export const MAX_MISSION_TURNS = 18;

// Difficulty presets
export const DIFFICULTY_MODIFIERS: Record<Difficulty, DifficultyModifiers> = {
  [Difficulty.Cadet]: {
    startingBudget: 1200,
    spacecraftCost: 200,
    availableBudget: 1000,
    eventProbabilityMultiplier: 0.7,
    turnsBeforeHealthWorsens: 3,
    healthWorsenEarlyChance: 0,
    evaAccidentMultiplier: 0.5,
    gatewayPriceMultiplier: 1.25,
    landingScoreBonus: 10,
    surfaceBaseTurns: 6,
    surfaceMaxTurns: 8,
    baseIllnessChance: 0.05,
    saveLoadAllowed: true,
  },
  [Difficulty.Astronaut]: {
    startingBudget: 1000,
    spacecraftCost: 200,
    availableBudget: 800,
    eventProbabilityMultiplier: 1.0,
    turnsBeforeHealthWorsens: 2,
    healthWorsenEarlyChance: 0,
    evaAccidentMultiplier: 1.0,
    gatewayPriceMultiplier: 1.5,
    landingScoreBonus: 0,
    surfaceBaseTurns: 5,
    surfaceMaxTurns: 8,
    baseIllnessChance: 0.08,
    saveLoadAllowed: true,
  },
  [Difficulty.Commander]: {
    startingBudget: 800,
    spacecraftCost: 200,
    availableBudget: 600,
    eventProbabilityMultiplier: 1.3,
    turnsBeforeHealthWorsens: 2,
    healthWorsenEarlyChance: 0.5,
    evaAccidentMultiplier: 1.3,
    gatewayPriceMultiplier: 1.75,
    landingScoreBonus: -10,
    surfaceBaseTurns: 5,
    surfaceMaxTurns: 8,
    baseIllnessChance: 0.12,
    saveLoadAllowed: true,
  },
  [Difficulty.Ironman]: {
    startingBudget: 800,
    spacecraftCost: 200,
    availableBudget: 600,
    eventProbabilityMultiplier: 1.5,
    turnsBeforeHealthWorsens: 1,
    healthWorsenEarlyChance: 0,
    evaAccidentMultiplier: 1.5,
    gatewayPriceMultiplier: 2.0,
    landingScoreBonus: -15,
    surfaceBaseTurns: 4,
    surfaceMaxTurns: 8,
    baseIllnessChance: 0.15,
    saveLoadAllowed: false,
  },
};

// Pre-defined landing sites (from game design)
export const LANDING_SITES: LandingSite[] = [
  {
    id: 'shackleton-rim',
    name: 'Shackleton Rim',
    sunlight: 5,
    iceAccess: 4,
    terrainDifficulty: 2,
    communications: 4,
    description: 'The rim of Shackleton Crater offers near-permanent sunlight and good ice access, but the rough terrain makes landing tricky.',
  },
  {
    id: 'nobile-valley',
    name: 'Nobile Valley',
    sunlight: 3,
    iceAccess: 5,
    terrainDifficulty: 3,
    communications: 3,
    description: 'Nobile Crater region boasts the best ice deposits on the Moon, but limited sunlight and moderate comms make it a survival challenge.',
  },
  {
    id: 'malapert-summit',
    name: 'Malapert Summit',
    sunlight: 4,
    iceAccess: 2,
    terrainDifficulty: 4,
    communications: 5,
    description: 'Malapert Mountain provides excellent communications with Earth and decent sunlight, but ice is scarce and landing is difficult.',
  },
  {
    id: 'haworth-basin',
    name: 'Haworth Basin',
    sunlight: 2,
    iceAccess: 5,
    terrainDifficulty: 3,
    communications: 2,
    description: 'Deep within Haworth Crater, ice is abundant but sunlight and communications are severely limited.',
  },
  {
    id: 'de-gerlache-ridge',
    name: 'de Gerlache Ridge',
    sunlight: 4,
    iceAccess: 3,
    terrainDifficulty: 5,
    communications: 3,
    description: 'The ridge above de Gerlache Crater offers the safest landing terrain on the south pole, with moderate resources across the board.',
  },
];
