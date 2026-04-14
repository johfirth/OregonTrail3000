# Game Mechanics Template

> **Status**: Draft
> **Author**: [Agent Name]
> **Last Updated**: [Date]

## Overview

Brief description of the core game mechanics — resources, progression, scoring, difficulty, and player systems.

---

## Core Loop

Describe the fundamental gameplay loop that repeats throughout the game.

```
[Observe State] → [Make Decision] → [Resolve Outcome] → [Advance Time] → [Repeat]
```

### Turn Structure
1. Step 1: ...
2. Step 2: ...
3. Step N: ...

### Turn Duration
What does one turn represent in game-world time?

---

## Resource System

### Resources

| Resource | Unit | Starting Amount | Consumption Rate | Renewal Method | Depletion Consequence |
|----------|------|----------------|-----------------|----------------|----------------------|
| [Resource] | [Unit] | [Amount] | [Rate/turn] | [How to get more] | [What happens at 0] |

### Resource Interactions
Describe how resources affect each other:
- [Resource A] enables acquisition of [Resource B] (e.g., ammo enables hunting for food)
- [Resource C] affects rate of [Resource D] consumption
- etc.

### Initial Allocation
- **Total budget**: How much does the player start with?
- **Required purchases**: What must be bought?
- **Strategy space**: What different allocation strategies are viable?

---

## Progression System

### Distance/Journey
- **Total distance**: Start to finish
- **Speed calculation**: What determines travel speed?
- **Milestones**: Named landmarks or checkpoints

### Time
- **Calendar system**: How is time tracked?
- **Time limits**: Is there a deadline?
- **Seasonal effects**: Do seasons change gameplay?

### Difficulty Curve
Describe how difficulty changes over the course of the game:

| Phase | Distance Range | Difficulty | Key Challenges |
|-------|---------------|------------|----------------|
| Early | 0–X | Easy | Learning mechanics |
| Mid | X–Y | Medium | Resource management |
| Late | Y–Z | Hard | Survival pressure |

---

## Combat / Skill System

### Combat Mechanics
- How is combat initiated?
- What are the player's options?
- How is success/failure determined?
- What are the consequences?

### Skill Checks
- What skills are tested?
- How is difficulty scaled?
- What determines success?

---

## Trading System

### Where Can the Player Trade?
- Locations with trading
- Availability of goods
- Price variations

### Price Model
| Item | Base Price | Fort Price | Price Modifier |
|------|-----------|------------|----------------|
| [Item] | $X | $Y (×1.5) | [What affects price] |

### Trading Mechanics
- Can the player haggle?
- Are there trade-only items?
- Do prices change over time?

---

## Health / Survival System

### Health States
| State | Trigger | Effect | Recovery |
|-------|---------|--------|----------|
| Healthy | Default | Normal gameplay | N/A |
| [Condition] | [Cause] | [Impact] | [How to recover] |

### Death Conditions
List all ways the player can die/lose, in order of likelihood:
1. [Most common death]
2. [Second most common]
3. etc.

### Death Experience
How is death presented to the player? What makes it memorable rather than frustrating?

---

## Scoring System

### Score Components
| Component | Points | Condition |
|-----------|--------|-----------|
| [Achievement] | X pts | [How to earn] |

### Rating System
| Rating | Score Range | Description |
|--------|-----------|-------------|
| [Best] | X+ | [Description] |
| [Worst] | 0–Y | [Description] |

---

## Difficulty Options

| Difficulty | Description | Modifications |
|-----------|-------------|---------------|
| Easy | Forgiving journey | [What changes] |
| Normal | Balanced challenge | Default settings |
| Hard | Punishing survival | [What changes] |
| Ironman | No saves, harsh | [What changes] |

---

## Balance Targets

Key balance goals for playtesting:
- **Win rate target**: What percentage of skilled players should succeed?
- **Average journey length**: How many turns should a typical game last?
- **Resource tension**: When should the player feel most pressured?
- **Decision weight**: How much should choices matter vs. randomness?

---

## Player Experience

How should the mechanics feel? What player behaviors should be rewarded?

---

## Implementation Notes

- State machine design
- Random number generation approach
- Balance tuning parameters (externalize for easy adjustment)
- Save/load system requirements
- Data structures for resources, health, scoring

---

## References

- Related design documents
- Balance reference games
- Mathematical models
