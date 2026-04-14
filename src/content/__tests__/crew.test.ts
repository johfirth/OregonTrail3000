import { describe, it, expect } from 'vitest';
import { DEFAULT_CREW } from '../crew';
import { CrewRole, HealthStatus } from '../../engine/types';

describe('Content: Default Crew', () => {
  it('has 3 non-commander crew members', () => {
    expect(DEFAULT_CREW).toHaveLength(3);
  });

  it('includes Pilot, Engineer, and Scientist roles', () => {
    const roles = DEFAULT_CREW.map(c => c.role);
    expect(roles).toContain(CrewRole.Pilot);
    expect(roles).toContain(CrewRole.Engineer);
    expect(roles).toContain(CrewRole.Scientist);
  });

  it('does not include Commander (added dynamically)', () => {
    const roles = DEFAULT_CREW.map(c => c.role);
    expect(roles).not.toContain(CrewRole.Commander);
  });

  it('all crew start healthy and alive', () => {
    for (const member of DEFAULT_CREW) {
      expect(member.health).toBe(100);
      expect(member.healthStatus).toBe(HealthStatus.Healthy);
      expect(member.isAlive).toBe(true);
      expect(member.turnsInState).toBe(0);
    }
  });

  it('all crew have names and special abilities', () => {
    for (const member of DEFAULT_CREW) {
      expect(member.name).toBeTruthy();
      expect(member.specialAbility).toBeTruthy();
    }
  });
});
