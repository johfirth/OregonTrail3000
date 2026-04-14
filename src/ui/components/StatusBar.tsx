import React from 'react';
import type { GameState } from '../../engine/types';
import { ResourceType, ConsumptionLevel, Phase } from '../../engine/types';
import { COLORS, FONTS, getResourceColor } from '../styles';

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
  const aliveCrew = state.crew.filter((c: { isAlive: boolean }) => c.isAlive).length;
  const totalCrew = state.crew.length;

  const resources = [
    { label: 'FU', value: state.resources[ResourceType.Propulsion], key: ResourceType.Propulsion },
    { label: 'SD', value: Math.round(state.resources[ResourceType.LifeSupport] * 10) / 10, key: ResourceType.LifeSupport },
    { label: 'PU', value: state.resources[ResourceType.SpareParts], key: ResourceType.SpareParts },
    { label: 'SR', value: state.resources[ResourceType.Shielding], key: ResourceType.Shielding },
    { label: 'MU', value: state.resources[ResourceType.Medical], key: ResourceType.Medical },
    { label: 'CR', value: state.resources[ResourceType.Budget], key: ResourceType.Budget },
  ];

  return (
    <div style={{
      fontFamily: FONTS.mono,
      fontSize: '12px',
      borderBottom: `1px solid ${COLORS.border}`,
      padding: '8px 12px',
      backgroundColor: COLORS.bgPanel,
    }}>
      <div style={{
        color: COLORS.textDim,
        textAlign: 'center',
        marginBottom: '4px',
        letterSpacing: '1px',
      }}>
        ═══ MISSION DAY {state.missionDay} │ PHASE: {PHASE_LABELS[state.phase]} │ TURN {state.turn}/{state.totalTurns > 0 ? state.totalTurns : '—'} │ CREW: {aliveCrew}/{totalCrew} ═══
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        {resources.map(r => (
          <span key={r.key} style={{
            color: getResourceColor(r.value, RESOURCE_MAXES[r.key] || 100),
          }}>
            {r.label}: {r.value}
          </span>
        ))}
        <span style={{ color: COLORS.muted }}>│</span>
        <span style={{ color: state.morale > 50 ? COLORS.success : state.morale > 25 ? COLORS.warning : COLORS.danger }}>
          MORALE: {state.morale}
        </span>
        <span style={{ color: COLORS.muted }}>│</span>
        <span style={{ color: COLORS.textDim }}>
          {CONSUMPTION_LABELS[state.consumptionLevel]}
        </span>
      </div>
    </div>
  );
}
