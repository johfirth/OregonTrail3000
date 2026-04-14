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
    if (!gameResult) return;
    const result = engine.executeCommand(gameResult.state, command);
    setGameResult(result);
  }, [engine, gameResult]);

  const saveGame = useCallback((): string | null => {
    if (!gameResult) return null;
    const saveData = engine.saveGame(gameResult.state);
    const json = JSON.stringify(saveData);
    try {
      localStorage.setItem('lunar-colony-save', json);
    } catch {
      // ignore storage errors
    }
    return json;
  }, [engine, gameResult]);

  const loadGame = useCallback((): boolean => {
    try {
      const json = localStorage.getItem('lunar-colony-save');
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
      return false;
    }
  }, [engine]);

  const hasSavedGame = useCallback((): boolean => {
    try {
      return localStorage.getItem('lunar-colony-save') !== null;
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
    saveGame,
    loadGame,
    hasSavedGame,
    isGameStarted: gameResult !== null,
  };
}
