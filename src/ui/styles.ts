// Shared style constants for retro space terminal aesthetic

export const COLORS = {
  bg: '#0a0a0a',
  bgLight: '#111111',
  bgPanel: '#0d0d0d',
  border: '#003300',
  borderLight: '#004400',
  text: '#00ff41',
  textDim: '#006615',
  warning: '#ffaa00',
  danger: '#ff3333',
  info: '#33ccff',
  success: '#00ff41',
  muted: '#666666',
  accent: '#ff6600',
  highlight: '#00cc33',
  dead: '#444444',
} as const;

export const FONTS = {
  mono: "'Courier New', Courier, monospace",
} as const;

export const BASE_STYLES = {
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
  } as React.CSSProperties,

  button: {
    backgroundColor: 'transparent',
    color: COLORS.text,
    border: `1px solid ${COLORS.text}`,
    fontFamily: FONTS.mono,
    fontSize: '14px',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  } as React.CSSProperties,

  buttonDisabled: {
    backgroundColor: 'transparent',
    color: COLORS.muted,
    border: `1px solid ${COLORS.muted}`,
    fontFamily: FONTS.mono,
    fontSize: '14px',
    padding: '8px 16px',
    cursor: 'not-allowed',
    opacity: 0.5,
  } as React.CSSProperties,

  buttonHover: {
    backgroundColor: COLORS.text,
    color: COLORS.bg,
  } as React.CSSProperties,

  input: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    fontFamily: FONTS.mono,
    fontSize: '14px',
    padding: '8px 12px',
    outline: 'none',
  } as React.CSSProperties,

  heading: {
    color: COLORS.text,
    fontFamily: FONTS.mono,
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
  },
} as const;

import type React from 'react';

export function getHealthColor(healthPercent: number): string {
  if (healthPercent > 50) return COLORS.success;
  if (healthPercent > 20) return COLORS.warning;
  return COLORS.danger;
}

export function getResourceColor(current: number, max: number): string {
  if (max === 0) return COLORS.muted;
  const pct = current / max;
  if (pct > 0.5) return COLORS.success;
  if (pct > 0.2) return COLORS.warning;
  return COLORS.danger;
}

export function getNarrativeColor(type: string): string {
  switch (type) {
    case 'STORY': return COLORS.text;
    case 'EVENT': return COLORS.warning;
    case 'STATUS': return COLORS.info;
    case 'WARNING': return COLORS.warning;
    case 'DEATH': return COLORS.danger;
    case 'VICTORY': return COLORS.info;
    case 'SYSTEM': return COLORS.muted;
    default: return COLORS.text;
  }
}
