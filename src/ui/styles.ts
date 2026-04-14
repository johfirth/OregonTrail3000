// Shared style constants — NASA Mission Control aesthetic

export const COLORS = {
  // NASA core palette
  bg: '#061A40',           // Deep space navy
  bgPanel: '#0B3D91',     // NASA blue panels
  bgDark: '#040E24',      // Darkest background
  text: '#FFFFFF',         // White primary text
  textDim: '#D1D5DB',     // Light gray secondary (WCAG AA on bgPanel)
  muted: '#9CA3AF',        // Muted gray (WCAG AA on bg)

  // Accent colors
  accent: '#FC3D21',       // NASA red
  success: '#00E676',      // Green for healthy/good
  warning: '#FDB813',      // NASA gold/amber
  danger: '#FC3D21',       // NASA red for danger
  info: '#00B4D8',         // Teal/cyan for data

  // Status colors
  healthy: '#00E676',
  stressed: '#FDB813',
  ill: '#FF6B35',
  critical: '#FC3D21',
  dead: '#6B7280',

  // UI elements
  border: '#1E3A5F',       // Subtle blue border
  borderLight: '#2D5A8E',  // Lighter border
  buttonBg: '#0B3D91',    // NASA blue buttons
  buttonHover: '#1352B0',  // Lighter blue hover
  highlight: '#FDB813',    // Gold highlight
} as const;

export const FONTS = {
  mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Courier New', Courier, monospace",
  display: "'Orbitron', 'Rajdhani', 'Courier New', monospace",
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
} as const;

import type React from 'react';

export function getHealthColor(healthPercent: number): string {
  if (healthPercent > 50) return COLORS.healthy;
  if (healthPercent > 20) return COLORS.warning;
  return COLORS.critical;
}

export function getResourceColor(current: number, max: number): string {
  if (max === 0) return COLORS.muted;
  const pct = current / max;
  if (pct > 0.5) return COLORS.info;
  if (pct > 0.2) return COLORS.warning;
  return COLORS.danger;
}

export function getNarrativeColor(type: string): string {
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
