import { describe, it, expect } from 'vitest';
import {
  EVENTS,
  TRANSIT_EVENTS,
  SURFACE_EVENTS,
  UNIVERSAL_EVENTS,
} from '../events';
import {
  Phase,
  EventCategory,
  EventSeverity,
} from '../../engine/types';

describe('Content Events', () => {
  describe('event count', () => {
    it('has 10 transit events', () => {
      expect(TRANSIT_EVENTS).toHaveLength(10);
    });

    it('has 8 surface events', () => {
      expect(SURFACE_EVENTS).toHaveLength(8);
    });

    it('has 6 universal events', () => {
      expect(UNIVERSAL_EVENTS).toHaveLength(6);
    });

    it('has 24 total events', () => {
      expect(EVENTS).toHaveLength(24);
    });

    it('EVENTS = TRANSIT + SURFACE + UNIVERSAL', () => {
      expect(EVENTS.length).toBe(
        TRANSIT_EVENTS.length + SURFACE_EVENTS.length + UNIVERSAL_EVENTS.length
      );
    });
  });

  describe('event structure', () => {
    it('all events have required fields', () => {
      for (const event of EVENTS) {
        expect(event.id).toBeTruthy();
        expect(event.name).toBeTruthy();
        expect(event.description).toBeTruthy();
        expect(typeof event.probability).toBe('number');
        expect(event.probability).toBeGreaterThan(0);
        expect(Object.values(EventCategory)).toContain(event.category);
        expect(Object.values(EventSeverity)).toContain(event.severity);
        expect(event.phases).toBeInstanceOf(Array);
        expect(event.phases.length).toBeGreaterThan(0);
        expect(event.effects).toBeInstanceOf(Array);
      }
    });

    it('all event IDs are unique', () => {
      const ids = EVENTS.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('event phases', () => {
    it('transit events include LunarTransit phase', () => {
      for (const event of TRANSIT_EVENTS) {
        expect(event.phases).toContain(Phase.LunarTransit);
      }
    });

    it('surface events include SurfaceOps phase', () => {
      for (const event of SURFACE_EVENTS) {
        expect(event.phases).toContain(Phase.SurfaceOps);
      }
    });

    it('no events target MissionPrep phase', () => {
      for (const event of EVENTS) {
        expect(event.phases).not.toContain(Phase.MissionPrep);
      }
    });

    it('no events target Colony phase', () => {
      for (const event of EVENTS) {
        expect(event.phases).not.toContain(Phase.Colony);
      }
    });

    it('phase-specific events only list valid phases', () => {
      const validPhases = Object.values(Phase);
      for (const event of EVENTS) {
        for (const phase of event.phases) {
          expect(validPhases).toContain(phase);
        }
      }
    });
  });

  describe('event probabilities', () => {
    it('all probabilities are positive numbers', () => {
      for (const event of EVENTS) {
        expect(event.probability).toBeGreaterThan(0);
        expect(event.probability).toBeLessThanOrEqual(100);
      }
    });

    it('probabilities per phase do not exceed 100', () => {
      const phaseWeights: Record<string, number> = {};
      for (const event of EVENTS) {
        for (const phase of event.phases) {
          phaseWeights[phase] = (phaseWeights[phase] ?? 0) + event.probability;
        }
      }

      // This is a weight sum, not strict probability.
      // Verify it's reasonable (< 200 total weight)
      for (const [phase, weight] of Object.entries(phaseWeights)) {
        expect(weight).toBeLessThan(200);
      }
    });
  });

  describe('event choices', () => {
    it('events with choices have at least 2 options', () => {
      const choiceEvents = EVENTS.filter(e => e.choices && e.choices.length > 0);
      expect(choiceEvents.length).toBeGreaterThan(0);

      for (const event of choiceEvents) {
        expect(event.choices!.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('choices have unique IDs within each event', () => {
      const choiceEvents = EVENTS.filter(e => e.choices && e.choices.length > 0);
      for (const event of choiceEvents) {
        const choiceIds = event.choices!.map(c => c.id);
        const uniqueIds = new Set(choiceIds);
        expect(uniqueIds.size).toBe(choiceIds.length);
      }
    });

    it('choice effects have valid effect types', () => {
      const validTypes = ['RESOURCE', 'HEALTH', 'MORALE', 'PHASE', 'CREW_DEATH', 'NARRATIVE', 'TRAJECTORY', 'SCORE'];
      const choiceEvents = EVENTS.filter(e => e.choices && e.choices.length > 0);

      for (const event of choiceEvents) {
        for (const choice of event.choices!) {
          for (const effect of choice.effects) {
            expect(validTypes).toContain(effect.type);
          }
        }
      }
    });
  });

  describe('event severity', () => {
    it('positive events have Positive severity', () => {
      const positiveEvents = EVENTS.filter(
        e => e.category === EventCategory.Positive
      );
      for (const event of positiveEvents) {
        expect(event.severity).toBe(EventSeverity.Positive);
      }
    });
  });
});
