import React, { useState, useCallback, useMemo } from 'react';
import type { GameState, GameCommand, GameAction, NarrativeEntry } from '../../engine/types';
import { Phase, ConsumptionLevel, LaunchProfile, SurfaceActivity, EvaOutcome, ResourceType } from '../../engine/types';
import StatusBar from '../components/StatusBar';
import NarrativeLog from '../components/NarrativeLog';
import CrewPanel from '../components/CrewPanel';
import { COLORS, FONTS, BASE_STYLES } from '../styles';

interface GameScreenProps {
  state: GameState;
  narrative: NarrativeEntry[];
  actions: GameAction[];
  onCommand: (command: GameCommand) => void;
}

export default function GameScreen({ state, narrative, actions, onCommand }: GameScreenProps): React.ReactElement {
  const [showCrew, setShowCrew] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [fuelInput, setFuelInput] = useState('15');
  const [descentFuelInput, setDescentFuelInput] = useState('60');

  // Check if we're waiting for an EVA skill result
  const isAwaitingEvaResult = state.currentEvent?.id?.startsWith('eva-pending-') ?? false;

  // Filter actions for display — some need special handling
  const displayActions = useMemo(() => {
    return actions.filter(a => a.command !== 'SAVE_GAME' && a.command !== 'LOAD_GAME');
  }, [actions]);

  const handleAction = useCallback((action: GameAction, idx: number) => {
    if (!action.enabled) return;

    switch (action.command) {
      case 'SELECT_LAUNCH_PROFILE': {
        const profileMap: Record<string, LaunchProfile> = {
          'Conservative Launch': LaunchProfile.Conservative,
          'Standard Launch': LaunchProfile.Standard,
          'Aggressive Launch': LaunchProfile.Aggressive,
        };
        const profile = profileMap[action.label];
        if (profile) {
          onCommand({ type: 'SELECT_LAUNCH_PROFILE', profile });
        }
        break;
      }

      case 'SET_CONSUMPTION': {
        // Cycle consumption levels
        const levels = [ConsumptionLevel.Rationing, ConsumptionLevel.Standard, ConsumptionLevel.Generous];
        const currentIdx = levels.indexOf(state.consumptionLevel);
        const nextLevel = levels[(currentIdx + 1) % levels.length];
        onCommand({ type: 'SET_CONSUMPTION', level: nextLevel });
        break;
      }

      case 'PROCEED':
        onCommand({ type: 'PROCEED' });
        break;

      case 'STOP_AT_GATEWAY':
        onCommand({ type: 'STOP_AT_GATEWAY' });
        break;

      case 'SELECT_SURFACE_ACTIVITY': {
        const activityMap: Record<string, SurfaceActivity> = {
          'EVA: Ice Extraction': SurfaceActivity.EvaIceExtraction,
          'EVA: Equipment Repair': SurfaceActivity.EvaEquipmentRepair,
          'EVA: Science Mission': SurfaceActivity.EvaScienceMission,
          'Shelter in Habitat': SurfaceActivity.Shelter,
          'Medical Treatment': SurfaceActivity.MedicalTreatment,
        };
        const activity = activityMap[action.label];
        if (activity) {
          if (activity === SurfaceActivity.MedicalTreatment) {
            // Find first treatable crew
            const target = state.crew.find(c =>
              c.isAlive && (c.healthStatus === 'CRITICAL' || c.healthStatus === 'ILL' || c.healthStatus === 'STRESSED')
            );
            onCommand({
              type: 'SELECT_SURFACE_ACTIVITY',
              activity,
              targetCrewId: target?.id,
            });
          } else {
            onCommand({ type: 'SELECT_SURFACE_ACTIVITY', activity });
          }
        }
        break;
      }

      case 'ALLOCATE_COURSE_CORRECTION': {
        const fuel = parseInt(fuelInput) || 15;
        onCommand({ type: 'ALLOCATE_COURSE_CORRECTION', fuelUnits: fuel });
        break;
      }

      case 'EXECUTE_DESCENT': {
        const fuel = parseInt(descentFuelInput) || 60;
        onCommand({ type: 'EXECUTE_DESCENT', fuelUnits: fuel });
        break;
      }

      case 'GATEWAY_RESUPPLY':
        // This is handled specially via LandingSiteScreen; pass a minimal resupply
        onCommand({ type: 'GATEWAY_RESUPPLY', purchases: {} });
        break;

      case 'GATEWAY_MEDICAL': {
        // Extract crew id from label "Treat <name>"
        const crewMember = state.crew.find(c => action.label.includes(c.name));
        if (crewMember) {
          onCommand({ type: 'GATEWAY_MEDICAL', crewId: crewMember.id });
        }
        break;
      }

      case 'SELECT_LANDING_SITE':
        // Will be handled by LandingSiteScreen; shouldn't appear here
        break;

      case 'EVENT_CHOICE': {
        if (state.currentEvent?.choices) {
          const choice = state.currentEvent.choices[idx];
          if (choice) {
            onCommand({
              type: 'EVENT_CHOICE',
              eventId: state.currentEvent.id,
              choiceId: choice.id,
            });
          }
        }
        break;
      }

      default:
        onCommand({ type: action.command } as GameCommand);
    }
  }, [state, onCommand, fuelInput, descentFuelInput]);

  const handleEvaResult = useCallback((outcome: EvaOutcome) => {
    onCommand({ type: 'EVA_SKILL_RESULT', outcome });
  }, [onCommand]);

  const handleSave = useCallback(() => {
    onCommand({ type: 'SAVE_GAME' });
  }, [onCommand]);

  return (
    <div style={{
      ...BASE_STYLES.container,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>
      {/* Status Bar */}
      <StatusBar state={state} />

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* Narrative + Actions */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <NarrativeLog entries={narrative} />

          {/* EVA Skill Challenge UI */}
          {isAwaitingEvaResult && (
            <div style={{
              ...BASE_STYLES.panel,
              margin: '0 12px',
              textAlign: 'center',
            }}>
              <div style={{ color: COLORS.info, marginBottom: '8px', fontSize: '13px' }}>
                ─── EVA SKILL CHALLENGE ───
              </div>
              <p style={{ color: COLORS.text, fontSize: '12px', marginBottom: '12px' }}>
                Select EVA outcome (simulated skill check):
              </p>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {Object.values(EvaOutcome).map((outcome) => (
                  <button
                    key={outcome}
                    onClick={() => handleEvaResult(outcome)}
                    onMouseEnter={() => setHoveredBtn(`eva-${outcome}`)}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      ...BASE_STYLES.button,
                      fontSize: '11px',
                      padding: '6px 12px',
                      ...(hoveredBtn === `eva-${outcome}` ? BASE_STYLES.buttonHover : {}),
                    }}
                  >
                    {outcome}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fuel Input for Course Correction */}
          {state.phase === Phase.LunarTransit && !isAwaitingEvaResult && (
            <div style={{
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
            }}>
              <span style={{ color: COLORS.textDim }}>Course correction fuel:</span>
              <input
                type="number"
                value={fuelInput}
                onChange={(e) => setFuelInput(e.target.value)}
                min={0}
                max={state.resources[ResourceType.Propulsion]}
                style={{ ...BASE_STYLES.input, width: '60px', fontSize: '12px', padding: '4px' }}
              />
              <span style={{ color: COLORS.muted }}>FU (trajectory error: {state.phaseData.trajectoryError.toFixed(1)})</span>
            </div>
          )}

          {/* Fuel Input for Descent */}
          {state.phase === Phase.Descent && !state.phaseData.landingAttempted && !isAwaitingEvaResult && (
            <div style={{
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
            }}>
              <span style={{ color: COLORS.textDim }}>Descent fuel (45-80):</span>
              <input
                type="number"
                value={descentFuelInput}
                onChange={(e) => setDescentFuelInput(e.target.value)}
                min={45}
                max={80}
                style={{ ...BASE_STYLES.input, width: '60px', fontSize: '12px', padding: '4px' }}
              />
              <span style={{ color: COLORS.muted }}>FU (more fuel = better landing)</span>
            </div>
          )}

          {/* Surface Ops Progress */}
          {state.phase === Phase.SurfaceOps && (
            <div style={{
              padding: '4px 12px',
              fontSize: '11px',
              color: COLORS.textDim,
              textAlign: 'center',
            }}>
              Surface Turn {state.phaseData.surfaceTurnsCompleted} / {state.phaseData.surfaceTurnsTotal} │
              EVAs: {state.phaseData.evasCompleted} │
              Science EVAs: {state.phaseData.scienceEvasCompleted} │
              Base: {state.phaseData.baseConstructionProgress}%
            </div>
          )}

          {/* Action Menu */}
          {!isAwaitingEvaResult && displayActions.length > 0 && (
            <div style={{
              padding: '8px 12px',
              borderTop: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.bgPanel,
            }}>
              <div style={{ color: COLORS.textDim, marginBottom: '4px', fontSize: '11px' }}>
                ─── AVAILABLE ACTIONS ───
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {displayActions.map((action, idx) => {
                  const isHovered = hoveredIdx === idx;
                  const isEnabled = action.enabled;

                  return (
                    <button
                      key={`${action.command}-${action.label}-${idx}`}
                      disabled={!isEnabled}
                      onClick={() => handleAction(action, idx)}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      title={action.disabledReason || action.description}
                      style={{
                        ...(isEnabled ? BASE_STYLES.button : BASE_STYLES.buttonDisabled),
                        textAlign: 'left',
                        padding: '5px 10px',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'baseline',
                        ...(isHovered && isEnabled ? {
                          backgroundColor: COLORS.buttonHover,
                          color: COLORS.text,
                        } : {}),
                      }}
                    >
                      <span style={{
                        color: isHovered && isEnabled ? COLORS.highlight : COLORS.highlight,
                        minWidth: '24px',
                      }}>
                        ({idx + 1})
                      </span>
                      <span style={{ flex: 1 }}>
                        {action.label}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: isHovered && isEnabled ? COLORS.textDim : COLORS.muted,
                      }}>
                        {action.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Save button */}
              {actions.some(a => a.command === 'SAVE_GAME') && (
                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                  <button
                    onClick={handleSave}
                    onMouseEnter={() => setHoveredBtn('save')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      ...BASE_STYLES.button,
                      fontSize: '10px',
                      padding: '3px 8px',
                      ...(hoveredBtn === 'save' ? BASE_STYLES.buttonHover : {}),
                    }}
                  >
                    💾 SAVE
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Crew Panel (collapsible) */}
        <div style={{
          width: showCrew ? '220px' : '30px',
          borderLeft: `1px solid ${COLORS.border}`,
          transition: 'width 0.2s',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <button
            onClick={() => setShowCrew(!showCrew)}
            style={{
              ...BASE_STYLES.button,
              width: '100%',
              padding: '4px',
              fontSize: '10px',
              borderWidth: '0 0 1px 0',
            }}
          >
            {showCrew ? '◄ CREW' : '►'}
          </button>
          {showCrew && <CrewPanel crew={state.crew} />}
        </div>
      </div>
    </div>
  );
}
