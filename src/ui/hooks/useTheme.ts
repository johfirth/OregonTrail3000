import type React from 'react';
import { useMemo, useEffect } from 'react';
import { useSettings } from './useSettings';
import { getTheme } from '../themes';
import type { Theme } from '../themes';
import { ThemeMode, FontSize } from '../../engine/types';

const FONT_SIZES: Record<FontSize, string> = {
  [FontSize.Small]: '12px',
  [FontSize.Medium]: '14px',
  [FontSize.Large]: '16px',
};

export interface ThemeStyles {
  COLORS: Theme['colors'];
  FONTS: Theme['fonts'];
  BASE_STYLES: ReturnType<typeof createBaseStyles>;
  isRetro: boolean;
}

function createBaseStyles(theme: Theme, isRetro: boolean, fontSize: FontSize) {
  const COLORS = theme.colors;
  const FONTS = theme.fonts;
  const fs = FONT_SIZES[fontSize];

  if (isRetro) {
    return {
      container: {
        backgroundColor: COLORS.bg,
        color: COLORS.text,
        fontFamily: FONTS.mono,
        minHeight: '100vh',
        fontSize: fs,
        lineHeight: '1.6',
      } as React.CSSProperties,

      panel: {
        backgroundColor: 'transparent',
        border: `1px solid ${COLORS.text}`,
        padding: '8px',
        borderRadius: '0',
        boxShadow: 'none',
        marginBottom: '8px',
        fontSize: fs,
      } as React.CSSProperties,

      button: {
        backgroundColor: 'transparent',
        color: COLORS.info,
        border: 'none',
        padding: '2px 4px',
        fontFamily: FONTS.mono,
        fontSize: fs,
        cursor: 'pointer',
        borderRadius: '0',
        boxShadow: 'none',
        transition: 'none',
        textDecoration: 'none',
        outline: 'none',
      } as React.CSSProperties,

      buttonHover: {
        backgroundColor: 'transparent',
        color: COLORS.highlight,
      } as React.CSSProperties,

      buttonDisabled: {
        backgroundColor: 'transparent',
        color: COLORS.textDim,
        border: 'none',
        padding: '2px 4px',
        fontFamily: FONTS.mono,
        fontSize: fs,
        cursor: 'default',
        borderRadius: '0',
        boxShadow: 'none',
        opacity: 0.5,
      } as React.CSSProperties,

      buttonDanger: {
        backgroundColor: 'transparent',
        color: COLORS.danger,
        border: 'none',
        padding: '2px 4px',
        fontFamily: FONTS.mono,
        fontSize: fs,
        cursor: 'pointer',
        borderRadius: '0',
        boxShadow: 'none',
      } as React.CSSProperties,

      input: {
        backgroundColor: '#000000',
        color: COLORS.text,
        border: `1px solid ${COLORS.text}`,
        padding: '4px 8px',
        fontFamily: FONTS.mono,
        fontSize: fs,
        borderRadius: '0',
        outline: 'none',
        boxShadow: 'none',
      } as React.CSSProperties,

      heading: {
        color: COLORS.text,
        fontFamily: FONTS.mono,
        textTransform: 'uppercase' as const,
        letterSpacing: '0px',
        fontWeight: 'normal',
      },
    };
  }

  return {
    container: {
      minHeight: '100vh',
      backgroundColor: COLORS.bg,
      color: COLORS.text,
      fontFamily: FONTS.mono,
      fontSize: fs,
      lineHeight: '1.6',
    } as React.CSSProperties,

    panel: {
      border: `1px solid ${COLORS.border}`,
      padding: '12px',
      backgroundColor: COLORS.bgPanel,
      marginBottom: '8px',
      borderRadius: '4px',
      fontSize: fs,
    } as React.CSSProperties,

    button: {
      backgroundColor: COLORS.buttonBg,
      color: COLORS.text,
      border: `1px solid ${COLORS.borderLight}`,
      fontFamily: FONTS.mono,
      fontSize: fs,
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
      fontSize: fs,
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
      fontSize: fs,
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
      fontSize: fs,
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
    const isRetro = settings.theme === ThemeMode.Retro80s;
    return {
      COLORS: theme.colors,
      FONTS: theme.fonts,
      BASE_STYLES: createBaseStyles(theme, isRetro, settings.fontSize),
      isRetro,
    };
  }, [settings.theme, settings.fontSize]);

  useEffect(() => {
    document.documentElement.style.setProperty('--bg-color', styles.COLORS.bg);
    document.body.style.backgroundColor = styles.COLORS.bg;
    document.body.style.color = styles.COLORS.text;
  }, [styles.COLORS.bg, styles.COLORS.text]);

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZES[settings.fontSize];
  }, [settings.fontSize]);

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
