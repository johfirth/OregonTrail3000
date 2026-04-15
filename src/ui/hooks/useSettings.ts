import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DEFAULT_SETTINGS, ThemeMode, TextSpeed, FontSize } from '../../engine/types';
import type { GameSettings } from '../../engine/types';

const SETTINGS_KEY = 'artemis-trail-settings';

function isValidSettings(obj: unknown): obj is Partial<GameSettings> {
  if (typeof obj !== 'object' || obj === null) return false;
  const s = obj as Record<string, unknown>;
  if (s.theme !== undefined && !Object.values(ThemeMode).includes(s.theme as ThemeMode)) return false;
  if (s.textSpeed !== undefined && !Object.values(TextSpeed).includes(s.textSpeed as TextSpeed)) return false;
  if (s.fontSize !== undefined && !Object.values(FontSize).includes(s.fontSize as FontSize)) return false;
  if (s.soundEnabled !== undefined && typeof s.soundEnabled !== 'boolean') return false;
  if (s.autoSave !== undefined && typeof s.autoSave !== 'boolean') return false;
  if (s.showKeyboardHints !== undefined && typeof s.showKeyboardHints !== 'boolean') return false;
  if (s.showCrewPanel !== undefined && typeof s.showCrewPanel !== 'boolean') return false;
  if (s.narrativeLogLines !== undefined && typeof s.narrativeLogLines !== 'number') return false;
  return true;
}

interface SettingsContextValue {
  settings: GameSettings;
  updateSettings: (partial: Partial<GameSettings>) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  resetSettings: () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isValidSettings(parsed)) {
          return { ...DEFAULT_SETTINGS, ...parsed };
        }
      }
    } catch { /* ignore corrupted settings */ }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch { /* storage full or unavailable */ }
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return React.createElement(
    SettingsContext.Provider,
    { value: { settings, updateSettings, resetSettings } },
    children,
  );
}
