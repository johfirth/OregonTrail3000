import React, { useState, useEffect } from 'react';
import type { GameState, GameCommand, LandingSite } from '../../engine/types';
import { LANDING_SITES } from '../../engine/types';
import { useTheme } from '../hooks/useTheme';

interface LandingSiteScreenProps {
  state: GameState;
  onCommand: (command: GameCommand) => void;
}

function StarRating({ value, max = 5 }: { value: number; max?: number }): React.ReactElement {
  const stars = '★'.repeat(value) + '☆'.repeat(max - value);
  return <span>{stars}</span>;
}

export default function LandingSiteScreen({ state, onCommand }: LandingSiteScreenProps): React.ReactElement {
  const { COLORS, FONTS, BASE_STYLES } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [focusedIdx, setFocusedIdx] = useState<number>(0);

  const handleSelect = () => {
    if (selectedId) {
      onCommand({ type: 'SELECT_LANDING_SITE', siteId: selectedId });
    }
  };

  // Keyboard navigation for landing sites
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Number keys 1-9 → select site
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (idx < LANDING_SITES.length) {
          e.preventDefault();
          setSelectedId(LANDING_SITES[idx].id);
          setFocusedIdx(idx);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIdx(prev => {
            const next = Math.max(0, prev - 1);
            setSelectedId(LANDING_SITES[next].id);
            return next;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIdx(prev => {
            const next = Math.min(LANDING_SITES.length - 1, prev + 1);
            setSelectedId(LANDING_SITES[next].id);
            return next;
          });
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedId) {
            onCommand({ type: 'SELECT_LANDING_SITE', siteId: selectedId });
          }
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, onCommand, focusedIdx]);

  return (
    <div style={{
      ...BASE_STYLES.container,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      maxWidth: '1000px',
      margin: '0 auto',
    }}>
      <h1 style={{
        ...BASE_STYLES.heading,
        textAlign: 'center',
        marginBottom: '4px',
        fontSize: '18px',
      }}>
        ═══ SELECT LANDING SITE ═══
      </h1>
      <p style={{ color: COLORS.muted, textAlign: 'center', marginBottom: '20px', fontSize: '12px' }}>
        Choose your landing site carefully. Each location has different advantages and risks.
      </p>

      <div
        role="listbox"
        aria-label="Landing site options"
        style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}
      >
        {LANDING_SITES.map((site, idx) => {
          const isSelected = selectedId === site.id;
          const isHovered = hoveredId === site.id;
          const isFocused = focusedIdx === idx;

          return (
            <div
              key={site.id}
              role="option"
              aria-selected={isSelected}
              aria-label={`${idx + 1}. ${site.name}: ${site.description}`}
              tabIndex={isFocused ? 0 : -1}
              onClick={() => { setSelectedId(site.id); setFocusedIdx(idx); (document.activeElement as HTMLElement)?.blur(); }}
              onMouseEnter={() => { setHoveredId(site.id); setFocusedIdx(idx); }}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                ...BASE_STYLES.panel,
                cursor: 'pointer',
                border: isSelected
                  ? `2px solid ${COLORS.accent}`
                  : (isHovered || isFocused)
                    ? `1px solid ${COLORS.info}`
                    : `1px solid ${COLORS.border}`,
                padding: isSelected ? '11px' : '12px',
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: '16px',
                outline: isFocused && !isSelected ? `1px solid ${COLORS.highlight}` : 'none',
                outlineOffset: '-1px',
              }}
            >
              <div>
                <div style={{
                  color: isSelected ? COLORS.text : COLORS.info,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}>
                  <span style={{ color: COLORS.highlight, marginRight: '6px' }}>({idx + 1})</span>
                  {isSelected && '▶ '}{site.name}
                </div>
                <div style={{ fontSize: '11px', color: COLORS.muted, lineHeight: '1.5' }}>
                  {site.description}
                </div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px',
                fontSize: '12px',
              }}>
                <div>
                  <span style={{ color: COLORS.textDim }}>Sunlight: </span>
                  <span style={{ color: COLORS.highlight }}>
                    <StarRating value={site.sunlight} />
                  </span>
                </div>
                <div>
                  <span style={{ color: COLORS.textDim }}>Ice Access: </span>
                  <span style={{ color: COLORS.highlight }}>
                    <StarRating value={site.iceAccess} />
                  </span>
                </div>
                <div>
                  <span style={{ color: COLORS.textDim }}>Terrain: </span>
                  <span style={{ color: COLORS.highlight }}>
                    <StarRating value={site.terrainDifficulty} />
                  </span>
                  <span style={{ color: COLORS.muted, fontSize: '10px' }}> (lower=safer)</span>
                </div>
                <div>
                  <span style={{ color: COLORS.textDim }}>Comms: </span>
                  <span style={{ color: COLORS.highlight }}>
                    <StarRating value={site.communications} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => { handleSelect(); (document.activeElement as HTMLElement)?.blur(); }}
          disabled={!selectedId}
          aria-label="Confirm landing site selection"
          onMouseEnter={() => setHoveredBtn('select')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            ...(selectedId ? BASE_STYLES.button : BASE_STYLES.buttonDisabled),
            fontSize: '16px',
            padding: '12px 32px',
            letterSpacing: '2px',
            ...(hoveredBtn === 'select' && selectedId ? BASE_STYLES.buttonHover : {}),
          }}
        >
          🌑 CONFIRM LANDING SITE
        </button>
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
          [1-{LANDING_SITES.length}] Select Site  │  ↑↓ Navigate  │  Enter Confirm
        </div>
      </div>
    </div>
  );
}
