import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Phase, ThemeMode, FontSize } from '../engine/types';
import { useGameEngine } from './hooks/useGameEngine';
import { useTheme } from './hooks/useTheme';
import { useSettings } from './hooks/useSettings';
import TitleScreen from './screens/TitleScreen';
import MissionPrepScreen from './screens/MissionPrepScreen';
import GameScreen from './screens/GameScreen';
import LandingSiteScreen from './screens/LandingSiteScreen';
import EventScreen from './screens/EventScreen';
import VictoryScreen from './screens/VictoryScreen';
import DefeatScreen from './screens/DefeatScreen';
import SettingsScreen from './screens/SettingsScreen';

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
    saveGame,
    loadGame,
    hasSavedGame,
    isGameStarted,
  } = useGameEngine();

  const { COLORS } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  const appRef = useRef<HTMLDivElement>(null);

  // Grab focus on the app container whenever the screen changes
  // This ensures keyboard events are captured by the game, not lost
  const currentScreen = state?.phase ?? 'title';
  const isGameOver = state?.isGameOver ?? false;
  const hasEvent = state?.currentEvent?.choices?.length ?? 0;
  useEffect(() => {
    // After screen transition, focus the app container so keyboard works
    // Small delay to let React render the new screen first
    const timer = setTimeout(() => {
      if (appRef.current) {
        // Only grab focus if nothing else is focused (don't steal from inputs)
        const active = document.activeElement;
        if (!active || active === document.body || active.tagName === 'BUTTON') {
          appRef.current.focus();
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [currentScreen, isGameOver, hasEvent]);

  const handlePlayAgain = useCallback(() => {
    window.location.reload();
  }, []);

  // Listen for Electron native menu actions
  const { updateSettings } = useSettings();
  useEffect(() => {
    const api = (window as any).electronAPI;
    if (!api?.onMenuAction) return;
    api.onMenuAction((action: string) => {
      switch (action) {
        case 'new-game':
          window.location.reload();
          break;
        case 'save-game':
          // Trigger save via engine hook (Ctrl+S equivalent)
          if (isGameStarted) saveGame();
          break;
        case 'load-game':
          loadGame();
          break;
        case 'open-settings':
          setShowSettings(true);
          break;
        case 'theme-nasa':
          updateSettings({ theme: ThemeMode.NASA });
          break;
        case 'theme-retro':
          updateSettings({ theme: ThemeMode.Retro80s });
          break;
        case 'font-small':
          updateSettings({ fontSize: FontSize.Small });
          break;
        case 'font-medium':
          updateSettings({ fontSize: FontSize.Medium });
          break;
        case 'font-large':
          updateSettings({ fontSize: FontSize.Large });
          break;
      }
    });
  }, [isGameStarted, updateSettings]);

  return (
    <div
      ref={appRef}
      tabIndex={-1}
      style={{ outline: 'none', minHeight: '100vh' }}
    >
      {showSettings ? (
        <SettingsScreen onClose={() => setShowSettings(false)} />
      ) : (
        renderScreen()
      )}
    </div>
  );

  function renderScreen(): React.ReactElement {
    // Not started → Title Screen
    if (!isGameStarted || !state) {
      return (
        <TitleScreen
          onStartGame={startGame}
          onLoadGame={loadGame}
          hasSavedGame={hasSavedGame}
          onOpenSettings={() => setShowSettings(true)}
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
        onOpenSettings={() => setShowSettings(true)}
      />
    );
  }
}
