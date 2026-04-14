// Save/Load System

import {
  type GameState,
  type SaveData,
  SAVE_VERSION,
} from './types';

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
  if (data.version !== SAVE_VERSION) {
    throw new Error(
      `Save version mismatch: expected ${SAVE_VERSION}, got ${data.version}. This save file is incompatible.`
    );
  }

  // Deep clone to prevent reference sharing
  return structuredClone(data.gameState);
}
