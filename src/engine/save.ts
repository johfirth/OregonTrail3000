// Save/Load System

import {
  type GameState,
  type SaveData,
  type Resources,
  ResourceType,
  SAVE_VERSION,
} from './types';

const MAX_RESOURCE_VALUE = 10000;

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function sanitizeResources(resources: Resources): Resources {
  const types = [
    ResourceType.Propulsion,
    ResourceType.LifeSupport,
    ResourceType.SpareParts,
    ResourceType.Shielding,
    ResourceType.Medical,
    ResourceType.Budget,
  ] as const;

  const sanitized = { ...resources };
  for (const t of types) {
    sanitized[t] = clampNumber(sanitized[t], 0, MAX_RESOURCE_VALUE, 0);
  }
  return sanitized;
}

function validateGameState(state: unknown): state is GameState {
  if (state === null || typeof state !== 'object') return false;
  const s = state as Record<string, unknown>;
  return (
    typeof s.phase === 'string' &&
    typeof s.turn === 'number' &&
    typeof s.totalTurns === 'number' &&
    typeof s.missionDay === 'number' &&
    s.resources !== null && typeof s.resources === 'object' &&
    Array.isArray(s.crew) &&
    typeof s.morale === 'number' &&
    typeof s.isGameOver === 'boolean' &&
    typeof s.score === 'number' &&
    typeof s.difficulty === 'string' &&
    typeof s.rngSeed === 'number'
  );
}

export function createSaveData(state: GameState): SaveData {
  const crewAlive = state.crew.filter(c => c.isAlive).length;
  const commander = state.crew.find(c => c.role === 'COMMANDER');

  return {
    version: SAVE_VERSION,
    timestamp: new Date().toISOString(),
    gameState: structuredClone(state),
    metadata: {
      commanderName: commander?.name ?? 'Unknown',
      difficulty: state.difficulty,
      turn: state.turn,
      phase: state.phase,
      crewAlive,
    },
  };
}

export function loadSaveData(data: SaveData): GameState {
  if (data === null || typeof data !== 'object') {
    throw new Error('Invalid save data: expected an object.');
  }

  if (data.version !== SAVE_VERSION) {
    throw new Error(
      `Save version mismatch: expected ${SAVE_VERSION}, got ${data.version}. This save file is incompatible.`
    );
  }

  if (!validateGameState(data.gameState)) {
    throw new Error('Invalid save data: gameState is missing required fields.');
  }

  // Deep clone to prevent reference sharing
  const state = structuredClone(data.gameState);

  // Sanitize numeric values to prevent NaN/Infinity/negative corruption
  state.resources = sanitizeResources(state.resources);
  state.morale = clampNumber(state.morale, 0, 100, 50);
  state.turn = clampNumber(state.turn, 0, 1000, 0);
  state.totalTurns = clampNumber(state.totalTurns, 0, 1000, 0);
  state.missionDay = clampNumber(state.missionDay, 0, 10000, 0);
  state.score = clampNumber(state.score, 0, 100000, 0);
  state.rngSeed = clampNumber(state.rngSeed, 0, Number.MAX_SAFE_INTEGER, 1);

  for (const member of state.crew) {
    member.health = clampNumber(member.health, 0, 100, 0);
    member.turnsInState = clampNumber(member.turnsInState, 0, 1000, 0);
  }

  return state;
}
