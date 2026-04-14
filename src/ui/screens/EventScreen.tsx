import React, { useState, useEffect } from 'react';
import type { GameState, GameCommand, GameEvent, EventChoice } from '../../engine/types';
import { EventSeverity } from '../../engine/types';
import { COLORS, FONTS, BASE_STYLES } from '../styles';

interface EventScreenProps {
  state: GameState;
  event: GameEvent;
  onCommand: (command: GameCommand) => void;
}

const SEVERITY_COLORS: Record<EventSeverity, string> = {
  [EventSeverity.Minor]: COLORS.text,
  [EventSeverity.Moderate]: COLORS.highlight,
  [EventSeverity.Severe]: COLORS.ill,
  [EventSeverity.Catastrophic]: COLORS.danger,
  [EventSeverity.Positive]: COLORS.info,
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
  const [focusedIdx, setFocusedIdx] = useState<number>(0);

  const choices = event.choices || [];

  // Reset focus when choices change
  useEffect(() => {
    setFocusedIdx(0);
  }, [event.id]);

  // Keyboard navigation for event choices
  useEffect(() => {
    if (choices.length === 0) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Number keys 1-9 → directly select choice
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (idx < choices.length) {
          e.preventDefault();
          onCommand({ type: 'EVENT_CHOICE', eventId: event.id, choiceId: choices[idx].id });
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIdx(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIdx(prev => Math.min(choices.length - 1, prev + 1));
          break;
        case 'Enter':
          if (focusedIdx < choices.length) {
            e.preventDefault();
            onCommand({ type: 'EVENT_CHOICE', eventId: event.id, choiceId: choices[focusedIdx].id });
          }
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [choices, event.id, onCommand, focusedIdx]);

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
        <h1 style={{
          color: severityColor,
          fontFamily: FONTS.display,
          fontSize: '18px',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}>
          ⚠ {event.name}
        </h1>

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
            <div
              role="listbox"
              aria-label="Event response choices"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {event.choices.map((choice, idx) => {
                const isHovered = hoveredIdx === idx;
                const isFocused = focusedIdx === idx;
                return (
                  <button
                    key={choice.id}
                    role="option"
                    aria-selected={isFocused}
                    aria-label={`${idx + 1}. ${choice.text}`}
                    tabIndex={isFocused ? 0 : -1}
                    onClick={() => {
                      onCommand({
                        type: 'EVENT_CHOICE',
                        eventId: event.id,
                        choiceId: choice.id,
                      });
                      (document.activeElement as HTMLElement)?.blur();
                    }}
                    onMouseEnter={() => { setHoveredIdx(idx); setFocusedIdx(idx); }}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      ...BASE_STYLES.button,
                      textAlign: 'left',
                      padding: '10px 16px',
                      borderColor: severityColor,
                      ...((isHovered || isFocused) ? {
                        backgroundColor: COLORS.buttonHover,
                        color: COLORS.text,
                        outline: isFocused ? `1px solid ${COLORS.highlight}` : 'none',
                        outlineOffset: '-1px',
                      } : {}),
                    }}
                  >
                    <span style={{
                      color: (isHovered || isFocused) ? COLORS.highlight : COLORS.highlight,
                      marginRight: '8px',
                    }}>
                      ({idx + 1})
                    </span>
                    {choice.text}
                  </button>
                );
              })}
            </div>
            {/* Keyboard help hint */}
            <div
              aria-hidden="true"
              style={{
                color: COLORS.muted,
                fontSize: '10px',
                textAlign: 'center',
                marginTop: '8px',
                letterSpacing: '0.5px',
              }}
            >
              [1-{event.choices.length}] Select  │  ↑↓ Navigate  │  Enter Confirm
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
