# Game Mechanics — Lunar Colony 3000

> **Status**: Draft
> **Author**: Game Design Agent
> **Last Updated**: 2025-07-14
> **Based on**: Oregon Trail (1978) mechanics analysis

## Overview

Lunar Colony 3000 is a text-based adventure game that adapts the Oregon Trail's proven mechanics — zero-sum resource allocation, weighted random events, risk-reward travel decisions, and escalating difficulty — into a NASA Artemis-style lunar mission. The player manages a 4-person crew from Earth to the lunar surface, allocating a fixed budget across six interdependent resources, navigating random hazards, and making survival decisions across 7 mission phases spanning 12–18 turns.

The game preserves the Oregon Trail's core design philosophy: meaningful scarcity, emergent narrative through randomization, and dark humor in failure — but replaces the frontier setting with hard science fiction grounded in real Artemis program hardware and mission profiles.

---

## Core Loop

The fundamental gameplay loop repeats each turn during active phases (Phases 2–6):

```
[Check Status] → [Phase Action] → [Resource Consumption] → [Random Event] → [Health Check] → [Advance Phase]
```

### Turn Structure (Per-Turn Sequence)

1. **Status Display** — Show current phase, turn number, crew health, all resource levels, and mission progress
2. **Medical Check** — If any crew member is Ill or Critical, auto-deduct 1 MU per affected crew member (if available); if MU = 0, condition worsens
3. **Phase Action** — Player makes the phase-specific decision (see Phase Actions below)
4. **Resource Consumption** — Deduct life support based on eating level; deduct propulsion for maneuvers; deduct other resources as applicable
5. **Random Event Roll** — Roll against the phase-specific event table (one event per turn)
6. **Health Check** — Evaluate crew health based on current resource levels, shielding, and event outcomes
7. **Phase Advance** — Check if phase completion conditions are met; if so, transition to next phase

### Turn Duration

| Phase | Turns | Time Per Turn | Total Phase Time |
|-------|-------|---------------|------------------|
| 1. Mission Prep | 0 (allocation) | N/A | N/A |
| 2. Launch | 1 | 8 hours | 8 hours |
| 3. Lunar Transit | 3 | 1 day | 3 days |
| 4. Gateway | 1–2 | 6 hours | 6–12 hours |
| 5. Descent | 1 | 2 hours | 2 hours |
| 6. Surface Ops | 5–8 | 1 day | 5–8 days |
| 7. Colony | 0 (scoring) | N/A | N/A |

**Total game length**: 11–15 active turns (target average: 13 turns on Astronaut difficulty)

---

## Resource System

### Budget & Allocation

- **Total mission budget**: 1000 credits (CR)
- **Pre-allocated**: 200 CR for spacecraft (non-negotiable — equivalent to Oregon Trail's $200 wagon)
- **Available for allocation**: 800 CR

The 200 CR spacecraft provides the baseline vehicle — a bare-minimum Orion capsule with no extras. All other resources must be purchased from the remaining 800 CR.

### Resource Table

| Resource | Oregon Trail Equiv | Unit | Min Purchase | Max Purchase | Cost per Unit | Starting Range | Consumption Rate | Renewal Method | Depletion Consequence |
|---|---|---|---|---|---|---|---|---|---|
| Propulsion | Oxen | Fuel Units (FU) | 200 CR | 400 CR | 1 CR = 1 FU | 200–400 FU | Variable by maneuver | Cannot renew | Mission abort / stranding |
| Life Support | Food | Supply Days (SD) | 0 CR | 400 CR | 5 CR = 1 SD | 0–80 SD | 0.5–1.5 SD/turn | EVA ice extraction | Crew death (starvation/suffocation) |
| Spare Parts | Ammunition | Part Units (PU) | 0 CR | 250 CR | 5 CR = 1 PU | 0–50 PU | Event-driven | Cannot renew (scarce) | Cannot repair; cascading failures |
| Shielding | Clothing | Shield Rating (SR) | 0 CR | 200 CR | 10 CR = 1 SR | 0–20 SR | Degrades with events | Minor EVA repair (+1 SR) | Radiation death |
| Medical/Science | Misc. Supplies | Med Units (MU) | 0 CR | 150 CR | 10 CR = 1 MU | 0–15 MU | Used on illness/injury | Cannot renew | Crew dies of treatable illness |
| Mission Budget | Cash | Credits (CR) | 0 CR | Remainder | 1:1 | 0–remaining | Spent at Gateway | Cannot renew | Cannot resupply at Gateway |

### Budget Allocation Strategies

The 800 CR budget creates a **zero-sum allocation problem** with three viable strategies:

| Strategy | Propulsion | Life Support | Spare Parts | Shielding | Medical | Reserve CR | Playstyle |
|----------|-----------|-------------|-------------|-----------|---------|------------|-----------|
| **Fuel-Heavy** | 350 CR | 200 CR | 100 CR | 80 CR | 50 CR | 20 CR | Safe maneuvers, tight supplies |
| **Balanced** | 250 CR | 250 CR | 125 CR | 80 CR | 50 CR | 45 CR | Moderate everything, some Gateway budget |
| **Supply-Heavy** | 200 CR | 300 CR | 100 CR | 100 CR | 60 CR | 40 CR | Minimum fuel, generous supplies |
| **Gambler** | 200 CR | 150 CR | 75 CR | 50 CR | 25 CR | 300 CR | Bare minimum, heavy Gateway resupply |

**Design insight**: Like the original's oxen-vs-food tradeoff, propulsion-vs-life-support is the central tension. More fuel means safer maneuvers but fewer supplies; more supplies mean longer survival but tighter fuel margins.

---

## Life Support Consumption

Life support is consumed every turn during active phases (2–6). The player chooses a consumption level at the start of each turn, mirroring Oregon Trail's eating choices:

| Level | Oregon Trail Equiv | SD/Turn | Illness Modifier | Description |
|-------|-------------------|---------|-------------------|-------------|
| **Rationing** | Eating Poorly | 0.5 SD | ×2.0 illness probability | Crew is hungry, cold, miserable. O₂ recyclers at minimum. |
| **Standard** | Eating Moderately | 1.0 SD | ×1.0 illness probability | Normal consumption. Adequate food, water, air. |
| **Generous** | Eating Well | 1.5 SD | ×0.5 illness probability | Full meals, comfortable temperature, maximum O₂. |

### Life Support Math

A typical game lasts 13 turns. Life support needs at each level:

| Level | SD Needed (13 turns) | CR Cost | % of Budget |
|-------|---------------------|---------|-------------|
| Rationing always | 6.5 SD | 33 CR | 4% |
| Standard always | 13.0 SD | 65 CR | 8% |
| Generous always | 19.5 SD | 98 CR | 12% |
| Mixed (generous early, ration late) | ~13 SD | 65 CR | 8% |

**Design insight**: Life support is affordable if things go well. The tension comes from random events destroying supplies, EVA failures, and the need to stretch supplies when the unexpected happens.

### Life Support Renewal — Ice Extraction

During Surface Ops (Phase 6), the player can attempt EVA ice extraction instead of other EVA activities:

- **Requires**: 2+ PU (spare parts for extraction equipment)
- **Consumes**: 2 PU per attempt
- **Base yield**: 3 SD on success
- **Modified by landing site ice access rating** (see Landing Site Selection)
- **Risk**: Standard EVA risk applies (see EVA System)

---

## Propulsion & Travel

Propulsion (FU) is the most strategically critical resource. Unlike life support, it **cannot be renewed** — every fuel unit spent is gone forever.

### Maneuver Fuel Costs

| Maneuver | Phase | Base FU Cost | Minimum FU | Notes |
|----------|-------|-------------|------------|-------|
| Trans-Lunar Injection (TLI) | 2: Launch | 80 FU | 60 FU | Below 60 = launch abort |
| Course Correction 1 | 3: Transit (Turn 1) | 15 FU | 5 FU | Less fuel = wider trajectory error |
| Course Correction 2 | 3: Transit (Turn 2) | 15 FU | 5 FU | Compounds error from CC1 |
| Course Correction 3 | 3: Transit (Turn 3) | 10 FU | 0 FU | Optional; fixes accumulated error |
| Lunar Orbital Insertion | 4: Gateway | 50 FU | 40 FU | Below 40 = emergency insertion (+10 SR damage) |
| Gateway Docking | 4: Gateway | 5 FU | 3 FU | Below 3 = docking damage (-2 PU) |
| Descent Burn | 5: Descent | 60 FU | 45 FU | Below 45 = crash risk (see Descent) |
| Landing Abort (if needed) | 5: Descent | 40 FU | 40 FU | Only if descent fails; returns to Gateway |
| **Total (no abort)** | — | **235 FU** | **158 FU** | — |
| **Total (with abort)** | — | **275 FU** | **198 FU** | — |

### Fuel Margin & Safety

| Propulsion Spend | Total FU | Margin over Minimum | Safety Rating |
|-----------------|----------|--------------------:|---------------|
| 200 CR | 200 FU | 42 FU (no abort) | Tight — no abort possible |
| 250 CR | 250 FU | 92 FU (no abort) | Moderate — abort possible |
| 300 CR | 300 FU | 142 FU (no abort) | Comfortable — room for errors |
| 400 CR | 400 FU | 202 FU (no abort) | Luxurious — full abort + extra |

### Propulsion Quality (Oregon Trail Oxen Analogy)

Higher propulsion spend improves maneuver quality, reducing the chance of complications:

```
maneuver_quality = fuel_spent / base_cost
if maneuver_quality >= 1.0: complication_chance = 5%
if maneuver_quality >= 0.8: complication_chance = 15%
if maneuver_quality >= 0.6: complication_chance = 35%
if maneuver_quality < 0.6:  complication_chance = 60%
```

**Complications** include: trajectory drift (costs extra fuel next correction), system strain (-1 PU), crew stress (health impact), and shielding wear (-1 SR).

---

## Phase-by-Phase Breakdown

### Phase 1: Mission Prep (Allocation Phase)

**Turns**: 0 (not turn-based)
**Player action**: Allocate 800 CR across 5 resources + reserve credits

**Sequence**:
1. Display mission briefing and resource descriptions
2. Player allocates budget to each resource category
3. Player selects difficulty mode
4. Player names 4 crew members (Commander, Pilot, Engineer, Scientist)
5. Confirm allocation — no changes after this point

**Design insight**: Like Oregon Trail's opening store, this is where the game is often won or lost. The allocation creates the strategic framework for every subsequent decision.

### Phase 2: Launch (1 Turn)

**Turns**: 1
**Phase action**: Choose launch profile

| Profile | FU Cost | Complication Chance | Description |
|---------|---------|--------------------:|-------------|
| Conservative | 90 FU | 5% | Extended pre-launch checks, optimal window |
| Standard | 80 FU | 12% | Normal launch sequence |
| Aggressive | 65 FU | 25% | Compressed timeline, saves fuel |

**Launch complications** (rolled if complication triggers):
| Roll (d100) | Event | Effect |
|-------------|-------|--------|
| 01–30 | Engine vibration | -2 PU (spare parts used for repair) |
| 31–55 | Hold for weather | +5 FU extra burn (delayed window) |
| 56–75 | Partial thrust | +10 FU extra to compensate |
| 76–90 | Minor debris strike | -1 SR (shielding absorbs impact) |
| 91–100 | System malfunction | -3 PU, -1 SR; 1 crew member → Stressed |

**Launch abort** (FU below minimum): Mission ends immediately. Score = 0.

### Phase 3: Lunar Transit (3 Turns)

**Turns**: 3 (one per day of transit)
**Phase action per turn**: Choose course correction fuel allocation

Each turn, the player decides how much fuel to spend on course correction (minimum through maximum). This is the most Oregon Trail-like travel mechanic:

```
trajectory_error = base_error - (fuel_spent / base_cost × 10) + random(-3, 3)
```

Starting trajectory error = 10. Each correction reduces it. Error compounds if uncorrected.

| Trajectory Error at End of Transit | Effect |
|-----------------------------------:|--------|
| 0–3 | Clean orbital insertion (no penalty) |
| 4–7 | Rough insertion (+10 FU cost at Gateway) |
| 8–12 | Emergency insertion (+20 FU, -2 SR) |
| 13+ | Miss lunar orbit — mission failure |

**Transit Random Events** (one per turn, 60% chance of event):

| Event | Probability | Effect |
|-------|------------:|--------|
| Solar flare warning | 15% | Choose: shelter (lose 1 turn action) or risk (-2 SR, crew stress) |
| Micrometeorite impact | 10% | -1 to -3 SR (roll severity); if SR = 0, hull breach → loss of 3 SD |
| Equipment malfunction | 15% | -1 to -2 PU for repair; if PU = 0, system degraded permanently |
| Crew conflict | 10% | 1 crew member → Stressed; choice to intervene (costs 1 MU) or ignore (may worsen) |
| Beautiful Earth view | 5% | Morale boost: all Stressed crew → Healthy |
| Communications delay | 10% | No event resolution bonus this turn |
| Food contamination | 8% | Lose 2 SD |
| Navigation computer glitch | 7% | +3 trajectory error unless 2 PU spent to fix |
| No event | 40% | — |

**Design note**: Transit is low-to-medium difficulty. It introduces the event system gradually while the player still has resources.

### Phase 4: Gateway Station (1–2 Turns)

**Turns**: 1 (docking only) or 2 (docking + resupply)
**Phase action**: Choose whether to resupply at Gateway

Gateway Station is the **fort** equivalent from Oregon Trail. It's the last chance to buy supplies before the dangerous final phases.

**Docking** (Turn 1):
- Costs 5 FU (minimum 3 FU)
- Orbital insertion costs apply based on trajectory error (see Transit)

**Resupply** (Turn 2, optional — costs 1 extra turn):
- Resupply uses reserved Mission Budget credits (CR)
- **All prices at Gateway are 1.5× base cost** (identical to Oregon Trail's fort markup)

| Resource | Base Price | Gateway Price (×1.5) | Unit |
|----------|----------:|---------------------:|------|
| Life Support | 5 CR/SD | 8 CR/SD | Supply Days |
| Spare Parts | 5 CR/PU | 8 CR/PU | Part Units |
| Shielding | 10 CR/SR | 15 CR/SR | Shield Rating |
| Medical | 10 CR/MU | 15 CR/MU | Med Units |
| Propulsion | — | **Not available** | — |

**Medical treatment at Gateway**: 20 CR per crew member (cures any condition up to Critical → Stressed). Equivalent to Oregon Trail's $20 doctor bill.

**Gateway Random Events** (low severity — this is a safe harbor):

| Event | Probability | Effect |
|-------|------------:|--------|
| Supply shortage | 15% | One random resource unavailable for purchase |
| Bargain supplies | 10% | One random resource at base price (no markup) |
| News from Earth | 20% | Flavor text + morale boost (1 Stressed crew → Healthy) |
| Station maintenance delay | 10% | Must take 2nd turn (forced resupply opportunity) |
| No event | 45% | — |

**Design insight**: Like Oregon Trail's forts, Gateway creates a strategic dilemma. Stopping costs a turn but may be essential for survival. Players who reserved credits can resupply; those who spent everything must press on with what they have.

### Phase 5: Descent (1 Turn)

**Turns**: 1
**Phase action**: Execute landing sequence

This is the **mountain passage** equivalent — a difficulty spike that tests whether the player's resource management was adequate.

**Descent sequence**:
1. Player chooses fuel allocation for descent burn (45–80 FU)
2. Landing site modifiers applied (see Landing Site Selection)
3. Roll for landing outcome

```
landing_score = (fuel_spent / 60 × 50) + (spare_parts × 2) + site_terrain_bonus + random(-10, 10)
```

| Landing Score | Outcome | Effect |
|--------------:|---------|--------|
| 80+ | Perfect landing | No penalties; +50 bonus score |
| 60–79 | Nominal landing | -1 PU from landing stress |
| 40–59 | Hard landing | -3 PU, -1 SR, 1 crew → Stressed |
| 20–39 | Rough landing | -5 PU, -2 SR, 2 crew → Ill, lose 3 SD |
| 0–19 | Crash landing | -8 PU, -4 SR, all crew → Critical, lose 5 SD |
| Below 0 | Catastrophic crash | Mission failure — all crew killed |

**Landing abort**: If the player has 40+ FU remaining after the descent burn, they may abort and return to Gateway. This costs 40 FU and adds 2 turns (return + re-attempt). Landing abort is only available once.

**Design insight**: Descent is the single highest-stakes turn in the game. Underfueled players face a real risk of crash landing. This mirrors Oregon Trail's mountain crossing — a moment where earlier decisions come due.

### Phase 6: Surface Operations (5–8 Turns)

**Turns**: 5 base + 0–3 bonus turns (based on landing quality and remaining resources)
**Phase action per turn**: Choose activity

This is the **most Oregon Trail-like phase** — repeating turns of resource management, random events, and survival decisions.

**Turn count calculation**:
```
base_turns = 5
bonus_turns = floor(remaining_FU / 30)  // extra fuel enables longer stay
max_turns = min(base_turns + bonus_turns, 8)
actual_turns = min(max_turns, remaining_SD / consumption_rate)  // can't stay without supplies
```

**Activity choices** (one per turn):

| Activity | Requirements | Effect | Risk |
|----------|-------------|--------|------|
| EVA: Ice Extraction | 2+ PU | +3 SD (modified by site) | EVA risk |
| EVA: Equipment Repair | 3+ PU | +2 SR or +1 PU | EVA risk |
| EVA: Science Mission | 1+ PU | +100–200 score points | EVA risk |
| Shelter in Habitat | None | No consumption bonus, safe | No risk |
| Medical Treatment | 1+ MU | Cure 1 crew member (Ill→Stressed or Critical→Ill) | None |

**Surface Random Events** (one per turn, 70% chance of event):

| Event | Probability | Effect |
|-------|------------:|--------|
| Lunar dust contamination | 12% | -1 PU (filters clogged); if PU=0, 1 crew → Ill |
| Solar radiation spike | 10% | -1 to -2 SR; if SR=0, all crew → Ill (radiation sickness) |
| Temperature extreme (hot) | 8% | +0.5 SD extra consumption this turn |
| Temperature extreme (cold) | 8% | +0.5 SD extra consumption this turn |
| Equipment failure | 10% | -2 PU; if PU=0, lose 1 SD per turn ongoing |
| Psychological stress | 8% | 1 crew → Stressed; choice: use 1 MU to counsel or ignore |
| Moonquake | 5% | -1 SR, -1 PU; 10% chance of habitat damage (lose 2 SD) |
| Stunning discovery | 5% | +150 score points; crew morale boost |
| Dust storm | 7% | EVA cancelled if attempted; no other effect |
| Communication blackout | 5% | No event resolution bonus; crew stress (1 → Stressed) |
| Supply cache found | 2% | +2 SD, +1 PU (emergency supplies from previous mission) |
| No event | 30% | — |

**Surface phase ends when**:
- All turns completed, OR
- Life support depleted (SD = 0) — triggers emergency evacuation attempt, OR
- All crew incapacitated (Critical or Dead) — mission failure

### Phase 7: Colony Establishment (Scoring Phase)

**Turns**: 0 (not turn-based)

If the crew survives Surface Ops, the colony is considered established. Final scoring is calculated (see Scoring System).

**Victory message** includes:
- Colony viability assessment
- Crew status report
- Resource inventory
- Science achievements
- Final score and rating

---

## Landing Site Selection

Before Phase 5 (Descent), the player selects a landing site from 5 candidates. Each site has four ratings on a 1–5 scale that affect gameplay for the rest of the mission.

| Site | Sunlight | Ice Access | Terrain | Comms | Inspired By |
|------|:--------:|:----------:|:-------:|:-----:|-------------|
| **Shackleton Rim** | 5 | 4 | 2 | 4 | Shackleton Crater rim |
| **Nobile Valley** | 3 | 5 | 3 | 3 | Nobile Crater region |
| **Malapert Summit** | 4 | 2 | 4 | 5 | Malapert Mountain |
| **Haworth Basin** | 2 | 5 | 3 | 2 | Haworth Crater |
| **de Gerlache Ridge** | 4 | 3 | 5 | 3 | de Gerlache Crater |

### Rating Effects

**Sunlight** (Solar Power → Life Support Efficiency):
```
daily_sd_bonus = (sunlight - 3) × 0.1  // range: -0.2 to +0.2 SD/turn
```
- Rating 5: -0.2 SD/turn consumption (solar panels supplement life support)
- Rating 1: +0.2 SD/turn consumption (must use more stored power)

**Ice Access** (Water Extraction → Life Support Renewal):
```
ice_extraction_yield = base_3_SD + (ice_access - 3) × 1  // range: 1 to 5 SD per EVA
```
- Rating 5: 5 SD per ice extraction EVA
- Rating 1: 1 SD per ice extraction EVA

**Terrain** (Landing Difficulty → Crash Risk):
```
terrain_landing_bonus = (terrain - 3) × 5  // range: -10 to +10 to landing score
```
- Rating 5: +10 to landing score (flat, clear terrain)
- Rating 1: -10 to landing score (rough, boulder-strewn)

**Comms** (Earth Contact → Event Resolution):
```
if comms >= 4: event_severity_reduction = 1 level (e.g., -2 PU becomes -1 PU)
if comms <= 2: 20% chance of event severity increase by 1 level
```

### Site Strategy

| Site | Best For | Worst For | Win Rate (Astronaut) |
|------|----------|-----------|---------------------:|
| Shackleton Rim | Long stays (power) | Landing (rough terrain) | 42% |
| Nobile Valley | Ice extraction | Power / comms | 38% |
| Malapert Summit | Landing + comms | Ice extraction | 40% |
| Haworth Basin | Ice extraction | Power + comms | 35% |
| de Gerlache Ridge | Safe landing | Ice extraction | 41% |

---

## EVA System (Replaces Hunting)

EVA (Extra-Vehicular Activity) replaces Oregon Trail's hunting mechanic. Like hunting, it's a **skill challenge** that risks resources for potential gain.

### EVA Requirements

- **Minimum spare parts**: 1 PU (like needing 40+ bullets to hunt)
- **Crew requirement**: At least 1 crew member Healthy or Stressed (not Ill/Critical)
- **Phase**: Only available during Surface Ops (Phase 6)

### EVA Skill Challenge

The EVA uses a **typing speed mechanic** that mirrors the original Oregon Trail's hunting:

1. Display a technical command sequence (e.g., "DEPLOY DRILL", "SEAL BREACH", "EXTRACT CORE")
2. Player must type it correctly within a time limit
3. Response time and accuracy determine outcome

| Response Time | Accuracy | Outcome | Resource Gain | Parts Used |
|--------------|----------|---------|--------------|------------|
| Fast (≤ 2s) | Perfect | "Textbook EVA!" | Full yield | 1 PU |
| Medium (≤ 5s) | Perfect | "Successful EVA" | 75% yield | 1 PU |
| Slow (≤ 10s) | Perfect | "Completed with difficulty" | 50% yield | 2 PU |
| Any | Typo | "Equipment fumble" | 25% yield | 2 PU |
| Timeout (>10s) | — | "EVA aborted" | 0% yield | 1 PU (wasted) |

### EVA Risk Table

Every EVA carries inherent risk, rolled after the skill challenge:

| Roll (d100) | Event | Probability | Effect |
|-------------|-------|------------:|--------|
| 01–70 | No incident | 70% | EVA proceeds normally |
| 71–80 | Suit pressure warning | 10% | EVA cut short; 50% yield only |
| 81–88 | Regolith in joints | 8% | -1 PU (suit repair needed) |
| 89–93 | Minor injury | 5% | EVA crew member → Stressed |
| 94–97 | Serious injury | 4% | EVA crew member → Ill; requires 1 MU |
| 98–99 | Critical suit failure | 2% | EVA crew member → Critical; requires 2 MU |
| 00 | Fatal accident | 1% | EVA crew member → Dead |

### EVA Yield by Activity

| Activity | Full Yield | Modified By |
|----------|-----------|-------------|
| Ice Extraction | +3 SD | Landing site ice access rating |
| Equipment Repair | +2 SR or +1 PU (player choice) | Nothing |
| Science Mission | +150 score points | Landing site sunlight rating (±30 pts) |

**Design insight**: Like Oregon Trail's hunting, EVAs create a risk-reward choice. The player needs the resources but every EVA risks losing crew. The typing mechanic preserves the original's real-time skill injection into turn-based gameplay.

---

## Health System

### Crew

The player commands a 4-person crew:
1. **Commander** — if killed, all event severity +1 level
2. **Pilot** — if killed, all maneuver complication chance +15%
3. **Engineer** — if killed, all repair costs +1 PU
4. **Scientist** — if killed, science EVA score -50%

### Health States

Each crew member has an independent health state:

| State | Severity | Effect on Gameplay | Recovery |
|-------|:--------:|-------------------|----------|
| **Healthy** | 0 | Full capability | — |
| **Stressed** | 1 | 10% chance of error on skill challenges | Rest (2 turns of Shelter) or 1 MU |
| **Ill** | 2 | Cannot participate in EVAs; +0.25 SD/turn (extra care) | 1 MU (→ Stressed) |
| **Critical** | 3 | Cannot act; +0.5 SD/turn; will die in 2 turns without treatment | 2 MU (→ Ill) or Gateway medical (20 CR → Stressed) |
| **Dead** | 4 | Permanent. Crew member lost. | None |

### Health State Transitions

```
Healthy → Stressed     (stress events, minor injuries, rationing)
Stressed → Ill         (untreated stress + illness event, or severe event)
Ill → Critical         (untreated illness after 2 turns, or catastrophic event)
Critical → Dead        (untreated critical after 2 turns, or fatal event)

Recovery (requires MU or rest):
Stressed → Healthy     (1 MU or 2 turns of Shelter activity)
Ill → Stressed         (1 MU)
Critical → Ill         (2 MU)
Critical → Stressed    (Gateway medical, 20 CR)
```

### Illness Types

| Illness | Trigger | Severity | Special Effect |
|---------|---------|----------|---------------|
| **Radiation sickness** | SR = 0 during solar event | Ill or Critical | Ongoing: -1 health level per 2 turns until treated |
| **Decompression injury** | Hull breach event | Critical | Requires 2 MU + 2 PU (suit repair) |
| **Psychological breakdown** | 3+ turns of Rationing or 2+ Stressed crew | Ill | Cannot be treated with MU alone; requires Shelter turn |
| **Dust inhalation** | Lunar dust event with PU = 0 | Stressed or Ill | -0.5 SD/turn (extra filtration needed) |
| **Physical injury** | EVA accident, hard landing | Stressed to Critical | Standard MU treatment |
| **Hypothermia** | Temperature extreme + low SD | Stressed or Ill | +0.5 SD/turn until treated |

### Illness Probability per Turn

Base illness probability modified by consumption level and current conditions:

```
base_illness_chance = 8%
modified_chance = base_illness_chance × eating_modifier × condition_modifier

eating_modifier:
  Rationing:  ×2.0 (16% base)
  Standard:   ×1.0 (8% base)
  Generous:   ×0.5 (4% base)

condition_modifier:
  SR = 0:     ×2.0 (radiation exposure)
  SR ≤ 3:     ×1.3 (degraded shielding)
  PU = 0:     ×1.5 (can't maintain systems)
  Each Ill crew: ×1.1 (cross-contamination)
```

---

## Death & Failure Modes

### Mission Failure Conditions

Listed in order of expected frequency (Astronaut difficulty):

| # | Failure Mode | Trigger | Expected Frequency | Oregon Trail Equiv |
|---|-------------|---------|-------------------:|-------------------|
| 1 | **Life support depletion** | SD = 0 for 1 turn with no EVA possible | ~35% of failures | Starvation |
| 2 | **Crash landing** | Landing score < 0 | ~18% of failures | N/A (new) |
| 3 | **Radiation exposure** | SR = 0 + solar event + no shelter | ~12% of failures | Freezing (clothing) |
| 4 | **All crew incapacitated** | All 4 crew Critical or Dead | ~10% of failures | General death |
| 5 | **Spacecraft destruction** | Catastrophic random event (rare) | ~8% of failures | Massacre |
| 6 | **EVA accident cascade** | Multiple fatal EVA rolls | ~7% of failures | N/A (new) |
| 7 | **Mission window expired** | Turn count exceeds 18 total | ~5% of failures | Blizzard (time limit) |
| 8 | **Budget crisis** | CR = 0 at Gateway + critical resource at 0 | ~5% of failures | Cash depletion |

### Death Sequence (Dark Humor — Oregon Trail Tradition)

When the mission fails, the game presents a **darkly humorous debriefing** in the Oregon Trail tradition:

**Life Support Depletion**:
> "MISSION CONTROL: We've lost telemetry from Lunar Colony 3000."
> "Would you like us to name the crater after your crew? (Y/N)"
> If Y: "Crater [Commander Name] has a nice ring to it."
> If N: "We'll just call it 'Budget Oversight Basin' then."

**Crash Landing**:
> "CAPCOM: That landing was... suboptimal."
> "Would you like to file an insurance claim? (Y/N)"
> If Y: "Your premium has been adjusted to $∞/month."
> If N: "Smart move. The deductible was 1 lunar lander."

**All Crew Incapacitated**:
> "FLIGHT SURGEON: The crew is... resting."
> "Shall we send a get-well card? (Y/N)"
> If Y: "Delivery time: 3 days. The crew has 0."
> If N: "Your Aunt Sadie at Mission Control is really worried about you."

**Design insight**: The original Oregon Trail's death sequence (minister, fancy funeral, Aunt Sadie) is one of its most memorable elements. These callbacks preserve the dark humor tradition while fitting the space setting.

---

## Scoring System

### Score Components

Scoring occurs at mission completion (Phase 7) if the crew survives Surface Ops.

| Component | Points | Calculation | Max Possible |
|-----------|-------:|-------------|-------------:|
| **Surviving Crew** | 250 per crew | 250 × surviving_count | 1000 |
| **Crew Health Bonus** | 50 per Healthy crew | 50 × healthy_count | 200 |
| **Remaining Life Support** | 10 per SD | 10 × remaining_SD | ~400 |
| **Remaining Spare Parts** | 15 per PU | 15 × remaining_PU | ~300 |
| **Remaining Shielding** | 20 per SR | 20 × remaining_SR | ~200 |
| **Remaining Medical** | 25 per MU | 25 × remaining_MU | ~200 |
| **Remaining Fuel** | 5 per FU | 5 × remaining_FU | ~400 |
| **Science EVAs** | 150 per EVA | 150 × science_EVAs_completed | ~600 |
| **Landing Quality** | 0–50 | Based on landing score | 50 |
| **Site Difficulty** | 0–100 | (6 - avg_site_rating) × 25 | 100 |
| **Speed Bonus** | 20 per turn under 13 | 20 × max(0, 13 - total_turns) | 60 |
| **No Deaths Bonus** | 500 | All 4 crew alive | 500 |

**Theoretical maximum**: ~4010 points (practically impossible)
**Expected range (Astronaut)**: 800–2500 points

### Rating System

| Rating | Score Range | Title | Description |
|--------|----------:|-------|-------------|
| **S** | 3000+ | "One Giant Leap" | Near-perfect mission; all crew healthy, objectives complete |
| **A** | 2200–2999 | "Mission Success" | Excellent mission with minor setbacks |
| **B** | 1500–2199 | "Colony Established" | Solid performance; colony is viable |
| **C** | 1000–1499 | "Survived" | Colony is marginal; significant losses |
| **D** | 500–999 | "Barely Made It" | Colony needs immediate resupply from Earth |
| **F** | 0–499 | "Pyrrhic Victory" | Technically survived; colony won't last long |

---

## Difficulty Modes

| Mode | Budget | Event Frequency | Crew Resilience | Illness Base % | Description |
|------|-------:|:-:|:-:|:-:|---|
| **Cadet** | 1200 CR | 70% of normal | +50% health (3 turns to worsen instead of 2) | 5% | Learning mode — generous budget, forgiving events |
| **Astronaut** | 1000 CR | 100% (normal) | Normal (2 turns to worsen) | 8% | Balanced challenge — the intended experience |
| **Commander** | 800 CR | 130% of normal | -25% health (worsens in 1.5 turns, rounded) | 12% | For experienced players — tight margins |
| **Ironman** | 800 CR | 150% of normal | -50% health (worsens in 1 turn) | 15% | No saves, maximum challenge, instant escalation |

### Difficulty Modifiers (Detailed)

| Parameter | Cadet | Astronaut | Commander | Ironman |
|-----------|------:|----------:|----------:|--------:|
| Starting budget | 1200 CR | 1000 CR | 800 CR | 800 CR |
| Spacecraft pre-cost | 200 CR | 200 CR | 200 CR | 200 CR |
| Available budget | 1000 CR | 800 CR | 600 CR | 600 CR |
| Event probability multiplier | ×0.7 | ×1.0 | ×1.3 | ×1.5 |
| Turns before health worsens | 3 | 2 | 2 (but 50% chance at 1) | 1 |
| EVA accident probability | ×0.5 | ×1.0 | ×1.3 | ×1.5 |
| Gateway prices | ×1.25 | ×1.5 | ×1.75 | ×2.0 |
| Landing score bonus | +10 | +0 | -10 | -15 |
| Surface turns base | 6 | 5 | 5 | 4 |
| Save/load allowed | Yes | Yes | Yes | No |

---

## Difficulty Curve by Phase

| Phase | Base Event Severity | Resource Pressure | New Hazards Introduced | Player Tension |
|-------|:-------------------:|:-----------------:|----------------------|:--------------:|
| 1. Mission Prep | None | Low (choosing) | N/A | Low — excitement/planning |
| 2. Launch | Medium | Low | Abort scenarios, system failures | Medium — anticipation |
| 3. Transit | Low–Medium | Building | Solar flares, debris, trajectory drift | Medium — growing anxiety |
| 4. Gateway | Low (resupply) | Relief / tension | Premium pricing, supply shortages | Medium — strategic decision |
| 5. Descent | **HIGH** | **Critical** | Terrain, fuel margin, crash risk | **Very High** — peak moment |
| 6. Surface | Medium–High | Sustained | Dust, radiation, temperature, quakes | High — sustained pressure |
| 7. Colony | Scoring | Final tally | N/A | Resolution — relief or despair |

### Resource Tension Graph (Typical Astronaut Game)

```
Tension
  ▲
5 │                              ████
4 │                         ████ ████ ████
3 │                    ████ ████ ████ ████
2 │               ████ ████ ████ ████ ████
1 │ ████ ████ ████ ████ ████ ████ ████ ████
0 │─────────────────────────────────────────►
    Prep  Launch Transit Gate  Desc  Surface  Colony
          Ph2    Ph3    Ph4   Ph5    Ph6      Ph7
```

---

## Balance Targets

### Win/Loss Rates (Astronaut Difficulty)

| Metric | Target | Notes |
|--------|-------:|-------|
| Win rate (reach Colony) | ~40% | Of all completed games |
| Average game length | 13 turns | Across all outcomes |
| Average winning game length | 14 turns | Winners tend to play carefully |
| Average losing game length | 9 turns | Losses often come at descent or early surface |

### Failure Distribution (Astronaut Difficulty)

| Failure Mode | % of All Failures |
|-------------|------------------:|
| Life support depletion | 35% |
| Crash landing | 18% |
| Radiation exposure | 12% |
| All crew incapacitated | 10% |
| Spacecraft destruction | 8% |
| EVA accident cascade | 7% |
| Mission window expired | 5% |
| Budget crisis | 5% |

### Resource Balance Checkpoints

At each phase transition, a well-played Astronaut game should have approximately:

| Checkpoint | FU | SD | PU | SR | MU | CR |
|-----------|---:|---:|---:|---:|---:|---:|
| After Phase 1 (allocation) | 250 | 50 | 25 | 8 | 5 | 45 |
| After Phase 2 (launch) | 170 | 49 | 23 | 7 | 5 | 45 |
| After Phase 3 (transit) | 130 | 46 | 21 | 6 | 4 | 45 |
| After Phase 4 (gateway) | 75 | 50* | 23* | 7* | 5* | 5 |
| After Phase 5 (descent) | 15 | 49 | 21 | 6 | 5 | 5 |
| End of Phase 6 (surface) | 10 | 8 | 12 | 4 | 2 | 5 |

*Assumes moderate Gateway resupply spending ~40 CR

### Decision Weight

- **Player skill vs. randomness split**: 60/40
- Strategic allocation (Phase 1) accounts for ~30% of outcome variance
- Tactical decisions (Phases 2–6) account for ~30%
- Random events account for ~40%

---

## Random Event Master Table

All random events across all phases consolidated for implementation reference.

### Event Categories

| Category | Icon | Phases Active | Description |
|----------|:----:|:------------:|-------------|
| **Environmental** | 🌍 | 3, 6 | Solar, thermal, seismic hazards |
| **Mechanical** | ⚙️ | 2, 3, 6 | Equipment failures, malfunctions |
| **Medical** | 🏥 | 3, 4, 6 | Illness, injury, psychological |
| **Supply** | 📦 | 3, 4, 6 | Resource loss or gain |
| **Positive** | ✨ | 3, 4, 6 | Morale boosts, lucky finds |

### Event Severity Levels

| Severity | Resource Cost | Health Impact | Example |
|----------|:------------:|:-------------:|---------|
| Minor | 1 unit | Stressed at worst | Dust in filters |
| Moderate | 2–3 units | Ill at worst | Equipment malfunction |
| Severe | 4–5 units | Critical at worst | Hull breach |
| Catastrophic | 6+ units | Dead possible | Meteorite strike |

### Weighted Probability (Astronaut, Surface Phase)

Total event weights for Surface Ops, the phase with the most events:

| Event | Weight | Probability | Category |
|-------|-------:|------------:|----------|
| No event | 30 | 30% | — |
| Dust contamination | 12 | 12% | Environmental |
| Solar radiation spike | 10 | 10% | Environmental |
| Temperature extreme (hot) | 8 | 8% | Environmental |
| Temperature extreme (cold) | 8 | 8% | Environmental |
| Equipment failure | 10 | 10% | Mechanical |
| Psychological stress | 8 | 8% | Medical |
| Moonquake | 5 | 5% | Environmental |
| Communication blackout | 5 | 5% | Supply |
| Dust storm (EVA cancel) | 7 | 7% | Environmental |
| Stunning discovery | 5 | 5% | Positive |
| Supply cache found | 2 | 2% | Positive |
| **Total** | **110** | — | Normalize to 100% |

*Note: Weights sum to 110 for implementation — normalize by dividing each by 110 to get true probability, or roll d110.*

**Design insight**: Like Oregon Trail's 26% illness rate dominating the event table, environmental hazards (dust + radiation + temperature + quake + storm = 42%) dominate the surface phase, making shielding and spare parts critical for late-game survival.

---

## Resource Interactions

Resources are interdependent, creating emergent strategic depth:

```
Propulsion ──────► Enables all travel/maneuvers (consumed)
     │
     └──► More FU = safer maneuvers = fewer PU/SR losses

Life Support ◄──── EVA Ice Extraction (requires PU, modified by site)
     │
     └──► Consumption level affects illness rate → MU consumption

Spare Parts ─────► Required for EVAs (ice, repair, science)
     │              Required for equipment failure repair
     └──► Depletion cascades: can't repair → more failures → more losses

Shielding ────────► Absorbs radiation events (consumed passively)
     │              Can be repaired by EVA (+2 SR)
     └──► Depletion = radiation death risk (affects whole crew)

Medical ──────────► Treats illness/injury (consumed on use)
     │
     └──► Depletion = treatable conditions become fatal

Mission Budget ───► Spent at Gateway for resupply (1.5× prices)
     │
     └──► Only useful at Phase 4; dead weight otherwise
```

### Critical Interdependencies

1. **PU → SD**: Spare parts enable ice extraction EVAs, which generate life support. Running out of PU cuts off SD renewal.
2. **SD ↔ MU**: Rationing saves SD but increases illness, consuming MU. Generous eating saves MU but costs SD.
3. **FU → PU/SR**: Underfueled maneuvers damage equipment and shielding, consuming PU and SR.
4. **SR → MU**: Without shielding, radiation events cause illness, consuming medical units.
5. **PU → SR**: Spare parts enable shielding repair EVAs. No PU = no SR recovery.

---

## Player Experience Goals

### Emotional Arc

| Phase | Intended Emotion | Design Lever |
|-------|-----------------|-------------|
| Mission Prep | Excitement, anxiety of choice | Zero-sum budget |
| Launch | Anticipation, mild tension | Low-stakes first event |
| Transit | Growing unease | Resources slowly draining |
| Gateway | Relief + strategic pressure | Last chance to resupply |
| Descent | Peak tension | Single high-stakes roll |
| Surface | Sustained survival pressure | Oregon Trail core loop |
| Colony | Resolution, accomplishment | Score reveal + rating |

### Rewarded Behaviors

- **Conservative fuel spending** — maintaining margins for abort capability
- **Balanced allocation** — not over-investing in any single resource
- **Strategic rationing** — switching consumption levels based on situation
- **Risk-appropriate EVAs** — knowing when to shelter vs. when to go out
- **Gateway planning** — reserving credits for resupply if needed

### Punished Behaviors

- **Ignoring any resource** — every resource at 0 creates a death risk
- **All-in strategies** — extreme allocation leaves critical gaps
- **Reckless EVAs** — repeatedly going out with low PU/health
- **Constant rationing** — saves SD but the illness cascade is worse
- **Hoarding credits** — credits have no value after Gateway

---

## Implementation Notes

### State Machine

The game is a finite state machine with 7 primary states (phases) and sub-states within each:

```
PREP → LAUNCH → TRANSIT → GATEWAY → DESCENT → SURFACE → COLONY
  │       │        │         │          │          │
  │       └→ABORT  └→FAIL    └→(skip)   └→ABORT   └→EVAC
  │                                      └→CRASH
  └── All failure states → DEATH_SEQUENCE → GAME_OVER
```

### Key Data Structures

```
GameState {
  phase: 1-7
  turn: number
  total_turns: number
  difficulty: enum(cadet, astronaut, commander, ironman)
  landing_site: enum(5 sites) | null
}

Resources {
  propulsion: number (FU)
  life_support: number (SD)
  spare_parts: number (PU)
  shielding: number (SR)
  medical: number (MU)
  credits: number (CR)
}

CrewMember {
  name: string
  role: enum(commander, pilot, engineer, scientist)
  health: enum(healthy, stressed, ill, critical, dead)
  turns_in_state: number
}

Crew = CrewMember[4]
```

### Random Number Generation

- Use seeded PRNG for reproducibility (important for bug reports and replays)
- Event rolls: uniform distribution over weight table
- Severity rolls: d100 (percentage)
- Maneuver quality: deterministic formula + bounded random noise

### Balance Tuning Parameters (Externalize)

All of the following should be configurable constants, not hardcoded:

```
TOTAL_BUDGET = 1000
SPACECRAFT_COST = 200
BASE_ILLNESS_CHANCE = 0.08
RATIONING_MODIFIER = 2.0
STANDARD_MODIFIER = 1.0
GENEROUS_MODIFIER = 0.5
EVA_BASE_RISK = 0.30
GATEWAY_PRICE_MULTIPLIER = 1.5
TURNS_BEFORE_HEALTH_WORSENS = 2
SURFACE_BASE_TURNS = 5
SURFACE_MAX_TURNS = 8
LANDING_CRASH_THRESHOLD = 0
```

### Save/Load System

- Save full GameState + Resources + Crew at start of each turn
- Single save slot (no save scumming on Commander+)
- Ironman: autosave only, deleted on load
- Save format: JSON for simplicity; version field for forward compatibility

---

## References

- [Oregon Trail — Game Mechanics Analysis](../.github/references/oregon-trail-analysis.md) — Source mechanics being adapted
- [Game Mechanics Template](templates/game-mechanics.md) — Template structure used for this document
- [NASA Artemis Program](https://www.nasa.gov/specials/artemis/) — Mission profile reference
- [Lunar South Pole Landing Sites](https://www.nasa.gov/feature/nasa-identifies-candidate-regions-for-landing-next-americans-on-moon) — Landing site inspiration
