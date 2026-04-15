import React from 'react';
import { useSettings } from './useSettings';
import { ThemeMode } from '../../engine/types';

// Fluent icon imports — only used in NASA mode
import {
  RocketRegular,
  SettingsRegular,
  SaveRegular,
  WarningRegular,
  HeartRegular,
  PersonRegular,
  CheckmarkRegular,
  DismissRegular,
  PlayRegular,
  DocumentRegular,
  StarRegular,
  StarFilled,
  FoodAppleRegular,
  WrenchRegular,
  ShieldCheckmarkRegular,
  AddCircleRegular,
  MoneyRegular,
  GaugeRegular,
  PeopleRegular,
} from '@fluentui/react-icons';

export function useIcons() {
  const { settings } = useSettings();
  const isRetro = settings.theme === ThemeMode.Retro80s;

  return {
    rocket: isRetro ? '>' : React.createElement(RocketRegular, { fontSize: 16 }),
    settings: isRetro ? '[SETTINGS]' : React.createElement(SettingsRegular, { fontSize: 16 }),
    save: isRetro ? '[SAVE]' : React.createElement(SaveRegular, { fontSize: 16 }),
    warning: isRetro ? '[!]' : React.createElement(WarningRegular, { fontSize: 16 }),
    launch: isRetro ? '>>>' : React.createElement(RocketRegular, { fontSize: 18 }),
    star: (filled: boolean) => isRetro ? (filled ? '*' : '.') : React.createElement(filled ? StarFilled : StarRegular, { fontSize: 14 }),
    crew: isRetro ? '[O]' : React.createElement(PersonRegular, { fontSize: 14 }),
    dead: isRetro ? '[X]' : React.createElement(DismissRegular, { fontSize: 14 }),
    health: isRetro ? '[+]' : React.createElement(HeartRegular, { fontSize: 14 }),
    play: isRetro ? '[PLAY]' : React.createElement(PlayRegular, { fontSize: 16 }),
    doc: isRetro ? '[DOC]' : React.createElement(DocumentRegular, { fontSize: 16 }),
    // Resource icons for StatusBar
    fuel: isRetro ? '' : React.createElement(RocketRegular, { fontSize: 13 }),
    food: isRetro ? '' : React.createElement(FoodAppleRegular, { fontSize: 13 }),
    parts: isRetro ? '' : React.createElement(WrenchRegular, { fontSize: 13 }),
    shield: isRetro ? '' : React.createElement(ShieldCheckmarkRegular, { fontSize: 13 }),
    medical: isRetro ? '' : React.createElement(AddCircleRegular, { fontSize: 13 }),
    budget: isRetro ? '' : React.createElement(MoneyRegular, { fontSize: 13 }),
    morale: isRetro ? '' : React.createElement(GaugeRegular, { fontSize: 13 }),
    crewGroup: isRetro ? '' : React.createElement(PeopleRegular, { fontSize: 13 }),
  };
}
