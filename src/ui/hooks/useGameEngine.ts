import { useState, useCallback } from 'react';
import { createEngine } from '../../engine/engine';
import type { GameState, GameResult, GameCommand, GameConfig, GameAction, NarrativeEntry, ScoreBreakdown, ScoreRating } from '../../engine/types';

export function useGameEngine() {
  const [engine] = useState(() => createEngine());
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const startGame = useCallback((config: GameConfig) => {
    const result = engine.createGame(config);
    setGameResult(result);
  }, [engine]);

  const executeCommand = useCallback((command: GameCommand) => {
    setGameResult(prev => {
      if (!prev) return prev;
      return engine.executeCommand(prev.state, command);
    });
  }, [engine]);

  const executeCommands = useCallback((commands: GameCommand[]) => {
    setGameResult(prev => {
      if (!prev) return prev;
      let result = prev;
      for (const cmd of commands) {
        result = engine.executeCommand(result.state, cmd);
      }
      return result;
    });
  }, [engine]);

  const saveGame = useCallback((): string | null => {
    if (!gameResult) return null;
    const saveData = engine.saveGame(gameResult.state);
    const json = JSON.stringify(saveData);
    try {
      localStorage.setItem('artemis-trail-save', json);
    } catch {
      // ignore storage errors
    }
    return json;
  }, [engine, gameResult]);

  const loadGame = useCallback((): boolean => {
    try {
      const json = localStorage.getItem('artemis-trail-save');
      if (!json) return false;
      const saveData = JSON.parse(json);
      const state = engine.loadGame(saveData);
      const actions = engine.getAvailableActions(state);
      setGameResult({
        state,
        narrative: state.narrativeLog,
        availableActions: actions,
      });
      return true;
    } catch {
      // Remove corrupted/invalid save data so future loads don't fail repeatedly
      try { localStorage.removeItem('artemis-trail-save'); } catch { /* ignore */ }
      return false;
    }
  }, [engine]);

  const hasSavedGame = useCallback((): boolean => {
    try {
      return localStorage.getItem('artemis-trail-save') !== null;
    } catch {
      return false;
    }
  }, []);

  return {
    gameResult,
    state: gameResult?.state ?? null,
    narrative: gameResult?.state?.narrativeLog ?? [],
    actions: gameResult?.availableActions ?? [],
    scoreBreakdown: gameResult?.scoreBreakdown ?? null,
    scoreRating: gameResult?.scoreRating ?? null,
    startGame,
    executeCommand,
    executeCommands,
    saveGame,
    loadGame,
    hasSavedGame,
    isGameStarted: gameResult !== null,
  };
}
