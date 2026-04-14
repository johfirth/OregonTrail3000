import type React from 'react';
import { useMemo, useEffect } from 'react';
import { useSettings } from './useSettings';
import { getTheme } from '../themes';
import type { Theme } from '../themes';

export interface ThemeStyles {
  COLORS: Theme['colors'];
  FONTS: Theme['fonts'];
  BASE_STYLES: ReturnType<typeof createBaseStyles>;
}

function createBaseStyles(theme: Theme) {
  const COLORS = theme.colors;
  const FONTS = theme.fonts;

  return {
    container: {
      minHeight: '100vh',
      backgroundColor: COLORS.bg,
      color: COLORS.text,
      fontFamily: FONTS.mono,
      fontSize: '14px',
      lineHeight: '1.6',
    } as React.CSSProperties,

    panel: {
      border: `1px solid ${COLORS.border}`,
      padding: '12px',
      backgroundColor: COLORS.bgPanel,
      marginBottom: '8px',
      borderRadius: '4px',
    } as React.CSSProperties,

    button: {
      backgroundColor: COLORS.buttonBg,
      color: COLORS.text,
      border: `1px solid ${COLORS.borderLight}`,
      fontFamily: FONTS.mono,
      fontSize: '14px',
      padding: '8px 16px',
      cursor: 'pointer',
      transition: 'all 0.15s',
      borderRadius: '4px',
    } as React.CSSProperties,

    buttonDisabled: {
      backgroundColor: COLORS.bgDark,
      color: '#8B95A5',
      border: `1px solid ${COLORS.border}`,
      fontFamily: FONTS.mono,
      fontSize: '14px',
      padding: '8px 16px',
      cursor: 'not-allowed',
      opacity: 0.5,
      borderRadius: '4px',
    } as React.CSSProperties,

    buttonHover: {
      backgroundColor: COLORS.buttonHover,
      color: COLORS.text,
    } as React.CSSProperties,

    buttonDanger: {
      backgroundColor: COLORS.accent,
      color: COLORS.text,
      border: `1px solid ${COLORS.accent}`,
      fontFamily: FONTS.mono,
      fontSize: '14px',
      padding: '8px 16px',
      cursor: 'pointer',
      transition: 'all 0.15s',
      borderRadius: '4px',
    } as React.CSSProperties,

    input: {
      backgroundColor: COLORS.bgDark,
      color: COLORS.text,
      border: `1px solid ${COLORS.border}`,
      fontFamily: FONTS.mono,
      fontSize: '14px',
      padding: '8px 12px',
      outline: 'none',
      borderRadius: '4px',
    } as React.CSSProperties,

    heading: {
      color: COLORS.text,
      fontFamily: FONTS.display,
      textTransform: 'uppercase' as const,
      letterSpacing: '3px',
    },
  };
}

export function useTheme(): ThemeStyles {
  const { settings } = useSettings();

  const styles = useMemo(() => {
    const theme = getTheme(settings.theme);
    return {
      COLORS: theme.colors,
      FONTS: theme.fonts,
      BASE_STYLES: createBaseStyles(theme),
    };
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--bg-color', styles.COLORS.bg);
    document.body.style.backgroundColor = styles.COLORS.bg;
    document.body.style.color = styles.COLORS.text;
  }, [styles.COLORS.bg, styles.COLORS.text]);

  return styles;
}

export function getHealthColor(healthPercent: number, COLORS: Theme['colors']): string {
  if (healthPercent > 50) return COLORS.healthy;
  if (healthPercent > 20) return COLORS.warning;
  return COLORS.critical;
}

export function getResourceColor(current: number, max: number, COLORS: Theme['colors']): string {
  if (max === 0) return COLORS.muted;
  const pct = current / max;
  if (pct > 0.5) return COLORS.info;
  if (pct > 0.2) return COLORS.warning;
  return COLORS.danger;
}

export function getNarrativeColor(type: string, COLORS: Theme['colors']): string {
  switch (type) {
    case 'STORY': return COLORS.text;
    case 'EVENT': return COLORS.highlight;
    case 'STATUS': return COLORS.info;
    case 'WARNING': return COLORS.accent;
    case 'DEATH': return COLORS.danger;
    case 'VICTORY': return COLORS.info;
    case 'SYSTEM': return COLORS.muted;
    default: return COLORS.text;
  }
}
