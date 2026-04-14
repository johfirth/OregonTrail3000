import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DEFAULT_SETTINGS } from '../../engine/types';
import type { GameSettings } from '../../engine/types';

const SETTINGS_KEY = 'artemis-trail-settings';

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
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
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
