import React, { useState, useCallback } from 'react';
import type { GameState, GameCommand, Resources } from '../../engine/types';
import { ResourceType, ConsumptionLevel, RESOURCE_COSTS, DIFFICULTY_MODIFIERS } from '../../engine/types';
import { COLORS, FONTS, BASE_STYLES } from '../styles';

interface MissionPrepScreenProps {
  state: GameState;
  onCommand: (command: GameCommand) => void;
  onCommands: (commands: GameCommand[]) => void;
}

interface ResourceAllocation {
  key: ResourceType;
  label: string;
  shortLabel: string;
  description: string;
  costPerUnit: number;
  minUnits: number;
  maxUnits: number;
  units: number;
}

export default function MissionPrepScreen({ state, onCommand, onCommands }: MissionPrepScreenProps): React.ReactElement {
  const mods = DIFFICULTY_MODIFIERS[state.difficulty];
  const totalBudget = mods.availableBudget;

  const [allocations, setAllocations] = useState<ResourceAllocation[]>(() => {
    const costs = RESOURCE_COSTS;
    return [
      {
        key: ResourceType.Propulsion,
        label: 'Propulsion (Fuel Units)',
        shortLabel: 'FU',
        description: 'Needed for every maneuver. Run out = death.',
        costPerUnit: costs[ResourceType.Propulsion].costPerUnit,
        minUnits: costs[ResourceType.Propulsion].minPurchase / costs[ResourceType.Propulsion].costPerUnit,
        maxUnits: costs[ResourceType.Propulsion].maxPurchase / costs[ResourceType.Propulsion].costPerUnit,
        units: 250,
      },
      {
        key: ResourceType.LifeSupport,
        label: 'Life Support (Supply Days)',
        shortLabel: 'SD',
        description: 'Food, water, O₂. Consumed each turn.',
        costPerUnit: costs[ResourceType.LifeSupport].costPerUnit,
        minUnits: 0,
        maxUnits: costs[ResourceType.LifeSupport].maxPurchase / costs[ResourceType.LifeSupport].costPerUnit,
        units: 40,
      },
      {
        key: ResourceType.SpareParts,
        label: 'Spare Parts (Part Units)',
        shortLabel: 'PU',
        description: 'Used for repairs and EVAs. Essential on surface.',
        costPerUnit: costs[ResourceType.SpareParts].costPerUnit,
        minUnits: 0,
        maxUnits: costs[ResourceType.SpareParts].maxPurchase / costs[ResourceType.SpareParts].costPerUnit,
        units: 20,
      },
      {
        key: ResourceType.Shielding,
        label: 'Shielding (Shield Rating)',
        shortLabel: 'SR',
        description: 'Protects from radiation and debris.',
        costPerUnit: costs[ResourceType.Shielding].costPerUnit,
        minUnits: 0,
        maxUnits: costs[ResourceType.Shielding].maxPurchase / costs[ResourceType.Shielding].costPerUnit,
        units: 10,
      },
      {
        key: ResourceType.Medical,
        label: 'Medical (Med Units)',
        shortLabel: 'MU',
        description: 'Treats crew illness. Critical for survival.',
        costPerUnit: costs[ResourceType.Medical].costPerUnit,
        minUnits: 0,
        maxUnits: costs[ResourceType.Medical].maxPurchase / costs[ResourceType.Medical].costPerUnit,
        units: 8,
      },
    ];
  });

  const [consumption, setConsumption] = useState<ConsumptionLevel>(state.consumptionLevel);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const totalSpent = allocations.reduce((sum, a) => sum + a.units * a.costPerUnit, 0);
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;
  const hasMinFuel = allocations.find(a => a.key === ResourceType.Propulsion)!.units >= 200;

  const updateUnits = useCallback((idx: number, delta: number) => {
    setAllocations(prev => {
      const next = [...prev];
      const a = { ...next[idx] };
      const newUnits = Math.max(0, Math.min(a.maxUnits, a.units + delta));
      a.units = newUnits;
      next[idx] = a;
      return next;
    });
  }, []);

  const setUnits = useCallback((idx: number, value: number) => {
    setAllocations(prev => {
      const next = [...prev];
      const a = { ...next[idx] };
      a.units = Math.max(0, Math.min(a.maxUnits, value));
      next[idx] = a;
      return next;
    });
  }, []);

  const handleLaunch = useCallback(() => {
    if (isOverBudget || !hasMinFuel) return;

    const resources: Resources = {
      [ResourceType.Propulsion]: 0,
      [ResourceType.LifeSupport]: 0,
      [ResourceType.SpareParts]: 0,
      [ResourceType.Shielding]: 0,
      [ResourceType.Medical]: 0,
      [ResourceType.Budget]: remaining,
    };

    for (const a of allocations) {
      resources[a.key] = a.units;
    }

    // Send all commands atomically to avoid stale state
    const commands: GameCommand[] = [];
    if (consumption !== state.consumptionLevel) {
      commands.push({ type: 'SET_CONSUMPTION', level: consumption });
    }
    commands.push({ type: 'ALLOCATE_RESOURCES', resources });
    commands.push({ type: 'START_MISSION' });
    onCommands(commands);
  }, [allocations, consumption, remaining, isOverBudget, hasMinFuel, onCommands, state.consumptionLevel]);

  return (
    <div style={{
      ...BASE_STYLES.container,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      <h2 style={{
        ...BASE_STYLES.heading,
        textAlign: 'center',
        marginBottom: '4px',
        fontSize: '18px',
      }}>
        ═══ MISSION PREPARATION ═══
      </h2>
      <p style={{ color: COLORS.textDim, textAlign: 'center', marginBottom: '20px', fontSize: '12px' }}>
        Allocate your {totalBudget} CR budget across mission resources. Choose wisely — every credit counts.
      </p>

      {/* Budget Display */}
      <div style={{
        ...BASE_STYLES.panel,
        textAlign: 'center',
        fontSize: '18px',
        marginBottom: '16px',
        backgroundColor: COLORS.bgDark,
        border: `1px solid ${COLORS.borderLight}`,
      }}>
        <span style={{ color: COLORS.textDim }}>BUDGET: </span>
        <span style={{ color: isOverBudget ? COLORS.danger : remaining < 50 ? COLORS.warning : COLORS.highlight, fontSize: '24px', fontFamily: FONTS.display }}>
          {remaining} CR
        </span>
        <span style={{ color: COLORS.muted }}> / {totalBudget} CR</span>
        {isOverBudget && (
          <div style={{ color: COLORS.danger, fontSize: '12px', marginTop: '4px' }}>
            ⚠ OVER BUDGET — Reduce allocations
          </div>
        )}
      </div>

      {/* Resource Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {allocations.map((a, idx) => {
          const cost = a.units * a.costPerUnit;
          return (
            <div key={a.key} style={{
              ...BASE_STYLES.panel,
              display: 'grid',
              gridTemplateColumns: '200px 1fr 120px',
              gap: '12px',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ color: COLORS.text, fontSize: '13px' }}>{a.label}</div>
                <div style={{ color: COLORS.muted, fontSize: '10px' }}>{a.description}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => updateUnits(idx, -10)}
                  onMouseEnter={() => setHoveredBtn(`${a.key}-minus10`)}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...BASE_STYLES.button,
                    padding: '2px 8px',
                    fontSize: '12px',
                    ...(hoveredBtn === `${a.key}-minus10` ? BASE_STYLES.buttonHover : {}),
                  }}
                >
                  -10
                </button>
                <button
                  onClick={() => updateUnits(idx, -1)}
                  onMouseEnter={() => setHoveredBtn(`${a.key}-minus`)}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...BASE_STYLES.button,
                    padding: '2px 8px',
                    fontSize: '12px',
                    ...(hoveredBtn === `${a.key}-minus` ? BASE_STYLES.buttonHover : {}),
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={a.units}
                  onChange={(e) => setUnits(idx, parseInt(e.target.value) || 0)}
                  min={0}
                  max={a.maxUnits}
                  style={{
                    ...BASE_STYLES.input,
                    width: '70px',
                    textAlign: 'center',
                  }}
                />
                <button
                  onClick={() => updateUnits(idx, 1)}
                  onMouseEnter={() => setHoveredBtn(`${a.key}-plus`)}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...BASE_STYLES.button,
                    padding: '2px 8px',
                    fontSize: '12px',
                    ...(hoveredBtn === `${a.key}-plus` ? BASE_STYLES.buttonHover : {}),
                  }}
                >
                  +
                </button>
                <button
                  onClick={() => updateUnits(idx, 10)}
                  onMouseEnter={() => setHoveredBtn(`${a.key}-plus10`)}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...BASE_STYLES.button,
                    padding: '2px 8px',
                    fontSize: '12px',
                    ...(hoveredBtn === `${a.key}-plus10` ? BASE_STYLES.buttonHover : {}),
                  }}
                >
                  +10
                </button>
                <span style={{ color: COLORS.muted, fontSize: '11px', minWidth: '40px' }}>
                  {a.shortLabel}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: COLORS.highlight }}>{cost} CR</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Consumption Level */}
      <div style={{ ...BASE_STYLES.panel, marginBottom: '20px' }}>
        <div style={{ color: COLORS.textDim, marginBottom: '8px', fontSize: '12px' }}>
          LIFE SUPPORT CONSUMPTION LEVEL:
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {Object.values(ConsumptionLevel).map((level) => {
            const isSelected = consumption === level;
            const labels: Record<ConsumptionLevel, string> = {
              [ConsumptionLevel.Rationing]: 'RATIONING (0.5 SD/turn, ×2.0 illness)',
              [ConsumptionLevel.Standard]: 'STANDARD (1.0 SD/turn, ×1.0 illness)',
              [ConsumptionLevel.Generous]: 'GENEROUS (1.5 SD/turn, ×0.5 illness)',
            };
            return (
              <button
                key={level}
                onClick={() => setConsumption(level)}
                onMouseEnter={() => setHoveredBtn(`cons-${level}`)}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...BASE_STYLES.button,
                  flex: 1,
                  fontSize: '11px',
                  backgroundColor: isSelected ? COLORS.highlight : COLORS.buttonBg,
                  color: isSelected ? COLORS.bgDark : COLORS.text,
                  ...(hoveredBtn === `cons-${level}` && !isSelected ? { borderColor: COLORS.info, backgroundColor: COLORS.buttonHover } : {}),
                }}
              >
                {labels[level]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Launch Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleLaunch}
          disabled={isOverBudget || !hasMinFuel}
          onMouseEnter={() => setHoveredBtn('launch')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            ...(isOverBudget || !hasMinFuel ? BASE_STYLES.buttonDisabled : BASE_STYLES.buttonDanger),
            fontSize: '18px',
            padding: '12px 48px',
            letterSpacing: '3px',
            fontFamily: FONTS.display,
            fontWeight: 'bold',
            ...(hoveredBtn === 'launch' && !isOverBudget && hasMinFuel ? { backgroundColor: '#E0351D' } : {}),
          }}
        >
          🚀 LAUNCH MISSION
        </button>
        {!hasMinFuel && (
          <div style={{ color: COLORS.danger, fontSize: '11px', marginTop: '8px' }}>
            Minimum 200 Fuel Units required for launch
          </div>
        )}
      </div>
    </div>
  );
}
