import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { GameState, GameCommand, GameAction, NarrativeEntry } from '../../engine/types';
import { Phase, ConsumptionLevel, LaunchProfile, SurfaceActivity, EvaOutcome, ResourceType, CONSUMPTION_RATES, ILLNESS_MODIFIERS, RESOURCE_COSTS, DIFFICULTY_MODIFIERS } from '../../engine/types';
import StatusBar from '../components/StatusBar';
import NarrativeLog from '../components/NarrativeLog';
import CrewPanel from '../components/CrewPanel';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../hooks/useSettings';
import { useIcons } from '../hooks/useIcons';
import { ASCII_ART } from '../ascii-art';

interface GameScreenProps {
  state: GameState;
  narrative: NarrativeEntry[];
  actions: GameAction[];
  onCommand: (command: GameCommand) => void;
  onOpenSettings: () => void;
}

export default function GameScreen({ state, narrative, actions, onCommand, onOpenSettings }: GameScreenProps): React.ReactElement {
  const { COLORS, FONTS, BASE_STYLES, isRetro } = useTheme();
  const { settings } = useSettings();
  const icons = useIcons();
  const [showCrew, setShowCrew] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [focusedIdx, setFocusedIdx] = useState<number>(0);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [fuelInput, setFuelInput] = useState('15');
  const [descentFuelInput, setDescentFuelInput] = useState('60');
  const [showConsumptionMenu, setShowConsumptionMenu] = useState(false);
  const [showResupplyMenu, setShowResupplyMenu] = useState(false);
  const [resupplyAmounts, setResupplyAmounts] = useState<Record<string, number>>({});

  // EVA typing challenge state
  const [evaWord, setEvaWord] = useState('');
  const [evaInput, setEvaInput] = useState('');
  const [evaStartTime, setEvaStartTime] = useState(0);
  const [evaTimeLeft, setEvaTimeLeft] = useState(8);
  const evaInputRef = useRef<HTMLInputElement>(null);

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
        setShowConsumptionMenu(true);
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
        setShowResupplyMenu(true);
        setResupplyAmounts({});
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

  // Initialize EVA typing challenge when awaiting result
  useEffect(() => {
    if (isAwaitingEvaResult) {
      const words = ['LAUNCH', 'THRUST', 'BOOST', 'IGNITE', 'ORBIT', 'DOCK', 'ENGAGE'];
      setEvaWord(words[Math.floor(Math.random() * words.length)]);
      setEvaInput('');
      setEvaStartTime(Date.now());
      setEvaTimeLeft(8);
      setTimeout(() => evaInputRef.current?.focus(), 100);
    }
  }, [isAwaitingEvaResult]);

  // EVA countdown timer
  useEffect(() => {
    if (!isAwaitingEvaResult || evaTimeLeft <= 0) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - evaStartTime) / 1000;
      const remaining = Math.max(0, 8 - elapsed);
      setEvaTimeLeft(remaining);
      if (remaining <= 0) {
        handleEvaResult(EvaOutcome.Aborted);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isAwaitingEvaResult, evaStartTime, evaTimeLeft, handleEvaResult]);

  // EVA typing submit handler
  const handleEvaSubmit = useCallback(() => {
    const elapsed = (Date.now() - evaStartTime) / 1000;
    const correct = evaInput.trim().toUpperCase() === evaWord;

    let outcome: EvaOutcome;
    if (!correct) {
      outcome = EvaOutcome.Fumble;
    } else if (elapsed < 2) {
      outcome = EvaOutcome.Textbook;
    } else if (elapsed < 4) {
      outcome = EvaOutcome.Successful;
    } else if (elapsed < 6) {
      outcome = EvaOutcome.Difficult;
    } else {
      outcome = EvaOutcome.Difficult;
    }

    handleEvaResult(outcome);
  }, [evaInput, evaWord, evaStartTime, handleEvaResult]);

  const handleSave = useCallback(() => {
    onCommand({ type: 'SAVE_GAME' });
  }, [onCommand]);

  // Reset focused index when available actions change
  useEffect(() => {
    setFocusedIdx(0);
  }, [displayActions.length]);

  // Keyboard navigation for action menu
  useEffect(() => {
    if (isAwaitingEvaResult || displayActions.length === 0) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Number keys 1-9 → directly trigger action
      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (idx < displayActions.length && displayActions[idx].enabled) {
          e.preventDefault();
          handleAction(displayActions[idx], idx);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIdx(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIdx(prev => Math.min(displayActions.length - 1, prev + 1));
          break;
        case 'Enter':
          if (focusedIdx < displayActions.length && displayActions[focusedIdx].enabled) {
            e.preventDefault();
            handleAction(displayActions[focusedIdx], focusedIdx);
          }
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAwaitingEvaResult, displayActions, handleAction, focusedIdx]);

  // Keyboard handler for consumption sub-menu
  useEffect(() => {
    if (!showConsumptionMenu) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === '1') { onCommand({ type: 'SET_CONSUMPTION', level: ConsumptionLevel.Rationing }); setShowConsumptionMenu(false); }
      if (e.key === '2') { onCommand({ type: 'SET_CONSUMPTION', level: ConsumptionLevel.Standard }); setShowConsumptionMenu(false); }
      if (e.key === '3') { onCommand({ type: 'SET_CONSUMPTION', level: ConsumptionLevel.Generous }); setShowConsumptionMenu(false); }
      if (e.key === 'Escape') { setShowConsumptionMenu(false); }
      e.preventDefault();
      e.stopPropagation();
    }
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [showConsumptionMenu, onCommand]);

  // Gateway resupply: buyable resources (excludes Propulsion and Budget)
  const resupplyResources = useMemo(() => [
    ResourceType.LifeSupport,
    ResourceType.SpareParts,
    ResourceType.Shielding,
    ResourceType.Medical,
  ] as const, []);

  const priceMultiplier = useMemo(
    () => DIFFICULTY_MODIFIERS[state.difficulty].gatewayPriceMultiplier,
    [state.difficulty]
  );

  const resupplyTotal = useMemo(() => {
    let total = 0;
    for (const rt of resupplyResources) {
      const qty = resupplyAmounts[rt] || 0;
      total += qty * Math.ceil(RESOURCE_COSTS[rt].costPerUnit * priceMultiplier);
    }
    return total;
  }, [resupplyAmounts, resupplyResources, priceMultiplier]);

  const budget = state.resources[ResourceType.Budget];

  const updateResupplyAmount = useCallback((rt: ResourceType, delta: number) => {
    setResupplyAmounts(prev => {
      const current = prev[rt] || 0;
      const unitCost = Math.ceil(RESOURCE_COSTS[rt].costPerUnit * priceMultiplier);
      // Calculate current total excluding this resource
      let otherTotal = 0;
      for (const r of resupplyResources) {
        if (r !== rt) otherTotal += (prev[r] || 0) * Math.ceil(RESOURCE_COSTS[r].costPerUnit * priceMultiplier);
      }
      const maxAffordable = Math.floor((budget - otherTotal) / unitCost);
      const next = Math.max(0, Math.min(current + delta, maxAffordable));
      return { ...prev, [rt]: next };
    });
  }, [priceMultiplier, budget, resupplyResources]);

  const confirmResupply = useCallback(() => {
    onCommand({ type: 'GATEWAY_RESUPPLY', purchases: resupplyAmounts });
    setShowResupplyMenu(false);
    setResupplyAmounts({});
  }, [onCommand, resupplyAmounts]);

  const cancelResupply = useCallback(() => {
    setShowResupplyMenu(false);
    setResupplyAmounts({});
  }, []);

  // Keyboard handler for resupply sub-menu
  useEffect(() => {
    if (!showResupplyMenu) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { cancelResupply(); e.preventDefault(); e.stopPropagation(); }
      if (e.key === 'Enter') { confirmResupply(); e.preventDefault(); e.stopPropagation(); }
    }
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [showResupplyMenu, confirmResupply, cancelResupply]);

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
            <div aria-live="assertive" style={{
              ...BASE_STYLES.panel,
              margin: '0 12px',
              textAlign: 'center',
              padding: '16px',
            }}>
              <div style={{ color: COLORS.info, marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px' }}>
                ─── EVA SKILL CHALLENGE ───
              </div>
              <p style={{ color: COLORS.text, fontSize: '12px', marginBottom: '12px' }}>
                Your crew is preparing for EVA. Type the command sequence to execute:
              </p>
              <div style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: COLORS.warning,
                margin: '12px 0',
                letterSpacing: '6px',
                fontFamily: FONTS.mono,
              }}>
                &gt;&gt;&gt; {evaWord} &lt;&lt;&lt;
              </div>
              <p style={{ color: COLORS.textDim, fontSize: '11px', marginBottom: '12px' }}>
                Type the word above and press Enter!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <input
                  ref={evaInputRef}
                  type="text"
                  value={evaInput}
                  onChange={(e) => setEvaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleEvaSubmit();
                    }
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Type the EVA command word"
                  style={{
                    ...BASE_STYLES.input,
                    fontSize: '18px',
                    padding: '8px 12px',
                    width: '220px',
                    textAlign: 'center',
                    letterSpacing: '3px',
                    fontFamily: FONTS.mono,
                    textTransform: 'uppercase',
                  }}
                />
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  fontFamily: FONTS.mono,
                  color: evaTimeLeft > 4 ? COLORS.success : evaTimeLeft > 2 ? COLORS.warning : COLORS.danger,
                  minWidth: '80px',
                }}>
                  Time: {evaTimeLeft.toFixed(1)}s
                </div>
              </div>
              <div style={{
                fontSize: '10px',
                color: COLORS.textDim,
                borderTop: `1px solid ${COLORS.border}`,
                paddingTop: '8px',
                lineHeight: '1.6',
                fontFamily: FONTS.mono,
              }}>
                <div>Speed determines EVA success:</div>
                <div>
                  &lt; 2s = TEXTBOOK │ &lt; 4s = SUCCESSFUL │ &lt; 6s = DIFFICULT
                </div>
                <div>
                  Wrong word = FUMBLE │ No input = ABORTED
                </div>
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
                aria-label="Course correction fuel units"
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
                aria-label="Descent fuel units"
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
              borderTop: isRetro ? 'none' : `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.bgPanel,
            }}>
              {isRetro && (
                <div style={{ color: COLORS.textDim, fontFamily: FONTS.mono, fontSize: '12px', marginBottom: '4px' }}>
                  {ASCII_ART.thinDivider}
                </div>
              )}
              {showConsumptionMenu ? (
                <>
                  <h2 style={{ color: COLORS.info, marginBottom: '6px', fontSize: '11px', margin: 0, fontWeight: 'normal' }}>
                    ─── SET CONSUMPTION LEVEL ───
                  </h2>
                  <div style={{ color: COLORS.textDim, fontSize: '11px', marginBottom: '8px', marginTop: '4px' }}>
                    Current: {state.consumptionLevel} ({CONSUMPTION_RATES[state.consumptionLevel]} SD/turn)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {([
                      { level: ConsumptionLevel.Rationing, key: '1', icon: isRetro ? '[-]' : '🔴', desc: 'Crew is hungry and cold' },
                      { level: ConsumptionLevel.Standard, key: '2', icon: isRetro ? '[=]' : '🟡', desc: 'Normal consumption' },
                      { level: ConsumptionLevel.Generous, key: '3', icon: isRetro ? '[+]' : '🟢', desc: 'Full meals, maximum comfort' },
                    ] as const).map(({ level, key, icon, desc }) => {
                      const isCurrent = state.consumptionLevel === level;
                      return (
                        <button
                          key={level}
                          onClick={() => { onCommand({ type: 'SET_CONSUMPTION', level }); setShowConsumptionMenu(false); }}
                          onMouseEnter={() => setHoveredBtn(`consumption-${level}`)}
                          onMouseLeave={() => setHoveredBtn(null)}
                          style={{
                            ...BASE_STYLES.button,
                            textAlign: 'left',
                            padding: '5px 10px',
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'baseline',
                            ...(isCurrent ? { outline: `1px solid ${COLORS.highlight}`, outlineOffset: '-1px' } : {}),
                            ...(hoveredBtn === `consumption-${level}` ? { backgroundColor: COLORS.buttonHover, color: COLORS.text } : {}),
                          }}
                        >
                          <span style={{ color: COLORS.highlight, minWidth: '24px' }}>({key})</span>
                          <span style={{ minWidth: '24px' }}>{icon}</span>
                          <span style={{ minWidth: '100px', fontWeight: isCurrent ? 'bold' : 'normal' }}>{level}</span>
                          <span style={{ color: COLORS.textDim, fontSize: '11px', minWidth: '80px' }}>
                            {CONSUMPTION_RATES[level]} SD/turn
                          </span>
                          <span style={{ color: COLORS.muted, fontSize: '11px', minWidth: '100px' }}>
                            ×{ILLNESS_MODIFIERS[level].toFixed(1)} illness risk
                          </span>
                          <span style={{ color: COLORS.muted, fontSize: '11px' }}>{desc}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: COLORS.muted, fontSize: '10px', letterSpacing: '0.5px' }}>
                      Press 1-3 to select, Escape to cancel
                    </div>
                    <button
                      onClick={() => setShowConsumptionMenu(false)}
                      onMouseEnter={() => setHoveredBtn('cancel-consumption')}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={{
                        ...BASE_STYLES.button,
                        fontSize: '10px',
                        padding: '3px 8px',
                        ...(hoveredBtn === 'cancel-consumption' ? BASE_STYLES.buttonHover : {}),
                      }}
                    >
                      ← Back
                    </button>
                  </div>
                </>
              ) : (
              <>
              <h2 style={{ color: COLORS.textDim, marginBottom: '4px', fontSize: '11px', margin: 0, fontWeight: 'normal' }}>
                ─── AVAILABLE ACTIONS ───
              </h2>
              <div
                role="listbox"
                aria-label="Available actions"
                style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}
              >
                {displayActions.map((action, idx) => {
                  const isHovered = hoveredIdx === idx;
                  const isFocused = focusedIdx === idx;
                  const isEnabled = action.enabled;

                  return (
                    <button
                      key={`${action.command}-${action.label}-${idx}`}
                      role="option"
                      aria-selected={isFocused}
                      aria-label={`${idx + 1}. ${action.label}${action.description ? ': ' + action.description : ''}${!isEnabled ? ' (disabled)' : ''}`}
                      tabIndex={isFocused ? 0 : -1}
                      disabled={!isEnabled}
                      onClick={() => { handleAction(action, idx); (document.activeElement as HTMLElement)?.blur(); }}
                      onMouseEnter={() => { setHoveredIdx(idx); setFocusedIdx(idx); }}
                      onMouseLeave={() => setHoveredIdx(null)}
                      title={action.disabledReason || action.description}
                      style={{
                        ...(isEnabled ? BASE_STYLES.button : BASE_STYLES.buttonDisabled),
                        textAlign: 'left',
                        padding: '5px 10px',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'baseline',
                        ...((isHovered || isFocused) && isEnabled ? {
                          backgroundColor: COLORS.buttonHover,
                          color: COLORS.text,
                          outline: isFocused ? `1px solid ${COLORS.highlight}` : 'none',
                          outlineOffset: '-1px',
                        } : {}),
                      }}
                    >
                      <span style={{
                        color: (isHovered || isFocused) && isEnabled ? COLORS.highlight : COLORS.highlight,
                        minWidth: '24px',
                      }}>
                        ({idx + 1})
                      </span>
                      <span style={{ flex: 1 }}>
                        {action.label}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: (isHovered || isFocused) && isEnabled ? COLORS.textDim : COLORS.muted,
                      }}>
                        {action.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Keyboard help hint */}
              {settings.showKeyboardHints && (
                <div
                  aria-hidden="true"
                  style={{
                    color: COLORS.muted,
                    fontSize: '10px',
                    textAlign: 'center',
                    marginTop: '6px',
                    letterSpacing: '0.5px',
                  }}
                >
                  [1-9] Select Action  │  ↑↓ Navigate  │  Enter Confirm
                </div>
              )}

              {/* Save & Settings buttons */}
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                <button
                  onClick={onOpenSettings}
                  onMouseEnter={() => setHoveredBtn('settings')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...BASE_STYLES.button,
                    fontSize: '10px',
                    padding: '3px 8px',
                    ...(hoveredBtn === 'settings' ? BASE_STYLES.buttonHover : {}),
                  }}
                >
                  {isRetro ? '[SETTINGS]' : icons.settings} Settings
                </button>
                {actions.some(a => a.command === 'SAVE_GAME') && (
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
                    {isRetro ? '[SAVE]' : icons.save} SAVE
                  </button>
                )}
              </div>
              </>
              )}
            </div>
          )}
        </div>

        {/* Crew Panel (collapsible, respects settings) */}
        <div style={{
          width: (showCrew && settings.showCrewPanel) ? '220px' : '30px',
          borderLeft: `1px solid ${COLORS.border}`,
          transition: isRetro ? 'none' : 'width 0.2s',
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
            {showCrew && settings.showCrewPanel ? '◄ CREW' : '►'}
          </button>
          {showCrew && settings.showCrewPanel && <CrewPanel crew={state.crew} />}
        </div>
      </div>
    </div>
  );
}
