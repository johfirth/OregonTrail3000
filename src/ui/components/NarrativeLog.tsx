import React, { useEffect, useRef, useState } from 'react';
import type { NarrativeEntry } from '../../engine/types';
import { TextSpeed } from '../../engine/types';
import { useTheme, getNarrativeColor } from '../hooks/useTheme';
import { useSettings } from '../hooks/useSettings';

interface NarrativeLogProps {
  entries: NarrativeEntry[];
}

const TEXT_SPEED_MS: Record<TextSpeed, number> = {
  [TextSpeed.Instant]: 0,
  [TextSpeed.Fast]: 10,
  [TextSpeed.Normal]: 30,
  [TextSpeed.Slow]: 60,
};

function TypewriterText({ text, speed, color, fontWeight }: {
  text: string;
  speed: TextSpeed;
  color: string;
  fontWeight: string;
}) {
  const [displayedLen, setDisplayedLen] = useState(speed === TextSpeed.Instant ? text.length : 0);
  const delayMs = TEXT_SPEED_MS[speed];

  useEffect(() => {
    if (delayMs === 0 || displayedLen >= text.length) return;
    const timer = setTimeout(() => setDisplayedLen(prev => prev + 1), delayMs);
    return () => clearTimeout(timer);
  }, [displayedLen, text.length, delayMs]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedLen(speed === TextSpeed.Instant ? text.length : 0);
  }, [text, speed]);

  return (
    <span style={{ color, fontWeight }}>
      {text.slice(0, displayedLen)}
      {displayedLen < text.length && <span style={{ opacity: 0.5 }}>▌</span>}
    </span>
  );
}

export default function NarrativeLog({ entries }: NarrativeLogProps): React.ReactElement {
  const { COLORS, FONTS } = useTheme();
  const { settings } = useSettings();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [lastAnimatedId, setLastAnimatedId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (entries.length > 0) {
      setLastAnimatedId(entries[entries.length - 1].id);
    }
  }, [entries.length]);

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Mission narrative log"
      style={{
      flex: 1,
      overflow: 'auto',
      padding: '12px',
      fontFamily: FONTS.mono,
      fontSize: '13px',
      lineHeight: '1.7',
      backgroundColor: COLORS.bgDark,
      borderBottom: `1px solid ${COLORS.border}`,
    }}>
      {entries.length === 0 && (
        <div style={{ color: COLORS.muted, fontStyle: 'italic' }}>
          &gt; Awaiting mission data...
        </div>
      )}
      {entries.map((entry) => {
        const isLatest = entry.id === lastAnimatedId;
        const entryColor = getNarrativeColor(entry.type, COLORS);
        return (
          <div
            key={entry.id}
            style={{
              marginBottom: '6px',
              paddingLeft: '16px',
              textIndent: '-16px',
              borderLeft: (entry.type === 'WARNING' || entry.type === 'DEATH')
                ? `2px solid ${entryColor}`
                : undefined,
            }}
          >
            <span style={{ color: COLORS.textDim, fontSize: '11px', marginRight: '8px' }}>
              [{entry.type.slice(0, 3)}]
            </span>
            {isLatest && settings.textSpeed !== TextSpeed.Instant ? (
              <TypewriterText
                text={entry.text}
                speed={settings.textSpeed}
                color={entryColor}
                fontWeight={entry.type === 'DEATH' ? 'bold' : 'normal'}
              />
            ) : (
              <span style={{
                color: entryColor,
                fontWeight: entry.type === 'DEATH' ? 'bold' : 'normal',
              }}>
                {entry.text}
              </span>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
