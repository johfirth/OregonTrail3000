import React, { useState, useCallback, useEffect } from 'react';
import type { GameConfig } from '../../engine/types';
import { Difficulty } from '../../engine/types';
import { useTheme } from '../hooks/useTheme';
import { useIcons } from '../hooks/useIcons';
import { NARRATIVE } from '../../content/narrative';
import { ASCII_ART } from '../ascii-art';

interface TitleScreenProps {
  onStartGame: (config: GameConfig) => void;
  onLoadGame: () => boolean;
  hasSavedGame: () => boolean;
  onOpenSettings: () => void;
}

const ASCII_TITLE_RETRO = `
 +---------------------------------------+
 |    *  A R T E M I S   T R A I L  *    |
 |         .  .  .  *   .  .  .          |
 |     E A R T H  ->  ->  ->  M O O N   |
 +---------------------------------------+`;

const ASCII_TITLE_MODERN = `
 ╔═══════════════════════════════════════╗
 ║    ★  A R T E M I S   T R A I L  ★   ║
 ║         ·  ·  ·  🌙  ·  ·  ·         ║
 ║     E A R T H  →  →  →  M O O N      ║
 ╚═══════════════════════════════════════╝`;

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

export default function TitleScreen({ onStartGame, onLoadGame, hasSavedGame, onOpenSettings }: TitleScreenProps): React.ReactElement {
  const { COLORS, FONTS, BASE_STYLES, isRetro } = useTheme();
  const icons = useIcons();
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

  // Keyboard shortcut: Escape from intro goes back
  useEffect(() => {
    if (!showIntro) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        setShowIntro(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showIntro]);

  if (showIntro) {
    return (
      <div style={{
        ...BASE_STYLES.container,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: isRetro ? COLORS.bg : `linear-gradient(180deg, ${COLORS.bgDark} 0%, ${COLORS.bg} 100%)`,
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
      background: isRetro ? COLORS.bg : `linear-gradient(180deg, ${COLORS.bgDark} 0%, ${COLORS.bg} 50%, ${COLORS.bgPanel} 100%)`,
    }}>
      {/* Mission Patch Border */}
      <div style={{
        border: isRetro ? `1px solid ${COLORS.text}` : `2px solid ${COLORS.borderLight}`,
        borderRadius: isRetro ? '0' : '12px',
        padding: isRetro ? '16px 24px' : '32px 48px',
        boxShadow: isRetro ? 'none' : `0 0 30px ${COLORS.bgPanel}66, inset 0 0 30px ${COLORS.bgPanel}1A`,
        textAlign: 'center',
      }}>
        {/* ASCII Title */}
        {isRetro ? (
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: '13px',
            lineHeight: '1.2',
            textAlign: 'left',
            marginBottom: '8px',
            whiteSpace: 'pre',
            color: COLORS.text,
          }}>
{`        _.._
      .' .-'        ╔═══════════════════════════╗
     /  /           ║     ARTEMIS  TRAIL        ║
    |  |            ╚═══════════════════════════╝
    |  |  _.._
     \\  \\.' .-'     The Oregon Trail... TO THE MOON
      '.._ /
          '`}
          </div>
        ) : (
        <h1 style={{
          color: COLORS.text,
          fontSize: '16px',
          lineHeight: '1.2',
          textAlign: 'center',
          marginBottom: '8px',
          textShadow: `0 0 15px ${COLORS.info}80`,
          fontFamily: FONTS.mono,
          fontWeight: 'normal',
          whiteSpace: 'pre',
        }}>
          {ASCII_TITLE_MODERN}
        </h1>
        )}

        <p style={{
          color: COLORS.info,
          fontSize: '14px',
          marginBottom: '32px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          fontFamily: FONTS.display,
        }}>
          {isRetro ? '>' : icons.rocket} The Oregon Trail... TO THE MOON {isRetro ? '*' : '🌙'}
        </p>

        {/* Commander Name */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <label style={{ color: COLORS.textDim, display: 'block', marginBottom: '8px', fontSize: '12px', letterSpacing: '2px' }}>
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
              borderColor: COLORS.borderLight,
            }}
          />
        </div>

        {/* Difficulty Selection */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <label style={{ color: COLORS.textDim, display: 'block', marginBottom: '12px', fontSize: '12px', letterSpacing: '2px' }}>
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
                  onClick={() => { setDifficulty(diff); (document.activeElement as HTMLElement)?.blur(); }}
                  onMouseEnter={() => setHoveredBtn(diff)}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...BASE_STYLES.button,
                    backgroundColor: isSelected ? COLORS.highlight : COLORS.buttonBg,
                    color: isSelected ? COLORS.bgDark : COLORS.text,
                    borderColor: isSelected ? COLORS.highlight : COLORS.border,
                    minWidth: '120px',
                    ...(isHovered && !isSelected ? { borderColor: COLORS.info, backgroundColor: COLORS.buttonHover } : {}),
                  }}
                >
                  <div>{info.label}</div>
                  <div style={{
                    fontSize: '10px',
                    color: isSelected ? COLORS.bgDark : COLORS.textDim,
                    marginTop: '2px',
                  }}>
                    {info.budget} CR
                  </div>
                </button>
              );
            })}
          </div>
          <p style={{
            color: COLORS.textDim,
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
              ...(commanderName.trim() ? BASE_STYLES.buttonDanger : BASE_STYLES.buttonDisabled),
              fontSize: '16px',
              padding: '12px 32px',
              letterSpacing: '2px',
              fontFamily: FONTS.display,
              ...(hoveredBtn === 'start' && commanderName.trim() ? BASE_STYLES.buttonHover : {}),
            }}
          >
            {isRetro ? '>' : icons.rocket} NEW MISSION
          </button>
          {!commanderName.trim() && (
            <div style={{ color: COLORS.muted, fontSize: '11px', marginTop: '4px' }}>
              Enter your commander name above to begin
            </div>
          )}

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
              {isRetro ? '[LOAD]' : '📂'} LOAD SAVED GAME
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
            {isRetro ? '[INFO]' : '📖'} MISSION BRIEFING
          </button>
        </div>
      </div>

      {/* Settings button — hidden in Electron (use native menu instead) */}
      {!(window as any).electronAPI?.isElectron && (
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
      }}>
        <button
          onClick={onOpenSettings}
          onMouseEnter={() => setHoveredBtn('settings')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            ...BASE_STYLES.button,
            fontSize: '12px',
            padding: '6px 12px',
            ...(hoveredBtn === 'settings' ? BASE_STYLES.buttonHover : {}),
          }}
        >
          {isRetro ? '[SETTINGS]' : icons.settings} Settings
        </button>
      </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: '20px',
        color: COLORS.muted,
        fontSize: '10px',
        textAlign: 'center',
      }}>
        Artemis Trail © 2028 NASA (not really) • v1.0
      </div>
    </div>
  );
}
