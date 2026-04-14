import React, { useState, useEffect } from 'react';
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

  // Keyboard navigation for debrief
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const isQuestionStage = stage === 'q1' || stage === 'q2' || stage === 'q3';
      const isContinueStage = stage === 'intro' || stage === 'a1' || stage === 'a2' || stage === 'a3' || stage === 'signature';

      switch (e.key) {
        case '1':
          if (isQuestionStage) {
            e.preventDefault();
            handleAnswer(true);
          }
          break;
        case '2':
          if (isQuestionStage) {
            e.preventDefault();
            handleAnswer(false);
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (isContinueStage) {
            handleNext();
          }
          if (stage === 'done') {
            onPlayAgain();
          }
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [stage]);

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
          fontFamily: FONTS.display,
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
              <div
                role="listbox"
                aria-label="Answer options"
                style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}
              >
                <button
                  role="option"
                  aria-selected={false}
                  aria-label="1. Yes"
                  onClick={() => handleAnswer(true)}
                  onMouseEnter={() => setHoveredBtn('yes')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...BASE_STYLES.button,
                    minWidth: '100px',
                    ...(hoveredBtn === 'yes' ? BASE_STYLES.buttonHover : {}),
                  }}
                >
                  (1) YES
                </button>
                <button
                  role="option"
                  aria-selected={false}
                  aria-label="2. No"
                  onClick={() => handleAnswer(false)}
                  onMouseEnter={() => setHoveredBtn('no')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...BASE_STYLES.button,
                    minWidth: '100px',
                    ...(hoveredBtn === 'no' ? BASE_STYLES.buttonHover : {}),
                  }}
                >
                  (2) NO
                </button>
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
                [1] Yes  │  [2] No
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
