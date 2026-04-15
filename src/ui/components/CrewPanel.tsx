import React from 'react';
import type { CrewMember } from '../../engine/types';
import { HealthStatus, CrewRole } from '../../engine/types';
import { useTheme } from '../hooks/useTheme';

interface CrewPanelProps {
  crew: CrewMember[];
}

export default function CrewPanel({ crew }: CrewPanelProps): React.ReactElement {
  const { COLORS, FONTS, BASE_STYLES, isRetro } = useTheme();

  const ROLE_ICONS: Record<CrewRole, string> = {
    [CrewRole.Commander]: isRetro ? '*' : '★',
    [CrewRole.Pilot]: isRetro ? '>' : '✈',
    [CrewRole.Engineer]: isRetro ? '#' : '⚙',
    [CrewRole.Scientist]: isRetro ? '+' : '⚗',
  };

  const HEALTH_COLORS: Record<HealthStatus, string> = {
    [HealthStatus.Healthy]: COLORS.healthy,
    [HealthStatus.Stressed]: COLORS.stressed,
    [HealthStatus.Ill]: COLORS.ill,
    [HealthStatus.Critical]: COLORS.critical,
    [HealthStatus.Dead]: COLORS.dead,
  };

  function HealthBar({ health, status }: { health: number; status: HealthStatus }): React.ReactElement {
    const color = HEALTH_COLORS[status];
    const barWidth = Math.max(0, Math.min(100, health));
    const segments = 10;
    const filled = Math.round(barWidth / 10);
    const bar = '█'.repeat(filled) + '░'.repeat(segments - filled);
    return (
      <span style={{ color, fontFamily: FONTS.mono, fontSize: '12px' }}>
        [{bar}] {health}%
      </span>
    );
  }
  return (
    <div style={{
      fontFamily: FONTS.mono,
      fontSize: '12px',
      padding: '8px',
      border: `1px solid ${COLORS.border}`,
      backgroundColor: COLORS.bgPanel,
      borderRadius: '4px',
    }}>
      <div style={{ color: COLORS.textDim, marginBottom: '6px', fontSize: '11px', textAlign: 'center', letterSpacing: '1px' }}>
        ─── CREW STATUS ───
      </div>
      {crew.map((member) => (
        <div
          key={member.id}
          style={{
            marginBottom: '8px',
            padding: '4px 0',
            borderBottom: `1px solid ${COLORS.border}`,
            opacity: member.isAlive ? 1 : 0.5,
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2px',
          }}>
            <span style={{
              color: member.isAlive ? COLORS.text : COLORS.dead,
              textDecoration: member.isAlive ? 'none' : 'line-through',
            }}>
              {ROLE_ICONS[member.role]} {member.name}
            </span>
            {!member.isAlive && <span>{isRetro ? '[X]' : '☠️'}</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              color: COLORS.info,
              fontSize: '11px',
              textTransform: 'uppercase',
            }}>
              {member.role}
            </span>
            <span style={{
              color: HEALTH_COLORS[member.healthStatus],
              fontSize: '11px',
              textTransform: 'uppercase',
            }}>
              {member.healthStatus}
            </span>
          </div>
          {member.isAlive && (
            <div style={{ marginTop: '2px' }}>
              <HealthBar health={member.health} status={member.healthStatus} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
