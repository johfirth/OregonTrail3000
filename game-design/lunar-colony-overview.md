# Lunar Colony 3000 — Game Overview

> **Status**: Review
> **Author**: Game Designer Agent
> **Last Updated**: 2026-04-14

---

## Elevator Pitch

**"It's 2026. You are the Mission Commander of Artemis VII — humanity's boldest mission yet. Your objective: fly a crew to the Moon's south pole, land safely, and establish the first permanent lunar colony. You have a fixed mission budget, a crew of specialists, and 240,000 miles of cold vacuum between you and history. Manage your resources, make impossible choices, survive catastrophic events, and — if you're lucky — plant humanity's flag on a new world. But remember: space doesn't forgive mistakes."**

Lunar Colony 3000 is an Oregon Trail-style text-based adventure game set in the near future of NASA's Artemis program. The classic mechanics of resource management, turn-based progression, and random events are reimagined for a crewed lunar mission — from launch at Kennedy Space Center to establishing a self-sustaining colony at the Moon's south pole.

---

## Core Experience Goals

1. **Strategic resource management** under extreme constraints — every kilogram matters in space
2. **Meaningful choices with real consequences** — crew lives depend on your decisions
3. **Authentic space mission feel** — grounded in real Artemis program data, landing sites, and technology
4. **Emergent storytelling** — random events + player choices = unique mission narratives every playthrough
5. **Dark humor in failure** — in the Oregon Trail tradition, death is memorable, quotable, and encourages replay
6. **Escalating tension** — each phase raises the stakes, culminating in the colony-or-bust final act

---

## Oregon Trail DNA — How the Classic Informs the New

This game inherits the soul of the original Oregon Trail (1978) while transplanting it to space:

| Oregon Trail (1978) | Lunar Colony 3000 | Design Rationale |
|---|---|---|
| Independence, MO → Oregon City | Kennedy Space Center → Lunar Colony | Journey as core structure |
| 2,040 miles by wagon | ~240,000 miles by spacecraft | Scale creates awe and isolation |
| Wagon purchase | Spacecraft configuration | Fixed asset that defines the journey |
| Oxen ($200–$300) | Propulsion System | Speed/efficiency trade-off |
| Food | Life Support (food, water, O₂) | Primary consumable, health dependency |
| Ammunition | Spare Parts & Tools | Enables hunting→EVA repair/extraction |
| Clothing | Radiation Shielding | Environmental protection for danger zones |
| Misc. Supplies | Medical & Science Equipment | Emergency medicine, prevents death |
| Cash | Mission Budget (reserve power) | Purchasing at forts→resupply at stations |
| Forts (every other turn) | ISS Flyby, Lunar Gateway | Resupply points with trade-offs |
| Hunting (typing mechanic) | EVA Missions (skill challenge) | Real-time skill injection |
| Riders/Bandits | Space Hazards (debris, flares, malfunctions) | Unpredictable threats requiring tactical response |
| Mountains (mile 950+) | Lunar Descent & Landing | Late-game difficulty spike |
| River crossings | Orbital Maneuvers (burns, docking) | Skill-gated progression |
| Illness | Radiation Sickness, Psych Stress | Health system with multiple failure modes |
| Weather | Solar Weather (CMEs, storms) | Environmental hazard system |
| "You have died of dysentery" | "Mission lost due to cascading O₂ failure" | Memorable failure states |
| Reaching Oregon City | Colony self-sustaining | Victory is earned, not guaranteed |

---

## Game Phases

The game progresses through **7 distinct phases**, each with unique challenges, available actions, and event pools:

### Phase 1: Mission Prep (The "Shopping" Phase)
- **Oregon Trail parallel**: Initial budget allocation
- Allocate mission budget across 6 resource categories
- Select crew composition (specialists with unique abilities)
- Zero-sum trade-offs — spending more on propulsion means less life support

### Phase 2: Launch & Earth Orbit
- **Oregon Trail parallel**: Departure from Independence
- Survive the launch sequence (potential abort scenarios)
- Systems check in low Earth orbit
- Decision: proceed to TLI or delay for additional checks (costs time/resources)

### Phase 3: Lunar Transit (The "Plains" Phase)
- **Oregon Trail parallel**: Cross-country travel with random events
- 3-day coast phase, turn-based
- Random events: solar flares, micrometeorites, equipment malfunctions, crew stress
- Resource consumption each turn
- ISS flyby opportunity for emergency resupply

### Phase 4: Lunar Orbit & Gateway
- **Oregon Trail parallel**: Arriving at a fort
- Dock with Lunar Gateway station — resupply at premium prices
- **Landing site selection** — choose from 13 real Artemis candidate sites
  - Each site has different risk/reward profiles (sunlight, ice access, terrain difficulty)
- Transfer crew to HLS lander

### Phase 5: Lunar Descent & Landing (The "Mountains" Phase)
- **Oregon Trail parallel**: Mountain passage difficulty spike
- Powered descent to chosen landing site
- Terrain hazards, fuel management, abort decisions
- Landing quality affects base construction phase

### Phase 6: Surface Operations (The "Final Stretch")
- **Oregon Trail parallel**: Last miles to Oregon City
- EVA missions for resource extraction (water ice mining, regolith collection)
- Base camp construction
- Lunar hazards: dust contamination, temperature extremes, radiation exposure
- Crew health and morale management

### Phase 7: Colony Establishment (Victory)
- **Oregon Trail parallel**: Arriving at Oregon City
- Final scoring based on: surviving crew, remaining resources, base quality, scientific achievements
- Colony viability assessment — do you have enough to sustain a permanent presence?
- Multiple victory tiers from "bare survival" to "thriving colony"

---

## Resource System

**6 core resources** (mapped from Oregon Trail's 6):

| Resource | Oregon Trail Equivalent | Unit | Purpose |
|---|---|---|---|
| **Propulsion** | Oxen | Fuel units | Travel speed, orbital maneuvers, landing fuel |
| **Life Support** | Food | Supply days | Food, water, oxygen — consumed every turn |
| **Spare Parts** | Ammunition | Part units | Repairs, EVA equipment, tools for extraction |
| **Shielding** | Clothing | Shield rating | Radiation protection, especially during solar events and surface ops |
| **Medical/Science** | Misc. Supplies | Med units | Treat illness/injury, prevents death, science experiments for bonus score |
| **Mission Budget** | Cash | Credits | Reserve for resupply at Gateway, emergency contingency |

---

## Win & Loss Conditions

### Victory (Colony Established)
- Reach the lunar surface with at least **2 surviving crew members**
- Have sufficient resources to construct a **habitable base**
- Achieve colony self-sufficiency score above threshold

### Victory Tiers
| Tier | Requirement | Description |
|---|---|---|
| 🏆 **Thriving Colony** | 4+ crew, high resources, all science objectives | "Houston, we have a colony!" |
| 🥈 **Sustainable Outpost** | 3+ crew, adequate resources | "It's not luxury, but it's home" |
| 🥉 **Bare Survival** | 2 crew, minimum resources | "We made it... barely" |

### Failure Modes (Death/Mission Loss)
| Failure | Oregon Trail Equivalent | Trigger |
|---|---|---|
| Life support depletion | Starvation | O₂, food, or water reaches 0 |
| Radiation exposure | Died of dysentery | Shielding depleted during solar event |
| Crew lost in EVA | Killed by riders | Failed EVA skill challenge |
| Spacecraft destruction | Wagon destroyed | Catastrophic equipment failure |
| Crash landing | Died in blizzard | Insufficient fuel for powered descent |
| All crew incapacitated | Died of injuries | Medical supplies depleted + illness |
| Mission budget exhausted | Can't afford doctor | No reserves when critical spending needed |
| Time limit exceeded | Blizzard at turn 20 | Mission window closes (orbital mechanics) |

### The "Funeral" Sequence (Oregon Trail Tradition)
When the mission fails, a darkly humorous debrief sequence plays:
- "Would you like a Congressional hearing?"
- "Would you like a memorial plaque on the Moon?"
- "Should we inform your next of kin?" → "Your mom already saw it on the livestream."
- Signed: **The Lunar Exploration Oversight Committee**

---

## Target Player Experience

The player should feel:
- **Phase 1**: Excited but anxious (so many choices, not enough budget)
- **Phase 2**: Tense (launch is scary, even in a game)
- **Phase 3**: Watchful (monitoring resources, dreading random events)
- **Phase 4**: Strategic (landing site selection is the biggest single decision)
- **Phase 5**: White-knuckle (everything rides on the landing)
- **Phase 6**: Determined (we made it, now we have to survive)
- **Phase 7**: Triumphant or devastated (did we make it?)

---

## Replayability

- **Randomized events** — different events each playthrough
- **13 landing sites** — each with unique characteristics and challenges
- **Multiple viable strategies** — heavy life support vs. heavy propulsion vs. balanced
- **Crew composition choices** — different specialists enable different approaches
- **Difficulty modes** — Cadet (easy), Astronaut (normal), Commander (hard), Ironman (no saves, maximum risk)
- **Scoring system** — encourages optimization and speedrunning

---

## References

- [Oregon Trail Mechanics Analysis](../.github/references/oregon-trail-analysis.md)
- [Text Adventure Design Patterns](../.github/references/text-adventure-design-patterns.md)
- [Original Oregon Trail Source](../.github/references/oregon-trail-original.bas)
- NASA Artemis Program data (landing sites, mission phases, ISRU technology)
