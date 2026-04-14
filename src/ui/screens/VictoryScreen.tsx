import React from 'react';
import type { GameState, ScoreBreakdown, ScoreRating } from '../../engine/types';
import { VictoryTier, ScoreRating as ScoreRatingEnum } from '../../engine/types';
import { COLORS, FONTS, BASE_STYLES } from '../styles';
import { NARRATIVE } from '../../content/narrative';

interface VictoryScreenProps {
  state: GameState;
  scoreBreakdown: ScoreBreakdown | null;
  scoreRating: ScoreRating | null;
  onPlayAgain: () => void;
}

const TIER_BANNERS: Record<VictoryTier, { title: string; color: string }> = {
  [VictoryTier.ThrivingColony]: {
    title: '🌟 THRIVING COLONY ESTABLISHED 🌟',
    color: COLORS.highlight,
  },
  [VictoryTier.SustainableOutpost]: {
    title: '🏗️ SUSTAINABLE OUTPOST ESTABLISHED',
    color: COLORS.info,
  },
  [VictoryTier.BareSurvival]: {
    title: '⚠️ BARE SURVIVAL — COLONY MARGINAL',
    color: COLORS.warning,
  },
};

const RATING_LABELS: Record<string, { label: string; description: string }> = {
  [ScoreRatingEnum.S]: { label: 'S', description: 'One Giant Leap' },
  [ScoreRatingEnum.A]: { label: 'A', description: 'Mission Success' },
  [ScoreRatingEnum.B]: { label: 'B', description: 'Colony Established' },
  [ScoreRatingEnum.C]: { label: 'C', description: 'Survived' },
  [ScoreRatingEnum.D]: { label: 'D', description: 'Barely Made It' },
  [ScoreRatingEnum.F]: { label: 'F', description: 'Pyrrhic Victory' },
};

export default function VictoryScreen({ state, scoreBreakdown, scoreRating, onPlayAgain }: VictoryScreenProps): React.ReactElement {
  const tier = state.victoryTier || VictoryTier.BareSurvival;
  const banner = TIER_BANNERS[tier];
  const rating = scoreRating ? RATING_LABELS[scoreRating] : null;

  const endingText = tier === VictoryTier.ThrivingColony
    ? NARRATIVE.endings.thrivingColony
    : tier === VictoryTier.SustainableOutpost
      ? NARRATIVE.endings.sustainableOutpost
      : NARRATIVE.endings.bareSurvival;

  const [hoveredBtn, setHoveredBtn] = React.useState<string | null>(null);

  return (
    <div style={{
      ...BASE_STYLES.container,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px',
      overflow: 'auto',
    }}>
      {/* Victory Banner */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px',
      }}>
        <h1 style={{
          color: banner.color,
          fontFamily: FONTS.display,
          fontSize: '24px',
          letterSpacing: '3px',
          textShadow: `0 0 20px ${banner.color}`,
          marginBottom: '8px',
        }}>
          {banner.title}
        </h1>
        {rating && (
          <div style={{ marginTop: '8px' }}>
            <span style={{
              fontSize: '48px',
              color: banner.color,
              fontWeight: 'bold',
              textShadow: `0 0 30px ${banner.color}`,
            }}>
              {rating.label}
            </span>
            <div style={{ color: COLORS.muted, fontSize: '14px', marginTop: '4px' }}>
              "{rating.description}"
            </div>
          </div>
        )}
      </div>

      {/* Ending Narrative */}
      <div style={{
        maxWidth: '700px',
        color: COLORS.text,
        fontSize: '13px',
        lineHeight: '1.8',
        marginBottom: '24px',
        padding: '16px',
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.bgPanel,
        whiteSpace: 'pre-wrap',
      }}>
        {endingText}
      </div>

      {/* Score Breakdown */}
      {scoreBreakdown && (
        <div style={{
          maxWidth: '500px',
          width: '100%',
          marginBottom: '24px',
        }}>
          <h3 style={{
            color: COLORS.textDim,
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '12px',
          }}>
            ═══ SCORE BREAKDOWN ═══
          </h3>
          <table style={{
            width: '100%',
            fontFamily: FONTS.mono,
            fontSize: '12px',
            borderCollapse: 'collapse',
          }}>
            <tbody>
              {[
                { label: 'Surviving Crew', value: scoreBreakdown.survivingCrew },
                { label: 'Crew Health Bonus', value: scoreBreakdown.crewHealthBonus },
                { label: 'Remaining Life Support', value: scoreBreakdown.remainingLifeSupport },
                { label: 'Remaining Spare Parts', value: scoreBreakdown.remainingSpareParts },
                { label: 'Remaining Shielding', value: scoreBreakdown.remainingShielding },
                { label: 'Remaining Medical', value: scoreBreakdown.remainingMedical },
                { label: 'Remaining Fuel', value: scoreBreakdown.remainingFuel },
                { label: 'Science EVAs', value: scoreBreakdown.scienceEvas },
                { label: 'Landing Quality', value: scoreBreakdown.landingQuality },
                { label: 'Site Difficulty', value: scoreBreakdown.siteDifficulty },
                { label: 'Speed Bonus', value: scoreBreakdown.speedBonus },
                { label: 'No Deaths Bonus', value: scoreBreakdown.noDeathsBonus },
              ].map(({ label, value }) => (
                <tr key={label} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '4px 8px', color: COLORS.text }}>{label}</td>
                  <td style={{
                    padding: '4px 8px',
                    textAlign: 'right',
                    color: value > 0 ? COLORS.info : COLORS.muted,
                  }}>
                    {value > 0 ? `+${value}` : value}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${COLORS.text}` }}>
                <td style={{ padding: '8px', color: COLORS.text, fontWeight: 'bold', fontSize: '14px' }}>
                  TOTAL SCORE
                </td>
                <td style={{
                  padding: '8px',
                  textAlign: 'right',
                  color: banner.color,
                  fontWeight: 'bold',
                  fontSize: '18px',
                }}>
                  {scoreBreakdown.total}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Play Again */}
      <button
        onClick={onPlayAgain}
        onMouseEnter={() => setHoveredBtn('again')}
        onMouseLeave={() => setHoveredBtn(null)}
        style={{
          ...BASE_STYLES.button,
          fontSize: '16px',
          padding: '12px 32px',
          letterSpacing: '2px',
          ...(hoveredBtn === 'again' ? BASE_STYLES.buttonHover : {}),
        }}
      >
        🚀 PLAY AGAIN
      </button>
    </div>
  );
}
