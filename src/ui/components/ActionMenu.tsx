import React, { useState } from 'react';
import type { GameAction, GameCommand } from '../../engine/types';
import { COLORS, FONTS, BASE_STYLES } from '../styles';

interface ActionMenuProps {
  actions: GameAction[];
  onAction: (command: GameCommand) => void;
  disabled?: boolean;
}

export default function ActionMenu({ actions, onAction, disabled }: ActionMenuProps): React.ReactElement {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (actions.length === 0) {
    return (
      <div style={{
        padding: '12px',
        fontFamily: FONTS.mono,
        color: COLORS.muted,
        textAlign: 'center',
        borderTop: `1px solid ${COLORS.border}`,
      }}>
        No actions available.
      </div>
    );
  }

  return (
    <div style={{
      padding: '8px 12px',
      fontFamily: FONTS.mono,
      fontSize: '13px',
      borderTop: `1px solid ${COLORS.border}`,
      backgroundColor: COLORS.bgPanel,
    }}>
      <div style={{ color: COLORS.textDim, marginBottom: '6px', fontSize: '11px', letterSpacing: '1px' }}>
        ─── AVAILABLE ACTIONS ───
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {actions.map((action, idx) => {
          const isHovered = hoveredIdx === idx;
          const isEnabled = action.enabled && !disabled;

          return (
            <button
              key={`${action.command}-${idx}`}
              disabled={!isEnabled}
              onClick={() => {
                if (isEnabled) {
                  onAction({ type: action.command } as GameCommand);
                }
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              title={action.disabledReason || action.description}
              style={{
                ...(isEnabled ? BASE_STYLES.button : BASE_STYLES.buttonDisabled),
                textAlign: 'left',
                padding: '6px 12px',
                display: 'flex',
                gap: '8px',
                alignItems: 'baseline',
                ...(isHovered && isEnabled ? {
                  backgroundColor: COLORS.buttonHover,
                  color: COLORS.text,
                } : {}),
              }}
            >
              <span style={{ color: isHovered && isEnabled ? COLORS.highlight : COLORS.highlight, minWidth: '24px' }}>
                ({idx + 1})
              </span>
              <span style={{ flex: 1 }}>
                {action.label}
              </span>
              <span style={{
                fontSize: '11px',
                color: isHovered && isEnabled ? COLORS.textDim : COLORS.muted,
              }}>
                {action.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
