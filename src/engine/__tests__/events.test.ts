import { describe, it, expect } from 'vitest';
import { getEventsForPhase, rollEvent, applyEventEffects } from '../events';
import { createRng } from '../rng';
import { createInitialState } from '../state';
import {
  Phase,
  Difficulty,
  ResourceType,
  HealthStatus,
  EventCategory,
} from '../types';

describe('Event System (engine/events)', () => {
  const baseState = () =>
    createInitialState({
      difficulty: Difficulty.Astronaut,
      commanderName: 'Test',
      rngSeed: 42,
    });

  describe('getEventsForPhase', () => {
    it('returns events for LunarTransit phase', () => {
      const events = getEventsForPhase(Phase.LunarTransit);
      expect(events.length).toBeGreaterThan(0);
      for (const e of events) {
        expect(e.phases).toContain(Phase.LunarTransit);
      }
    });

    it('returns events for SurfaceOps phase', () => {
      const events = getEventsForPhase(Phase.SurfaceOps);
      expect(events.length).toBeGreaterThan(0);
      for (const e of events) {
        expect(e.phases).toContain(Phase.SurfaceOps);
      }
    });

    it('returns no events for MissionPrep', () => {
      const events = getEventsForPhase(Phase.MissionPrep);
      expect(events.length).toBe(0);
    });

    it('returns no events for Colony', () => {
      const events = getEventsForPhase(Phase.Colony);
      expect(events.length).toBe(0);
    });
  });

  describe('rollEvent', () => {
    it('can return null (no event)', () => {
      // With enough attempts, some seeds will produce no event
      let nullCount = 0;
      for (let seed = 0; seed < 50; seed++) {
        const state = { ...baseState(), phase: Phase.LunarTransit };
        const rng = createRng(seed);
        if (rollEvent(state, rng) === null) nullCount++;
      }
      expect(nullCount).toBeGreaterThan(0);
    });

    it('can return an event', () => {
      let eventCount = 0;
      for (let seed = 0; seed < 50; seed++) {
        const state = { ...baseState(), phase: Phase.LunarTransit };
        const rng = createRng(seed);
        if (rollEvent(state, rng) !== null) eventCount++;
      }
      expect(eventCount).toBeGreaterThan(0);
    });

    it('returns null for phases with no events', () => {
      const state = { ...baseState(), phase: Phase.MissionPrep };
      const rng = createRng(42);
      expect(rollEvent(state, rng)).toBeNull();
    });

    it('respects difficulty event probability multiplier', () => {
      // Cadet has lower event prob (0.7), Ironman higher (1.5)
      let cadetEvents = 0;
      let ironmanEvents = 0;
      const trials = 200;

      for (let seed = 0; seed < trials; seed++) {
        const cadetState = {
          ...createInitialState({ difficulty: Difficulty.Cadet, commanderName: 'T', rngSeed: seed }),
          phase: Phase.LunarTransit,
        };
        const ironmanState = {
          ...createInitialState({ difficulty: Difficulty.Ironman, commanderName: 'T', rngSeed: seed }),
          phase: Phase.LunarTransit,
        };
        if (rollEvent(cadetState, createRng(seed)) !== null) cadetEvents++;
        if (rollEvent(ironmanState, createRng(seed)) !== null) ironmanEvents++;
      }

      // Ironman should produce more events than Cadet
      expect(ironmanEvents).toBeGreaterThan(cadetEvents);
    });
  });

  describe('applyEventEffects', () => {
    it('applies resource effects', () => {
      const state = baseState();
      state.resources[ResourceType.SpareParts] = 10;

      const event = getEventsForPhase(Phase.LunarTransit).find(
        e => e.effects.some(eff => eff.type === 'RESOURCE' && eff.value < 0)
      );
      expect(event).toBeDefined();

      const result = applyEventEffects(state, event!);
      // Resources should have changed
      const changedResource = event!.effects.find(
        eff => eff.type === 'RESOURCE'
      );
      if (changedResource) {
        const rt = changedResource.target as ResourceType;
        expect(result.state.resources[rt]).toBeLessThan(10);
      }
    });

    it('applies morale effects', () => {
      const state = baseState();
      state.morale = 50;

      const event = getEventsForPhase(Phase.LunarTransit).find(
        e => e.effects.some(eff => eff.type === 'MORALE' && eff.value > 0)
      );

      if (event) {
        const result = applyEventEffects(state, event);
        expect(result.state.morale).toBeGreaterThan(50);
      }
    });

    it('clamps resources to 0 minimum', () => {
      const state = baseState();
      state.resources[ResourceType.SpareParts] = 0;

      const event = getEventsForPhase(Phase.LunarTransit).find(
        e => e.effects.some(
          eff => eff.type === 'RESOURCE' && eff.target === ResourceType.SpareParts && eff.value < 0
        )
      );

      if (event) {
        const result = applyEventEffects(state, event);
        expect(result.state.resources[ResourceType.SpareParts]).toBe(0);
      }
    });

    it('applies choice effects when choiceId provided', () => {
      const event = getEventsForPhase(Phase.LunarTransit).find(
        e => e.choices && e.choices.length > 0
      );
      expect(event).toBeDefined();
      expect(event!.choices!.length).toBeGreaterThanOrEqual(2);

      const state = baseState();
      state.resources[ResourceType.Shielding] = 10;
      state.resources[ResourceType.SpareParts] = 10;
      state.resources[ResourceType.Medical] = 10;

      const choice = event!.choices![0];
      const result = applyEventEffects(state, event!, choice.id, createRng(42));
      // Should produce narrative
      expect(result.narrative).toBeDefined();
    });

    it('clamps morale to 0–100', () => {
      const state = baseState();
      state.morale = 5;

      // Find a negative morale event
      const negEvent = getEventsForPhase(Phase.LunarTransit).find(
        e => e.effects.some(eff => eff.type === 'MORALE' && eff.value < -5)
      );
      if (negEvent) {
        const result = applyEventEffects(state, negEvent);
        expect(result.state.morale).toBeGreaterThanOrEqual(0);
      }

      // Test clamping at 100
      state.morale = 98;
      const posEvent = getEventsForPhase(Phase.LunarTransit).find(
        e => e.effects.some(eff => eff.type === 'MORALE' && eff.value > 5)
      );
      if (posEvent) {
        const result = applyEventEffects(state, posEvent);
        expect(result.state.morale).toBeLessThanOrEqual(100);
      }
    });
  });
});
