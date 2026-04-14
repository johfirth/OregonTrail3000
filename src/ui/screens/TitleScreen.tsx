import React, { useState, useCallback } from 'react';
import type { GameConfig } from '../../engine/types';
import { Difficulty } from '../../engine/types';
import { COLORS, FONTS, BASE_STYLES } from '../styles';
import { NARRATIVE } from '../../content/narrative';

interface TitleScreenProps {
  onStartGame: (config: GameConfig) => void;
  onLoadGame: () => boolean;
  hasSavedGame: () => boolean;
}

const ASCII_TITLE = `
 ╦  ╦ ╦╔╗╔╔═╗╦═╗  ╔═╗╔═╗╦  ╔═╗╔╗╔╦ ╦
 ║  ║ ║║║║╠═╣╠╦╝  ║  ║ ║║  ║ ║║║║╚╦╝
 ╩═╝╚═╝╝╚╝╩ ╩╩╚═  ╚═╝╚═╝╩═╝╚═╝╝╚╝ ╩ 
        ╔═══════════════════╗
        ║    3   0   0   0  ║
        ╚═══════════════════╝`;

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, { label: string; budget: number; description: string }> = {
  [Difficulty.Cadet]: {
    label: 'CADET',
    budget: 1000,
    description: 'Generous budget, reduced hazards. Learn the ropes.',
  },
  [Difficulty.Astronaut]: {
    label: 'ASTRONAUT',
    budget: 800,
    description: 'Standard challenge. The way it was meant to be played.',
  },
  [Difficulty.Commander]: {
    label: 'COMMANDER',
    budget: 600,
    description: 'Tight budget, increased hazards. For veterans.',
  },
  [Difficulty.Ironman]: {
    label: 'IRONMAN',
    budget: 600,
    description: 'Commander difficulty + no saves. One shot.',
  },
};

export default function TitleScreen({ onStartGame, onLoadGame, hasSavedGame }: TitleScreenProps): React.ReactElement {
  const [commanderName, setCommanderName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Astronaut);
  const [showIntro, setShowIntro] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const handleStart = useCallback(() => {
    if (!commanderName.trim()) return;
    onStartGame({
      difficulty,
      commanderName: commanderName.trim(),
    });
  }, [commanderName, difficulty, onStartGame]);

  if (showIntro) {
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
          whiteSpace: 'pre-wrap',
          lineHeight: '1.8',
          fontSize: '14px',
          color: COLORS.text,
          marginBottom: '32px',
        }}>
          {NARRATIVE.openingNarration}
        </div>
        <button
          onClick={() => setShowIntro(false)}
          onMouseEnter={() => setHoveredBtn('back')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            ...BASE_STYLES.button,
            ...(hoveredBtn === 'back' ? BASE_STYLES.buttonHover : {}),
          }}
        >
          ← Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div style={{
      ...BASE_STYLES.container,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
    }}>
      {/* ASCII Title */}
      <pre style={{
        color: COLORS.text,
        fontSize: '16px',
        lineHeight: '1.2',
        textAlign: 'center',
        marginBottom: '8px',
        textShadow: `0 0 10px ${COLORS.text}`,
      }}>
        {ASCII_TITLE}
      </pre>

      <p style={{
        color: COLORS.info,
        fontSize: '14px',
        marginBottom: '32px',
        letterSpacing: '3px',
        textTransform: 'uppercase',
      }}>
        An Oregon Trail Adventure... IN SPACE
      </p>

      {/* Commander Name */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <label style={{ color: COLORS.textDim, display: 'block', marginBottom: '8px', fontSize: '12px' }}>
          ENTER COMMANDER NAME:
        </label>
        <input
          type="text"
          value={commanderName}
          onChange={(e) => setCommanderName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleStart(); }}
          placeholder="Commander..."
          maxLength={30}
          style={{
            ...BASE_STYLES.input,
            width: '300px',
            textAlign: 'center',
            fontSize: '16px',
          }}
        />
      </div>

      {/* Difficulty Selection */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <label style={{ color: COLORS.textDim, display: 'block', marginBottom: '12px', fontSize: '12px' }}>
          SELECT DIFFICULTY:
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(DIFFICULTY_DESCRIPTIONS).map(([key, info]) => {
            const diff = key as Difficulty;
            const isSelected = difficulty === diff;
            const isHovered = hoveredBtn === diff;
            return (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                onMouseEnter={() => setHoveredBtn(diff)}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...BASE_STYLES.button,
                  backgroundColor: isSelected ? COLORS.text : 'transparent',
                  color: isSelected ? COLORS.bg : COLORS.text,
                  borderColor: isSelected ? COLORS.text : COLORS.border,
                  minWidth: '120px',
                  ...(isHovered && !isSelected ? { borderColor: COLORS.text } : {}),
                }}
              >
                <div>{info.label}</div>
                <div style={{
                  fontSize: '10px',
                  color: isSelected ? COLORS.bg : COLORS.muted,
                  marginTop: '2px',
                }}>
                  {info.budget} CR
                </div>
              </button>
            );
          })}
        </div>
        <p style={{
          color: COLORS.muted,
          fontSize: '11px',
          marginTop: '8px',
          maxWidth: '400px',
        }}>
          {DIFFICULTY_DESCRIPTIONS[difficulty].description}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', alignItems: 'center' }}>
        <button
          onClick={handleStart}
          disabled={!commanderName.trim()}
          onMouseEnter={() => setHoveredBtn('start')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            ...(commanderName.trim() ? BASE_STYLES.button : BASE_STYLES.buttonDisabled),
            fontSize: '16px',
            padding: '12px 32px',
            letterSpacing: '2px',
            ...(hoveredBtn === 'start' && commanderName.trim() ? BASE_STYLES.buttonHover : {}),
          }}
        >
          🚀 NEW MISSION
        </button>

        {hasSavedGame() && (
          <button
            onClick={onLoadGame}
            onMouseEnter={() => setHoveredBtn('load')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...BASE_STYLES.button,
              ...(hoveredBtn === 'load' ? BASE_STYLES.buttonHover : {}),
            }}
          >
            📂 LOAD SAVED GAME
          </button>
        )}

        <button
          onClick={() => setShowIntro(true)}
          onMouseEnter={() => setHoveredBtn('intro')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            ...BASE_STYLES.button,
            fontSize: '12px',
            ...(hoveredBtn === 'intro' ? BASE_STYLES.buttonHover : {}),
          }}
        >
          📖 MISSION BRIEFING
        </button>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        color: COLORS.muted,
        fontSize: '10px',
        textAlign: 'center',
      }}>
        Lunar Colony 3000 © 2028 NASA (not really) • v1.0
      </div>
    </div>
  );
}
