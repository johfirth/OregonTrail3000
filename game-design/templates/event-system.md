# Event System Template

> **Status**: Draft
> **Author**: [Agent Name]
> **Last Updated**: [Date]

## Overview

Brief description of the event system — how events are triggered, what types exist, and how they affect gameplay.

---

## Event Architecture

### Event Trigger Types
- **Random**: Drawn from a probability table each turn
- **Contextual**: Triggered by game state (location, resources, time)
- **Scheduled**: Occur at specific milestones or dates
- **Chain**: Follow-up events triggered by previous events
- **Player-initiated**: Result from player choices

### Event Resolution
How are event outcomes determined?
- Pure random?
- Player skill-based?
- Resource-dependent?
- Choice-based?

---

## Random Event Table

| ID | Event Name | Probability | Category | Severity | Description |
|----|-----------|-------------|----------|----------|-------------|
| E01 | [Event] | X% | [Category] | Low/Med/High | Brief description |

### Probability Distribution
- Total should equal 100%
- High-impact events should be rare
- Include at least one positive event
- Consider context-dependent probability modifications

---

## Event Categories

### Resource Events
Events that affect player resources (food, supplies, money, etc.)

#### [Event Name]
- **Trigger**: How/when this event occurs
- **Description**: Narrative text shown to the player
- **Effects**: Mechanical impact on game state
- **Player choices**: Options available (if any)
- **Outcomes**: Results of each choice
- **Probability modifiers**: What changes the likelihood

### Combat/Encounter Events
Events involving hostile or potentially hostile encounters

#### [Event Name]
- **Trigger**: How/when this event occurs
- **Description**: Narrative text
- **Threat assessment**: How dangerous is this?
- **Player options**: Fight, flee, negotiate, etc.
- **Resolution**: How each option plays out
- **Consequences**: Immediate and lasting effects

### Environmental Events
Weather, terrain, and natural hazard events

#### [Event Name]
- **Trigger**: Location, season, or random
- **Description**: Narrative text
- **Effects**: Impact on travel, resources, health
- **Mitigation**: Can the player reduce impact?
- **Duration**: One-time or ongoing?

### Story Events
Narrative events that advance the story or add flavor

#### [Event Name]
- **Trigger**: Milestone, location, or state
- **Description**: Full narrative text
- **Choices**: Player decisions and their consequences
- **Branching**: How does this affect the story?
- **Follow-up**: Any chain events triggered?

### Positive Events
Rare good fortune that helps the player

#### [Event Name]
- **Trigger**: Random or contextual
- **Description**: Narrative text
- **Benefit**: What the player gains
- **Frequency**: How often this should occur

---

## Event Chains

Describe sequences of events that connect across multiple turns.

### [Chain Name]
1. **Trigger event**: What starts the chain
2. **Follow-up events**: What happens next (with timing)
3. **Resolution**: How the chain concludes
4. **Player agency**: Can the player influence the chain?

---

## Decision Points

Major player decisions within events.

### Decision Design Principles
- Every decision should have meaningful trade-offs
- No option should be objectively "correct" in all situations
- Consequences should be proportional and logical
- Some consequences should be delayed (not immediately apparent)

### [Decision Name]
- **Context**: When does this decision appear?
- **Options**: What can the player choose?
- **Trade-offs**: What does each option cost/gain?
- **Hidden factors**: Any information the player doesn't have?
- **Long-term impact**: How does this affect the rest of the game?

---

## Player Experience

How should the event system feel? What emotions should events evoke?

---

## Implementation Notes

- Event data structure
- Probability engine requirements
- Event queue/stack management
- State tracking for chain events
- Event logging for narrative playback

---

## References

- Related design documents
- Historical event inspiration
- Probability and balance sources
