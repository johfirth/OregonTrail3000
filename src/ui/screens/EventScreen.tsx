import React, { useState } from 'react';
import type { GameState, GameCommand, GameEvent, EventChoice } from '../../engine/types';
import { EventSeverity } from '../../engine/types';
import { COLORS, FONTS, BASE_STYLES } from '../styles';

interface EventScreenProps {
  state: GameState;
  event: GameEvent;
  onCommand: (command: GameCommand) => void;
}

const SEVERITY_COLORS: Record<EventSeverity, string> = {
  [EventSeverity.Minor]: COLORS.info,
  [EventSeverity.Moderate]: COLORS.warning,
  [EventSeverity.Severe]: COLORS.accent,
  [EventSeverity.Catastrophic]: COLORS.danger,
  [EventSeverity.Positive]: COLORS.success,
};

const SEVERITY_LABELS: Record<EventSeverity, string> = {
  [EventSeverity.Minor]: '● MINOR',
  [EventSeverity.Moderate]: '●● MODERATE',
  [EventSeverity.Severe]: '●●● SEVERE',
  [EventSeverity.Catastrophic]: '●●●● CATASTROPHIC',
  [EventSeverity.Positive]: '★ POSITIVE',
};

export default function EventScreen({ state, event, onCommand }: EventScreenProps): React.ReactElement {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const severityColor = SEVERITY_COLORS[event.severity] || COLORS.warning;

  return (
    <div style={{
      ...BASE_STYLES.container,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
    }}>
      <div style={{
        maxWidth: '700px',
        width: '100%',
        border: `2px solid ${severityColor}`,
        padding: '24px',
        backgroundColor: COLORS.bgPanel,
      }}>
        {/* Severity Badge */}
        <div style={{
          color: severityColor,
          fontSize: '12px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          {SEVERITY_LABELS[event.severity] || event.severity}
        </div>

        {/* Event Name */}
        <h2 style={{
          color: severityColor,
          fontFamily: FONTS.mono,
          fontSize: '18px',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          ⚠ {event.name}
        </h2>

        {/* Event Description */}
        <p style={{
          color: COLORS.text,
          fontSize: '14px',
          lineHeight: '1.8',
          marginBottom: '24px',
          whiteSpace: 'pre-wrap',
        }}>
          {event.description}
        </p>

        {/* Choices */}
        {event.choices && event.choices.length > 0 && (
          <div>
            <div style={{ color: COLORS.textDim, fontSize: '11px', marginBottom: '8px' }}>
              ─── CHOOSE YOUR RESPONSE ───
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {event.choices.map((choice, idx) => {
                const isHovered = hoveredIdx === idx;
                return (
                  <button
                    key={choice.id}
                    onClick={() => {
                      onCommand({
                        type: 'EVENT_CHOICE',
                        eventId: event.id,
                        choiceId: choice.id,
                      });
                    }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      ...BASE_STYLES.button,
                      textAlign: 'left',
                      padding: '10px 16px',
                      borderColor: severityColor,
                      ...(isHovered ? {
                        backgroundColor: severityColor,
                        color: COLORS.bg,
                      } : {}),
                    }}
                  >
                    <span style={{
                      color: isHovered ? COLORS.bg : COLORS.accent,
                      marginRight: '8px',
                    }}>
                      ({idx + 1})
                    </span>
                    {choice.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
