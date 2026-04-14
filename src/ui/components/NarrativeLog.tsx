import React, { useEffect, useRef } from 'react';
import type { NarrativeEntry } from '../../engine/types';
import { COLORS, FONTS, getNarrativeColor } from '../styles';

interface NarrativeLogProps {
  entries: NarrativeEntry[];
}

export default function NarrativeLog({ entries }: NarrativeLogProps): React.ReactElement {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      {entries.map((entry) => (
        <div
          key={entry.id}
          style={{
            color: getNarrativeColor(entry.type),
            fontWeight: entry.type === 'DEATH' ? 'bold' : 'normal',
            marginBottom: '6px',
            paddingLeft: '16px',
            textIndent: '-16px',
            borderLeft: (entry.type === 'WARNING' || entry.type === 'DEATH')
              ? `2px solid ${getNarrativeColor(entry.type)}`
              : undefined,
          }}
        >
          <span style={{ color: COLORS.textDim, fontSize: '11px', marginRight: '8px' }}>
            [{entry.type.slice(0, 3)}]
          </span>
          {entry.text}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
