import { ThemeMode } from '../../engine/types';
import { NASA_THEME } from './nasa';
import { RETRO_THEME } from './retro';

export type Theme = typeof NASA_THEME;

export function getTheme(mode: ThemeMode): Theme {
  switch (mode) {
    case ThemeMode.Retro80s:
      return RETRO_THEME;
    case ThemeMode.NASA:
    default:
      return NASA_THEME;
  }
}

export { NASA_THEME, RETRO_THEME };
