import React, { useState } from 'react';
import type { GameState, GameCommand, LandingSite } from '../../engine/types';
import { LANDING_SITES } from '../../engine/types';
import { COLORS, FONTS, BASE_STYLES } from '../styles';

interface LandingSiteScreenProps {
  state: GameState;
  onCommand: (command: GameCommand) => void;
}

function StarRating({ value, max = 5 }: { value: number; max?: number }): React.ReactElement {
  const stars = '★'.repeat(value) + '☆'.repeat(max - value);
  return <span>{stars}</span>;
}

export default function LandingSiteScreen({ state, onCommand }: LandingSiteScreenProps): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const handleSelect = () => {
    if (selectedId) {
      onCommand({ type: 'SELECT_LANDING_SITE', siteId: selectedId });
    }
  };

  return (
    <div style={{
      ...BASE_STYLES.container,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      maxWidth: '1000px',
      margin: '0 auto',
    }}>
      <h2 style={{
        ...BASE_STYLES.heading,
        textAlign: 'center',
        marginBottom: '4px',
        fontSize: '18px',
      }}>
        ═══ SELECT LANDING SITE ═══
      </h2>
      <p style={{ color: COLORS.muted, textAlign: 'center', marginBottom: '20px', fontSize: '12px' }}>
        Choose your landing site carefully. Each location has different advantages and risks.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {LANDING_SITES.map((site) => {
          const isSelected = selectedId === site.id;
          const isHovered = hoveredId === site.id;

          return (
            <div
              key={site.id}
              onClick={() => setSelectedId(site.id)}
              onMouseEnter={() => setHoveredId(site.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                ...BASE_STYLES.panel,
                cursor: 'pointer',
                border: isSelected
                  ? `2px solid ${COLORS.accent}`
                  : isHovered
                    ? `1px solid ${COLORS.info}`
                    : `1px solid ${COLORS.border}`,
                padding: isSelected ? '11px' : '12px',
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: '16px',
              }}
            >
              <div>
                <div style={{
                  color: isSelected ? COLORS.text : COLORS.info,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}>
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
          onClick={handleSelect}
          disabled={!selectedId}
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
      </div>
    </div>
  );
}
