import React from 'react';
import type { GameState } from '../../engine/types';
import { ResourceType, ConsumptionLevel, Phase } from '../../engine/types';
import { useTheme, getResourceColor } from '../hooks/useTheme';
import { useIcons } from '../hooks/useIcons';

interface StatusBarProps {
  state: GameState;
}

const PHASE_LABELS: Record<Phase, string> = {
  [Phase.MissionPrep]: 'MISSION PREP',
  [Phase.Launch]: 'LAUNCH',
  [Phase.LunarTransit]: 'LUNAR TRANSIT',
  [Phase.Gateway]: 'GATEWAY',
  [Phase.Descent]: 'DESCENT',
  [Phase.SurfaceOps]: 'SURFACE OPS',
  [Phase.Colony]: 'COLONY',
};

const CONSUMPTION_LABELS: Record<ConsumptionLevel, string> = {
  [ConsumptionLevel.Rationing]: 'RATIONING',
  [ConsumptionLevel.Standard]: 'STANDARD',
  [ConsumptionLevel.Generous]: 'GENEROUS',
};

// Rough max values for color coding
const RESOURCE_MAXES: Record<string, number> = {
  [ResourceType.Propulsion]: 400,
  [ResourceType.LifeSupport]: 80,
  [ResourceType.SpareParts]: 50,
  [ResourceType.Shielding]: 20,
  [ResourceType.Medical]: 15,
  [ResourceType.Budget]: 800,
};

export default function StatusBar({ state }: StatusBarProps): React.ReactElement {
  const { COLORS, FONTS } = useTheme();
  const icons = useIcons();
  const aliveCrew = state.crew.filter((c: { isAlive: boolean }) => c.isAlive).length;
  const totalCrew = state.crew.length;

  const resources = [
    { label: 'FU', icon: icons.fuel, tooltip: 'Fuel Units (Propulsion)', value: state.resources[ResourceType.Propulsion], key: ResourceType.Propulsion },
    { label: 'SD', icon: icons.food, tooltip: 'Supply Days (Life Support)', value: Math.round(state.resources[ResourceType.LifeSupport] * 10) / 10, key: ResourceType.LifeSupport },
    { label: 'PU', icon: icons.parts, tooltip: 'Part Units (Spare Parts)', value: state.resources[ResourceType.SpareParts], key: ResourceType.SpareParts },
    { label: 'SR', icon: icons.shield, tooltip: 'Shield Rating (Radiation Shielding)', value: state.resources[ResourceType.Shielding], key: ResourceType.Shielding },
    { label: 'MU', icon: icons.medical, tooltip: 'Med Units (Medical Supplies)', value: state.resources[ResourceType.Medical], key: ResourceType.Medical },
    { label: 'CR', icon: icons.budget, tooltip: 'Credits (Mission Budget)', value: state.resources[ResourceType.Budget], key: ResourceType.Budget },
  ];

  return (
    <div role="status" aria-live="polite" style={{
      fontFamily: FONTS.mono,
      fontSize: '12px',
      borderBottom: `1px solid ${COLORS.border}`,
      padding: '8px 12px',
      backgroundColor: COLORS.bgDark,
    }}>
      <h1 style={{
        color: COLORS.textDim,
        textAlign: 'center',
        letterSpacing: '1px',
        fontSize: '12px',
        fontWeight: 'normal',
        margin: '0 0 4px 0',
      }}>
        ═══ MISSION DAY {state.missionDay} │ PHASE: <span style={{ color: COLORS.highlight }}>{PHASE_LABELS[state.phase]}</span> │ TURN {state.turn}/{state.totalTurns > 0 ? state.totalTurns : '—'} │ <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>{icons.crewGroup} CREW: <span style={{ color: aliveCrew === totalCrew ? COLORS.healthy : COLORS.warning }}>{aliveCrew}/{totalCrew}</span></span> ═══
      </h1>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        {resources.map(r => (
          <span key={r.key} title={r.tooltip} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            {r.icon && <span style={{ display: 'inline-flex', color: COLORS.textDim }}>{r.icon}</span>}
            <span style={{ color: COLORS.textDim }}>{r.label}: </span>
            <span style={{ color: getResourceColor(r.value, RESOURCE_MAXES[r.key] || 100, COLORS) }}>
              {r.value}
            </span>
          </span>
        ))}
        <span style={{ color: COLORS.border }}>│</span>
        <span>
          <span style={{ color: COLORS.textDim }}>MORALE: </span>
          <span style={{ color: state.morale > 50 ? COLORS.healthy : state.morale > 25 ? COLORS.warning : COLORS.danger }}>
            {state.morale}
          </span>
        </span>
        <span style={{ color: COLORS.border }}>│</span>
        <span style={{ color: COLORS.info }}>
          <span style={{ color: COLORS.textDim }}>CONSUMPTION: </span>{CONSUMPTION_LABELS[state.consumptionLevel]}
        </span>
      </div>
    </div>
  );
}
