// ============================================================
// Artemis Trail — Content Loader
// Re-exports all game content and provides phase-based lookups.
// ============================================================

import { Phase, GameEvent } from '../engine/types';

export { EVENTS, TRANSIT_EVENTS, SURFACE_EVENTS, UNIVERSAL_EVENTS } from './events';
export { DEFAULT_CREW } from './crew';
export { NARRATIVE } from './narrative';

import { EVENTS } from './events';

/** Return all events valid for the given mission phase. */
export function getEventsForPhase(phase: Phase): GameEvent[] {
  return EVENTS.filter(e => e.phases.includes(phase));
}
