import React, { useState } from 'react';
import type { GameState } from '../../engine/types';
import { COLORS, FONTS, BASE_STYLES } from '../styles';
import { NARRATIVE } from '../../content/narrative';

interface DefeatScreenProps {
  state: GameState;
  onPlayAgain: () => void;
}

type DebriefStage = 'intro' | 'q1' | 'a1' | 'q2' | 'a2' | 'q3' | 'a3' | 'signature' | 'done';

export default function DefeatScreen({ state, onPlayAgain }: DefeatScreenProps): React.ReactElement {
  const [stage, setStage] = useState<DebriefStage>('intro');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const debrief = NARRATIVE.deathDebrief;
  const questionsList = [...debrief.questions];

  const handleAnswer = (yes: boolean) => {
    const newAnswers = [...answers, yes];
    setAnswers(newAnswers);

    // Show the response
    if (stage === 'q1') setStage('a1');
    else if (stage === 'q2') setStage('a2');
    else if (stage === 'q3') setStage('a3');
  };

  const handleNext = () => {
    switch (stage) {
      case 'intro': setStage('q1'); break;
      case 'a1': setStage('q2'); break;
      case 'a2': setStage('q3'); break;
      case 'a3': setStage('signature'); break;
      case 'signature': setStage('done'); break;
    }
  };

  const currentQuestion = stage === 'q1' ? 0 : stage === 'q2' ? 1 : stage === 'q3' ? 2 : -1;
  const currentAnswer = stage === 'a1' ? 0 : stage === 'a2' ? 1 : stage === 'a3' ? 2 : -1;

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
        textAlign: 'center',
      }}>
        {/* Game Over Header */}
        <h1 style={{
          color: COLORS.danger,
          fontFamily: FONTS.mono,
          fontSize: '28px',
          letterSpacing: '4px',
          textShadow: `0 0 20px ${COLORS.danger}`,
          marginBottom: '8px',
        }}>
          ╔══════════════════════╗
          <br />
          ║   MISSION FAILED    ║
          <br />
          ╚══════════════════════╝
        </h1>

        {/* Reason */}
        <p style={{
          color: COLORS.danger,
          fontSize: '14px',
          marginBottom: '24px',
          fontStyle: 'italic',
        }}>
          {state.gameOverReason || 'The mission has ended in failure.'}
        </p>

        {/* Death Debrief */}
        <div style={{
          border: `1px solid ${COLORS.border}`,
          padding: '20px',
          backgroundColor: COLORS.bgPanel,
          textAlign: 'left',
          marginBottom: '24px',
        }}>
          {/* Intro */}
          {stage === 'intro' && (
            <>
              <p style={{ color: COLORS.text, lineHeight: '1.8', fontSize: '13px', marginBottom: '16px' }}>
                {debrief.intro}
              </p>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleNext}
                  onMouseEnter={() => setHoveredBtn('next')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...BASE_STYLES.button,
                    ...(hoveredBtn === 'next' ? BASE_STYLES.buttonHover : {}),
                  }}
                >
                  Continue ▶
                </button>
              </div>
            </>
          )}

          {/* Question */}
          {currentQuestion >= 0 && currentQuestion < questionsList.length && (
            <>
              <p style={{
                color: COLORS.info,
                fontSize: '15px',
                marginBottom: '16px',
                lineHeight: '1.6',
              }}>
                Senator: "{questionsList[currentQuestion].question}"
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => handleAnswer(true)}
                  onMouseEnter={() => setHoveredBtn('yes')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...BASE_STYLES.button,
                    minWidth: '100px',
                    ...(hoveredBtn === 'yes' ? BASE_STYLES.buttonHover : {}),
                  }}
                >
                  YES
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  onMouseEnter={() => setHoveredBtn('no')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...BASE_STYLES.button,
                    minWidth: '100px',
                    ...(hoveredBtn === 'no' ? BASE_STYLES.buttonHover : {}),
                  }}
                >
                  NO
                </button>
              </div>
            </>
          )}

          {/* Answer */}
          {currentAnswer >= 0 && currentAnswer < questionsList.length && (
            <>
              <p style={{
                color: COLORS.text,
                fontSize: '13px',
                lineHeight: '1.8',
                marginBottom: '16px',
              }}>
                {answers[currentAnswer]
                  ? questionsList[currentAnswer].yesResponse
                  : questionsList[currentAnswer].noResponse}
              </p>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleNext}
                  onMouseEnter={() => setHoveredBtn('next')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...BASE_STYLES.button,
                    ...(hoveredBtn === 'next' ? BASE_STYLES.buttonHover : {}),
                  }}
                >
                  Continue ▶
                </button>
              </div>
            </>
          )}

          {/* Signature */}
          {stage === 'signature' && (
            <>
              <div style={{
                color: COLORS.muted,
                fontSize: '12px',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
                marginBottom: '16px',
                textAlign: 'center',
                fontStyle: 'italic',
              }}>
                {debrief.signature}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleNext}
                  onMouseEnter={() => setHoveredBtn('next')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...BASE_STYLES.button,
                    ...(hoveredBtn === 'next' ? BASE_STYLES.buttonHover : {}),
                  }}
                >
                  Continue ▶
                </button>
              </div>
            </>
          )}

          {/* Done */}
          {stage === 'done' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: COLORS.muted,
                fontSize: '13px',
                marginBottom: '16px',
                fontStyle: 'italic',
              }}>
                {NARRATIVE.endings.totalMissionLoss}
              </p>
              <div style={{
                color: COLORS.textDim,
                fontSize: '11px',
                marginBottom: '16px',
              }}>
                Final Score: {state.score} │ Turns: {state.totalTurns} │ Mission Day: {state.missionDay}
              </div>
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
                🚀 TRY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
