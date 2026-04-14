import React, { useCallback } from 'react';
import { Phase } from '../engine/types';
import { useGameEngine } from './hooks/useGameEngine';
import TitleScreen from './screens/TitleScreen';
import MissionPrepScreen from './screens/MissionPrepScreen';
import GameScreen from './screens/GameScreen';
import LandingSiteScreen from './screens/LandingSiteScreen';
import EventScreen from './screens/EventScreen';
import VictoryScreen from './screens/VictoryScreen';
import DefeatScreen from './screens/DefeatScreen';

export default function App(): React.ReactElement {
  const {
    state,
    narrative,
    actions,
    scoreBreakdown,
    scoreRating,
    startGame,
    executeCommand,
    executeCommands,
    loadGame,
    hasSavedGame,
    isGameStarted,
  } = useGameEngine();

  const handlePlayAgain = useCallback(() => {
    window.location.reload();
  }, []);

  // Not started → Title Screen
  if (!isGameStarted || !state) {
    return (
      <TitleScreen
        onStartGame={startGame}
        onLoadGame={loadGame}
        hasSavedGame={hasSavedGame}
      />
    );
  }

  // Game Over → Defeat Screen
  if (state.isGameOver) {
    return (
      <DefeatScreen
        state={state}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // Victory → Colony Phase
  if (state.phase === Phase.Colony) {
    return (
      <VictoryScreen
        state={state}
        scoreBreakdown={scoreBreakdown}
        scoreRating={scoreRating}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // Mission Prep Phase
  if (state.phase === Phase.MissionPrep) {
    return (
      <MissionPrepScreen
        state={state}
        onCommand={executeCommand}
        onCommands={executeCommands}
      />
    );
  }

  // Event with choices (not EVA pending)
  if (
    state.currentEvent &&
    state.currentEvent.choices &&
    state.currentEvent.choices.length > 0 &&
    !state.currentEvent.id.startsWith('eva-pending-')
  ) {
    return (
      <EventScreen
        state={state}
        event={state.currentEvent}
        onCommand={executeCommand}
      />
    );
  }

  // Gateway phase — show landing site selection after resupply is done
  if (
    state.phase === Phase.Gateway &&
    state.phaseData.gatewayVisited &&
    state.phaseData.gatewayResupplied
  ) {
    return (
      <LandingSiteScreen
        state={state}
        onCommand={executeCommand}
      />
    );
  }

  // Main Game Screen for all other phases
  return (
    <GameScreen
      state={state}
      narrative={narrative}
      actions={actions}
      onCommand={executeCommand}
    />
  );
}
