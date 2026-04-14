# Character Design: Lunar Colony 3000 — Crew & NPCs

> **Status**: Draft
> **Author**: Game Design Team
> **Last Updated**: 2025-07-17

## Overview

Lunar Colony 3000 is a text-based adventure game in the style of Oregon Trail, set during a near-future NASA Artemis-style lunar mission. The player is the **Mission Commander** of Artemis VII, leading a crew of five from Kennedy Space Center to the Moon's south pole to establish humanity's first permanent lunar colony.

Like Oregon Trail's family of five, the player manages a crew of five: one commander (the player) and four specialists. Each specialist has a unique ability that materially affects gameplay. Crew members can become stressed, fall ill, and die permanently — and each loss reshapes the player's strategic options. NPCs appear at key mission phases to offer supplies, advice, and morale.

The character system is designed to make the player care about their crew as individuals, feel the weight of every death, and face real mechanical consequences for losses.

---

## Player Character

### Identity

- **Name**: Player-chosen. The player names their commander at game start.
- **Rank**: Mission Commander, Artemis VII
- **Background**: A veteran NASA astronaut selected to lead the most ambitious crewed mission in history. The commander's specialty is leadership — they are a generalist, not a technical specialist.
- **Motivation**: Establish humanity's first lunar colony at the Moon's south pole.
- **Party**: The commander leads a crew of 4 specialists (Pilot, Flight Engineer, Mission Scientist, Medical Officer).

### Role in Gameplay

The commander is the **decision-maker**. They do not provide a specialist bonus but their choices directly shape outcomes:

- All player decisions (resource allocation, event responses, route selection) are made as the commander.
- The commander's survival is required — **if the commander dies, the game is over**.
- Commander choices affect **crew morale** (see Crew Morale System below).
- The commander participates in EVAs, repairs, and emergencies alongside specialists, but without specialist-level bonuses.

### Attributes

| Attribute | Description | Starting Value | Range |
|-----------|-------------|----------------|-------|
| Health | Physical condition of the commander | 100% | 0–100% |
| Leadership | Passive modifier to crew morale gain/loss | Neutral (1.0x) | 0.5x–1.5x |

- **Leadership** is not a visible stat. It is an internal modifier influenced by the commander's decisions over time. Consistently good decisions improve it; reckless or cruel decisions degrade it.
- Leadership modifies all morale gains and losses: a 1.2x leadership multiplies a +10 morale event to +12, and a -10 morale event to -12 (amplifies both).

### Skills

The commander has no specialist skill. This is intentional — the commander's value is in decision-making, not technical ability. This design ensures that losing any specialist creates a genuine gap that the commander cannot fill.

---

## Party Members

### Party Structure

- **Crew size**: 5 total (1 commander + 4 specialists)
- **Recruitment**: Crew is fixed at mission start. No new members can be recruited during the mission (this is space — you can't pick up hitchhikers).
- **Loss**: Crew members can die permanently. Deaths are irreversible.
- **Individuality**: Each specialist has a unique role, ability, personality, and set of event interactions. They are named characters, not interchangeable units.

### Crew Summary Table

| Role | Name | Ability | Specialist Bonus | Loss Penalty | Personality |
|------|------|---------|-----------------|--------------|-------------|
| Commander | Player-chosen | Decision-making (no specialist bonus) | Crew morale influenced by choices | Game over if killed | Player-defined |
| Pilot | Dr. Alex Chen | Propulsion Efficiency (+15% fuel savings) | Better landing accuracy, safer orbital maneuvers | Propulsion costs +25%, landing difficulty spikes | Cool under pressure, dry humor |
| Flight Engineer | Specialist Jordan Rivera | Efficient Repairs (-30% spare parts usage) | Equipment failures less likely, repairs more effective | Repair costs 2x, random equipment failures more frequent | Meticulous, anxious but brilliant |
| Mission Scientist | Dr. Sam Okafor | Resource Extraction (+40% EVA yields) | Science objectives give bonus score, better ice extraction | EVA yields halved, no science bonus points | Enthusiastic, optimistic, curious |
| Medical Officer | Dr. Morgan Park | Medical Efficiency (-50% med unit cost) | Illness severity reduced, health degrades slower | Medical costs 2x, illness progression accelerates | Calm, nurturing, dark humor |

---

### Specialist 1: Pilot — Dr. Alex Chen

#### Identity

- **Full Name**: Dr. Alex Chen
- **Rank**: Lieutenant Commander, USN (Reserve)
- **Age**: 38
- **Background**: Former Navy test pilot, PhD in Aerospace Engineering from MIT. Two prior Artemis missions (Artemis III orbital, Artemis V surface EVA). Selected for Artemis VII for their precision piloting record — zero anomalies across 14 orbital maneuvers.
- **Historical Inspiration**: Composite of real pilot-astronaut archetypes — the calm, technically brilliant aviator in the mold of Michael Collins, with the test-pilot pedigree of Neil Armstrong.

#### Ability: Propulsion Efficiency

- **Effect**: All propulsion maneuvers consume **15% less fuel** while Dr. Chen is alive and healthy.
- **Mechanical Detail**: Any event or action that costs fuel (trans-lunar injection, course corrections, orbital insertion, powered descent) has its fuel cost multiplied by **0.85**.
- **Health Interaction**: If Chen is **Ill** (25–74% health), the bonus is halved to **7.5% savings** (0.925 multiplier). If **Critical** (1–24%), no bonus applies.

#### Specialist Bonus (Alive)

- **Landing accuracy**: During the powered descent phase, Chen's presence reduces the chance of a rough landing by **20 percentage points** (e.g., from 35% to 15%).
- **Orbital maneuvers**: Course correction events have a higher success rate (+15% to favorable outcomes).
- **Docking**: Gateway station docking is automatic with Chen alive. Without Chen, docking requires a skill check with a 25% failure chance.

#### Loss Penalty (Dead)

- All propulsion costs increase by **25%** (1.25 multiplier on fuel consumption).
- Landing difficulty increases: rough landing chance rises by **30 percentage points**.
- Docking maneuvers now require skill checks (25% failure chance per attempt).
- Course corrections have reduced success rates (-15% to favorable outcomes).

#### Personality

- **Core trait**: Cool under pressure. Chen is the person you want in the pilot seat when alarms are going off. They lower their voice when others raise theirs.
- **Humor**: Dry and deadpan. Responds to catastrophic warnings with understated observations.
- **Stress response**: Gets quieter, not louder. Morale events involving Chen tend to be stabilizing — their calm is contagious.
- **Quirk**: Names all spacecraft systems. Refers to the main engine as "Bessie."

#### Sample Event Text

- **Normal**: *Chen adjusts the orbital trajectory with a single short burn. "Bessie's running smooth. Two percent under budget on fuel."*
- **Stressed**: *Chen's hands are steady, but the pauses between their words are longer than usual. "Trajectory corrected. We're fine."*
- **Ill**: *Chen manages the correction from a tablet strapped to their med bay bunk. The burn is good, but not their best. Fuel consumption is slightly above nominal.*
- **Death**: *The cockpit is quiet. Chen's seat is empty. You try the course correction yourself. Bessie doesn't respond the way she did for them.*

#### Events Tied to Chen

- **"Pilot's Gambit"** (Phase 3, Cislunar Transit): Chen proposes a risky fuel-saving slingshot maneuver. If accepted: 25% chance of saving 20% total fuel; 10% chance of minor hull stress. If declined: no effect.
- **"Old Hands"** (Phase 4, Gateway): If Chen meets Commander Tanaka at Gateway, they share a brief exchange about a prior mission. +5 morale.

---

### Specialist 2: Flight Engineer — Specialist Jordan Rivera

#### Identity

- **Full Name**: Specialist Jordan Rivera
- **Rank**: Specialist (civilian, NASA Engineering Corps)
- **Age**: 34
- **Background**: MS in Mechanical Engineering from Georgia Tech. Former SpaceX pad engineer who transitioned to NASA's astronaut program. Known for their obsessive attention to system diagnostics — they once caught a hairline fracture in a pressure seal that three automated systems missed. First spaceflight.
- **Historical Inspiration**: The meticulous, detail-obsessed engineer archetype — in the tradition of John Aaron ("the steely-eyed missile man") and the engineers who saved Apollo 13 from the ground. Rivera is what happens when that person is on the ship.

#### Ability: Efficient Repairs

- **Effect**: All repairs consume **30% fewer spare parts** while Rivera is alive and healthy.
- **Mechanical Detail**: Any event or action that costs spare parts (equipment repair, hull patching, system restoration) has its parts cost multiplied by **0.70**.
- **Health Interaction**: If Rivera is **Ill** (25–74% health), the bonus is halved to **15% savings** (0.85 multiplier). If **Critical** (1–24%), no bonus applies.

#### Specialist Bonus (Alive)

- **Equipment failure prevention**: Random equipment failure events are **40% less likely** to trigger. (Base failure chance per turn is reduced by 0.4x.)
- **Repair effectiveness**: Repairs restore **25% more system integrity** than baseline. A repair that normally restores 50% integrity restores 62.5% instead.
- **Diagnostic warnings**: Rivera occasionally provides advance warning of impending failures (random event, ~15% chance per turn), allowing the player to preemptively repair at reduced cost.

#### Loss Penalty (Dead)

- All repair costs **double** (2.0 multiplier on spare parts consumption).
- Random equipment failure events become **50% more frequent** (base failure chance per turn increased by 1.5x).
- Repair effectiveness drops by **25%** — repairs restore less system integrity.
- Diagnostic warnings no longer occur.
- A one-time event triggers on Rivera's death: a random system suffers an immediate minor failure ("No one noticed the pressure warning Rivera would have caught").

#### Personality

- **Core trait**: Meticulous to the point of anxiety. Rivera checks everything twice, then checks it again. They are the crew member most likely to lose sleep over a blinking warning light that turned out to be nothing.
- **Humor**: Nervous, self-deprecating. Makes jokes about their own worrying.
- **Stress response**: Becomes hyper-focused and talkative — starts narrating every diagnostic step out loud. This can be reassuring ("Rivera's on it") or grating ("Rivera won't stop talking"), depending on context.
- **Quirk**: Keeps a physical checklist notebook in an era of digital systems. "Screens glitch. Paper doesn't."

#### Sample Event Text

- **Normal**: *Rivera finishes the repair in half the expected time, barely using any spare parts. "I reinforced the secondary coupling while I was in there. Figured, why not."*
- **Stressed**: *Rivera's hands are steady but their voice isn't. "Okay, okay, I triple-checked the seal. It's good. I think it's good. It's good."*
- **Ill**: *Rivera talks you through the repair from their bunk, step by painful step. It takes longer and uses more parts than it should. "Left-hand thread on that coupling. Don't forget."*
- **Death**: *The O2 recycler fails on day 47. No one catches it for six hours. Rivera would have caught it in six minutes.*

#### Events Tied to Rivera

- **"The Checklist"** (Phase 2, LEO): Rivera insists on a comprehensive pre-departure systems check. If allowed (costs 1 turn): reveals and fixes a hidden flaw, preventing a later failure event. If refused: the flaw triggers later at a worse time.
- **"Midnight Diagnostic"** (Phase 3, Cislunar Transit): Rivera can't sleep and runs unauthorized system checks. Discovers a minor issue. +3 morale ("Rivera found something before it became a problem") or -2 morale if crew is already stressed ("Rivera is making everyone nervous").

---

### Specialist 3: Mission Scientist — Dr. Sam Okafor

#### Identity

- **Full Name**: Dr. Sam Okafor
- **Rank**: Payload Specialist (civilian, NASA Science Division)
- **Age**: 41
- **Background**: PhD in Planetary Geology from Caltech, postdoc at the Lunar and Planetary Institute. Published 30+ papers on lunar regolith composition and water ice distribution. Selected for Artemis VII specifically because their research predicted the ice deposits at the south pole landing site. Second spaceflight (previously Artemis IV orbital science mission).
- **Historical Inspiration**: The scientist-astronaut archetype — Harrison Schmitt (Apollo 17, the only geologist to walk on the Moon), combined with the infectious enthusiasm of modern planetary scientists.

#### Ability: Enhanced Resource Extraction

- **Effect**: All EVA resource extraction yields **40% more resources** while Dr. Okafor is alive and healthy.
- **Mechanical Detail**: Any EVA that produces resources (water ice, regolith for construction, mineral samples) has its yield multiplied by **1.40**.
- **Health Interaction**: If Okafor is **Ill** (25–74% health), the bonus is halved to **20% extra yield** (1.20 multiplier). If **Critical** (1–24%), no bonus applies.

#### Specialist Bonus (Alive)

- **Science objectives**: Completing science objectives (sample collection, geological surveys, ice analysis) awards **bonus score points** (+50% score value per objective).
- **Ice extraction**: Water ice extraction EVAs yield additional ice beyond the 40% ability bonus — total effective yield is approximately **+55%** for ice specifically (1.40 × 1.10 compounding).
- **Terrain knowledge**: Okafor can identify optimal EVA sites, reducing EVA duration by **1 turn** on surface exploration events.

#### Loss Penalty (Dead)

- EVA resource extraction yields are **halved** (0.50 multiplier — a dramatic swing from the +40% bonus).
- Science objective score bonuses are **eliminated** (objectives still completable but worth base value only).
- Ice extraction loses all specialist bonuses, reverting to base yield × 0.50.
- EVA site selection is less efficient — surface exploration events take **1 additional turn**.
- A one-time morale penalty of **-10** triggers ("Okafor spent a decade preparing for this. They'll never see the ice fields.").

#### Personality

- **Core trait**: Enthusiastic and boundlessly curious. Okafor is the crew member who stares out the window during transit and says, "Do you realize what we're looking at right now?" They are genuinely thrilled to be here.
- **Humor**: Warm and inclusive. Makes bad geology puns. ("That crater has a lot of potential. Get it? Gravitational potential.")
- **Stress response**: Retreats into data. When things go wrong, Okafor starts analyzing — not because they're avoiding the problem, but because understanding the data is how they process fear.
- **Quirk**: Collects a small regolith sample at every EVA, even when it's not part of the mission plan. "For the archive."

#### Sample Event Text

- **Normal**: *Okafor practically bounces through the EVA. "Commander, the ice concentration here is even higher than my models predicted. We are going to build a colony on this."*
- **Stressed**: *Okafor runs the extraction in focused silence. They bag the samples methodically, but the usual running commentary is absent.*
- **Ill**: *Okafor directs the EVA from inside the lander, watching helmet cam feeds. "Move the drill two meters north. Trust me — the subsurface radar shows a vein there." The yield is lower without their hands on the equipment.*
- **Death**: *You stare at the ice field through the lander window. Okafor mapped every square meter of it from Earth orbit. Now you're guessing where to drill.*

#### Events Tied to Okafor

- **"The Discovery"** (Phase 6, Surface Ops): Okafor identifies an unexpected mineral deposit during a routine EVA. The player chooses: investigate (costs 1 turn, 10% chance of major resource find, 5% chance of equipment damage) or log it and move on (no cost, no reward).
- **"Stargazing"** (Phase 3, Cislunar Transit): Okafor invites the crew to an impromptu "lecture" about the lunar south pole. +5 morale. If morale is already below 30, crew declines and morale doesn't change.

---

### Specialist 4: Medical Officer — Dr. Morgan Park

#### Identity

- **Full Name**: Dr. Morgan Park
- **Rank**: Commander, USPHS (United States Public Health Service Commissioned Corps)
- **Age**: 44
- **Background**: MD from Johns Hopkins, residency in emergency medicine, fellowship in aerospace medicine at UTMB (University of Texas Medical Branch). Served as flight surgeon for three prior Artemis missions before being selected as a crew member. The most medically experienced person NASA has ever sent to space. Third spaceflight.
- **Historical Inspiration**: The flight surgeon archetype — a composite of the steady-handed doctors who kept crews alive in extreme conditions, from the Antarctic expedition physicians to NASA flight surgeons like Story Musgrave (astronaut-physician).

#### Ability: Medical Efficiency

- **Effect**: All medical treatments consume **50% fewer med units** while Dr. Park is alive and healthy.
- **Mechanical Detail**: Any medical action (treating illness, injury, radiation exposure, psychological episodes) has its med unit cost multiplied by **0.50**.
- **Health Interaction**: If Park is **Ill** (25–74% health), the bonus is reduced to **25% savings** (0.75 multiplier). If **Critical** (1–24%), no bonus applies. Note the irony: the sickest the doctor gets, the more medicine the crew needs.

#### Specialist Bonus (Alive)

- **Illness severity**: All illness events are **one severity tier lower** than they would otherwise be (e.g., an event that would cause "Ill" status instead causes "Stressed"). Does not prevent death events, but makes non-lethal illnesses more manageable.
- **Health degradation**: Passive crew health degradation (from radiation exposure, low rations, overwork) is **30% slower** per turn.
- **Psychological care**: Park can conduct "crew wellness checks" — a player-triggered action (once per phase) that restores **+10 health** to all living crew members at a cost of 2 med units (1 med unit with Park's ability).
- **Triage**: When a crew member reaches Critical status, Park provides a **+20 percentage point** survival bonus on the next-turn death check.

#### Loss Penalty (Dead)

- Medical treatment costs **double** (2.0 multiplier on med unit consumption — a 4x swing from Park's 0.5x bonus).
- Illness severity is no longer reduced — all illnesses hit at full force.
- Health degradation returns to baseline rate (30% faster than when Park was alive).
- Crew wellness checks are no longer available.
- Critical crew members lose the +20% survival bonus on death checks.
- A one-time morale penalty of **-15** triggers ("Park always said they'd keep us alive. Now we're on our own.").

#### Personality

- **Core trait**: Calm and nurturing, with an undercurrent of dark humor. Park has seen enough medical emergencies to be unflappable, and enough death to joke about it — not from cruelty, but from coping.
- **Humor**: Dark and medical. "The good news is, in one-sixth gravity, your broken leg only hurts one-sixth as much. The bad news is, that's not how pain works."
- **Stress response**: Becomes hyper-competent and emotionally flat. When things are worst, Park is at their most effective and least expressive. The crew finds this both reassuring and unsettling.
- **Quirk**: Carries a physical stethoscope despite having access to full biometric monitoring. "Machines tell you numbers. This tells you how someone is breathing."

#### Sample Event Text

- **Normal**: *Park finishes the checkup and nods. "Everyone's nominal. Bone density is holding, radiation exposure is within limits. I'm cautiously optimistic, which is my version of ecstatic."*
- **Stressed**: *Park is quieter during the exam. Their notes are more detailed than usual. "I want daily vitals from everyone. Non-negotiable."*
- **Ill**: *Park treats the crew from their own med bay bed, one hand on an IV drip and the other on a diagnostic tablet. "I'm fine. Focus on the crew." They are visibly not fine.*
- **Death**: *Rivera's cough gets worse on day 62. You open the medical kit and stare at the contents. Park would have known exactly what to use. You read the labels twice and guess.*

#### Events Tied to Park

- **"The Talk"** (Phase 3, Cislunar Transit): Park pulls the commander aside for a private conversation about crew stress levels. The player can choose to address the issue (costs nothing, +8 morale) or dismiss it ("We're fine, Doc." No morale change, but Park's next wellness check is +5 instead of +10 — they're less effective when ignored).
- **"Radiation Protocol"** (Phase 5, Lunar Orbit): Park identifies elevated radiation exposure in the crew. The player chooses: shelter in place for 1 turn (-1 turn progress, crew health preserved) or push through (no time lost, all crew take -10 health).

---

## Crew Health System

### Overview

Each crew member (including the commander) has an individual **Health** value ranging from **0% to 100%**. Health determines effectiveness, triggers status effects, and governs death mechanics.

### Health Tiers

| Tier | Range | Status | Gameplay Effect |
|------|-------|--------|----------------|
| Healthy | 100% | Fully operational | Full specialist bonus. No debuffs. |
| Stressed | 75–99% | Minor strain | Specialist ability at full power. Minor morale events may trigger. ~5% chance per turn of a stress-related flavor event. |
| Ill | 25–74% | Needs medical attention | Specialist ability at **half effectiveness**. Major debuffs: task completion takes longer, EVA participation restricted. Medical treatment recommended. |
| Critical | 1–24% | May die next turn | Specialist ability **inactive**. Crew member is completely ineffective — cannot participate in any tasks. **Death check** each turn: base 30% chance of death, modified by Medical Officer presence (-20pp with Park alive). |
| Dead | 0% | Permanent | Removed from crew. Specialist bonus lost, loss penalty applied. Cannot be revived. |

### Health Modifiers

Health changes come from the following sources:

| Source | Effect | Frequency |
|--------|--------|-----------|
| Baseline radiation exposure | -2 health/turn (transit), -1 health/turn (surface with shielding) | Every turn |
| Low rations (≤50% food) | -3 health/turn to all crew | While active |
| Starvation (0% food) | -8 health/turn to all crew | While active |
| Medical treatment | +20 to +40 health (varies by severity) | Player action |
| Crew wellness check (Park) | +10 health to all crew | Once per phase |
| Rest turn | +5 health to all crew | Player action (costs 1 turn) |
| Successful EVA | +2 health to participants | Per EVA |
| Random illness event | -15 to -40 health to affected crew member | Random |
| Injury event | -20 to -50 health to affected crew member | Random |
| Solar flare (unshielded) | -30 health to all crew | Random event |

### Death Mechanics

- When a crew member reaches **0% health**, they are **dead**. This is immediate and permanent.
- When a crew member is at **Critical** status (1–24%), a **death check** occurs at the start of each turn:
  - Base death chance: **30%**
  - With Dr. Park alive: **10%** (30% - 20pp bonus)
  - With Dr. Park dead: **30%** (no modifier)
  - If untreated for 3+ consecutive turns at Critical: death chance increases to **50%** (30% with Park)
- Certain catastrophic events (explosive decompression, direct meteorite strike) can kill a crew member instantly regardless of health, but these are rare and always telegraphed with a warning the turn before.

---

## Crew Morale System

### Overview

Morale is a **shared crew stat** — a single value representing the collective psychological state of the crew. It is not tracked per individual. Morale affects event outcomes, crew willingness, and overall performance.

### Morale Scale

| Range | Label | Effect |
|-------|-------|--------|
| 0–10 | Mutiny | Crew may refuse direct orders. Random chance per turn of a crew member sabotaging supplies or abandoning an EVA. Mission failure risk. |
| 11–24 | Despair | Crew refuses risky actions (EVAs in hazardous conditions, aggressive maneuvers). Random negative events more likely (+25% frequency). Health degrades 10% faster. |
| 25–49 | Low | Minor performance debuffs. Crew is functional but unenthusiastic. Specialist abilities at 90% effectiveness. |
| 50–74 | Stable | Baseline performance. No bonuses or penalties. |
| 75–89 | High | Random positive events more likely (+20% frequency). Specialist abilities at 110% effectiveness. +2 health/turn passive bonus to all crew. |
| 90–100 | Inspired | Crew performs at peak. Specialist abilities at 120% effectiveness. Rare "inspired action" events can trigger (crew voluntarily takes initiative, solving problems before the player acts). |

### Starting Morale

- **75** ("Cautiously Optimistic") — the crew is well-trained, excited, but aware of the risks.

### Morale Modifiers

| Event | Morale Change | Notes |
|-------|---------------|-------|
| Crew member death | **-20** | Immediate. Stacks if multiple die. |
| Commander death | N/A | Game over — morale is irrelevant. |
| Milestone reached (phase completion) | **+10** | Each major phase transition. |
| Successful EVA | **+5** | Per EVA. |
| Comms with Earth (scheduled) | **+3** | Available once per phase during line-of-sight. |
| Comms with Earth (personal message) | **+5** | Rare event. Crew receives personal messages from family. |
| Comms blackout (prolonged) | **-5** | Triggers after 3+ turns without Earth contact. |
| Full rations | **+1/turn** | While food supply supports full meals. |
| Half rations | **-2/turn** | While on reduced food. |
| Starvation | **-5/turn** | While food is at 0%. |
| Successful repair | **+2** | Per repair event. |
| Failed repair | **-3** | Per failed repair. |
| Solar flare survived | **+5** | "We made it through." |
| Equipment failure (unrepaired) | **-4** | Per turn the failure persists. |
| Rest turn taken | **+3** | Crew appreciates the break. |
| NPC positive encounter | **+3 to +5** | Varies by NPC. |
| Science discovery | **+5** | When Okafor or crew finds something significant. |
| Rough landing | **-8** | If landing goes poorly. |
| Smooth landing | **+10** | If landing goes well. |
| Mutiny threshold crossed (0–10) | **-3/turn** | Morale spiral — hard to recover from. |

### Morale Recovery

Morale cannot be directly "spent" — it is a reactive stat. The player influences morale indirectly through decisions:

- Prioritizing crew welfare (rest turns, full rations, comms) raises morale.
- Pushing the crew hard (skipping rest, rationing food, risky decisions) lowers morale.
- Morale naturally drifts toward **50** at a rate of **+1 or -1 per turn** if no modifiers apply (regression to mean).
- Morale is clamped to **0–100**.

---

## Crew Loss Mechanics

### Permanent Death

When a crew member dies, the death is **permanent and irreversible**. This is a core design principle inherited from Oregon Trail — death is final, and the player must adapt.

### Death Sequence

When a crew member dies, the following sequence triggers:

1. **Announcement**: A brief, solemn notification. Tone matches Oregon Trail — understated, factual, with emotional weight carried by brevity.
   - Example: *"Dr. Sam Okafor has died. The crew observes a moment of silence. You mark the coordinates in the mission log."*
2. **Memorial moment**: A 1–2 sentence memorial. No fanfare. The game pauses briefly.
   - Example: *"Okafor's sample bag sits in the airlock, half full. No one moves it."*
3. **Mechanical effects**: Specialist bonus is **immediately lost**. Loss penalty **immediately applies**. These changes are displayed to the player.
   - Example: *"Without Dr. Okafor, EVA resource extraction yields are halved."*
4. **Morale impact**: **-20 morale** applied immediately. Additional personality-specific morale text may display.
   - Example: *"Rivera stares at Okafor's empty seat during the next meal. No one speaks."*

### Strategic Consequences

| Scenario | Consequence |
|----------|-------------|
| 1 specialist dead | Significant but manageable. Player must adapt strategy around the gap. |
| 2 specialists dead | Serious. Two loss penalties stacking creates compounding difficulty. |
| 3 specialists dead | Dire. Only 1 specialist bonus remains. Colony establishment is extremely difficult. |
| All 4 specialists dead | Commander alone. Can still reach the Moon but colony establishment is **nearly impossible** — all construction, science, medical, and piloting tasks are at severe penalty. |
| Commander dead | **Game over.** Immediate. No continuation. |

### Minimum Crew for Victory

- **Colony Victory** (full success): Requires **minimum 2 surviving crew** (commander + at least 1 specialist) at mission end.
- **Survival Victory** (partial success): Commander reaches the Moon alive, regardless of crew count. Colony may not be established, but the mission is recorded as a survival achievement.
- **Solo Commander**: Can land on the Moon but cannot establish the colony alone. Earns a "Sole Survivor" ending — bittersweet, not triumphant.

---

## NPCs (Non-Player Characters)

### NPC Categories

#### Guide: Mission Control (Houston)

Functions as the primary **guide NPC** — the voice of expertise and support throughout the mission.

#### Merchant/Trader: Gateway Station Commander

Functions as a **fort trader** at the midpoint of the journey, offering supplies at premium prices.

#### Fellow Travelers: ISS Crew

A brief, optional encounter during transit — fellow spacefarers offering small trades and morale.

---

### NPC 1: Mission Control (Houston)

- **Location**: Always available via comms (unless blocked by solar flares or far-side lunar position).
- **Appearance trigger**: Automatic at key decision points, low-resource warnings, and phase transitions. Player can also initiate contact once per phase.
- **Function**: Advisor, information source, morale support.
- **Personality**: Professional but warm. The voice of Houston is a composite — sometimes it's the Flight Director, sometimes it's CAPCOM, sometimes it's unnamed support staff. The tone is knowledgeable, occasionally sarcastic, and always grounded.
- **Historical basis**: The voice of Mission Control as heard in Apollo-era transcripts — competent, calm, and occasionally wryly funny under pressure.

#### Key Dialogue Lines

| Trigger | Line |
|---------|------|
| Mission start | *"Artemis VII, you are GO for launch. Godspeed, Commander."* |
| Low fuel warning | *"Commander, propulsion is showing below nominal reserves. Houston recommends conservative burn profiles going forward."* |
| Low food warning | *"Artemis VII, your consumables are trending low. Consider rationing. We'd rather you arrive hungry than not at all."* |
| Low med units | *"Medical supplies are below recommended minimums. Houston advises limiting EVA risk exposure until resupply."* |
| Crew death | *"Artemis VII, Houston copies. We... we're sorry, Commander. We'll notify the family. Take the time you need."* |
| Solar flare warning | *"Artemis VII, NOAA is tracking a coronal mass ejection. Recommend shelter protocol. This one's going to be rough."* |
| Phase 4 arrival (Gateway) | *"Welcome to lunar orbit, Artemis VII. Gateway is standing by for docking. You've come a long way."* |
| Phase 6 (colony site) | *"Commander, telemetry confirms you are on the surface at the target site. Humanity has a new address. Let's make it stick."* |
| Comms blackout start | *"Artemis VII, you are approaching comms shadow. We'll lose you for a bit. Stay sharp up there."* |
| Comms restored | *"Artemis VII, Houston has reacquired signal. Good to hear your voice, Commander."* |
| Low morale detected | *"Commander, flight surgeon is seeing elevated stress biomarkers across the crew. Recommend a rest cycle."* |

#### Services

- **Advice**: At major decision points, the player can ask Houston for a recommendation. Houston provides a risk assessment (not a guaranteed answer).
- **Morale boost**: Scheduled comms with Earth provide +3 morale. Houston can relay personal messages from crew families for +5 morale (rare event).
- **Resource information**: Houston can provide current resource burn rate projections ("At current consumption, you have approximately 14 turns of food remaining.").

#### Communication Limits

- Comms are **unavailable** during:
  - Solar flare events (1–2 turns)
  - Far side of the Moon (during certain orbital phases, 1–3 turns)
  - Communication equipment failure (until repaired)
- During comms blackout, the player cannot request Houston advice, and morale suffers (-5 after 3+ turns without contact).

---

### NPC 2: Gateway Station Commander — Commander Keiko Tanaka

- **Location**: Lunar Gateway station (appears during Phase 4: Gateway Docking).
- **Appearance trigger**: Automatic when player docks at Gateway. Available for the duration of the Gateway phase (typically 2–3 turns).
- **Function**: Trader (sells supplies at premium prices), information source (landing site intel).
- **Personality**: Efficient, experienced, slightly world-weary. Tanaka has been stationed at Gateway for 14 months and is ready to go home. They're helpful but pragmatic — everything has a cost.
- **Historical basis**: The frontier fort commander archetype from Oregon Trail — the experienced hand at the halfway point who has seen dozens of expeditions pass through, and knows which ones make it.

#### Key Dialogue Lines

| Trigger | Line |
|---------|------|
| Arrival | *"Artemis VII, Gateway copies your approach. Docking bay two is clear. Welcome to the neighborhood — such as it is."* |
| Trading screen | *"Everything costs more when you're 250,000 miles from the nearest Costco. I don't set the prices — mass-to-orbit does."* |
| Low supplies warning | *"Commander, I've seen crews come through here leaner than yours. Most of them made it. Most."* |
| Landing site intel | *"I've been watching your target site from orbit for six months. The ice is there. So are the boulders. Choose your landing zone carefully."* |
| Full crew | *"Five of you, all healthy? That's better than the last crew that came through. Don't let it go to your head."* |
| Crew losses | *"I'm sorry about your crew, Commander. I'll make sure their names go in the Gateway log."* |
| Departure | *"Good luck on the surface, Artemis VII. I'll keep the lights on up here."* |
| If Chen is alive | *"Alex Chen. I read your paper on low-thrust orbital mechanics. Solid work. Don't crash."* |

#### Services

| Item | Base Cost | Gateway Price | Notes |
|------|-----------|---------------|-------|
| Fuel (10 units) | 10 credits | 18 credits | 80% markup |
| Food (10 units) | 8 credits | 14 credits | 75% markup |
| Spare parts (5 units) | 12 credits | 20 credits | 67% markup |
| Med units (5 units) | 10 credits | 22 credits | 120% markup — medical supplies are scarce |
| Landing site scan | N/A | 15 credits | Reveals optimal landing zone, reducing rough landing chance by 15pp |

- **Credits**: The player starts with a fixed credit budget. Credits not spent at Gateway are worth bonus score at mission end.

#### Intel

- Tanaka can provide information about the two available landing sites at the south pole:
  - **Site Alpha**: Safer terrain, lower ice concentration. Easier landing, fewer resources.
  - **Site Beta**: Rougher terrain, higher ice concentration. Harder landing, more resources.
- If the player purchases the landing site scan, Tanaka reveals a third option:
  - **Site Gamma**: Moderate terrain, highest ice concentration, but in a permanently shadowed region requiring additional power management.

---

### NPC 3: ISS Crew

- **Location**: Encountered during Phase 3 (Cislunar Transit), if the player's trajectory passes near the ISS orbit.
- **Appearance trigger**: **Optional encounter** — ~40% chance of triggering during Phase 3. Not guaranteed.
- **Function**: Minor trade, morale boost.
- **Personality**: Friendly, curious, a little envious. The ISS crew represents the "old guard" of spaceflight — they're in low Earth orbit doing important work, but they know Artemis VII is going somewhere they may never go.
- **Historical basis**: Fellow travelers on the trail — the families headed to different destinations who share a campfire and a few supplies before parting ways.

#### Key Dialogue Lines

| Trigger | Line |
|---------|------|
| Encounter | *"Artemis VII, this is ISS. We've got you on tracking. Can't believe you're really going. Over."* |
| Trade offer | *"We can spare a few rations and a med kit. Not much, but it's what we've got."* |
| Morale boost | *"Good luck out there, Commander. We'll keep the lights on. The whole planet's watching."* |
| Departure | *"Safe travels, Artemis VII. See you on the history channel."* |
| If crew has losses | *"We heard about your crew, Commander. ISS is flying flags at half-mast."* |

#### Services

| Item | Cost | Notes |
|------|------|-------|
| Food (5 units) | Free (gift) | One-time offer. |
| Med units (2 units) | Free (gift) | One-time offer. Only if crew has an ill member. |
| Morale boost | Automatic | +5 morale from the encounter itself. |

- The ISS encounter is brief (1 turn) and purely positive. It's designed as a warm moment in the transit — a reminder that the crew is not alone in space, even if they're going farther than anyone before.

---

## Relationships

### Crew Dynamics

Crew relationships are not individually tracked as stats, but are expressed through **event flavor text** and **morale modifiers**. The following dynamics are scripted:

| Pair | Dynamic | Gameplay Expression |
|------|---------|-------------------|
| Chen ↔ Rivera | Mutual professional respect. Chen's calm grounds Rivera's anxiety. | If both alive, equipment failure events have +5% better outcomes. If Chen dies, Rivera's stress events become more frequent. |
| Okafor ↔ Park | Close friends. Okafor's optimism balances Park's dark humor. | If both alive, EVA events have +3 morale bonus. If Okafor dies, Park's wellness checks are -2 effectiveness (grief). |
| Commander ↔ All | Leadership relationship. Crew looks to the commander for direction. | Commander decisions directly modify morale. Good decisions build trust (Leadership modifier increases). Bad decisions erode it. |
| Rivera ↔ Park | Functional but tense. Rivera's anxiety frustrates Park's pragmatism. | Occasionally triggers a flavor event: "Rivera and Park disagree about protocol." No gameplay effect — texture only. |
| Chen ↔ Okafor | Chen is amused by Okafor's enthusiasm. Okafor admires Chen's composure. | If both alive during Phase 3, a rare event triggers: Chen and Okafor stargaze together. +3 morale. |

### Relationship Changes

Relationships do not change dynamically based on player actions. They are fixed dynamics expressed through contextual text. This keeps the system simple while providing emotional texture.

---

## Player Experience

### Design Goals

The character system is designed to achieve the following emotional and strategic goals:

1. **Attachment**: By Phase 3 (Cislunar Transit), the player should feel attached to their crew as individuals. This is achieved through personality-driven event text, inter-crew dynamics, and named characters with distinct voices.

2. **Consequential loss**: Crew deaths should feel **impactful** — not just as stat changes, but as narrative moments. The memorial sequence, personality-specific death text, and crew reaction flavor text are designed to make death feel personal.

3. **Strategic weight**: Specialist abilities should create **genuine strategic value**. Losing the engineer should make repairs a real problem. Losing the doctor should make every illness terrifying. The mechanical swings (e.g., Rivera's repairs going from -30% cost to +100% cost) are intentionally dramatic.

4. **Grounded humanity**: NPC interactions should feel **human and real**. Houston's voice should feel like a lifeline. Tanaka should feel like someone who's been out here too long. The ISS crew should feel like friends you'll never see again.

5. **Tough choices**: The morale and health systems should regularly force the player to make difficult trade-offs — rest vs. progress, rations vs. conservation, risk vs. safety. No choice should be obviously correct.

---

## Implementation Notes

### Character Data Structures

Each crew member should be represented with the following data:

```
CrewMember:
  name: string
  role: enum (Commander, Pilot, FlightEngineer, MissionScientist, MedicalOfficer)
  health: integer (0-100)
  alive: boolean
  healthTier: enum (Healthy, Stressed, Ill, Critical, Dead)  // derived from health value
  abilityModifier: float  // 1.0 at full health, 0.5 when Ill, 0.0 when Critical/Dead
  personalityTraits: string[]
  flavorTextBank: map<situation, string[]>
```

### Party Management

```
Crew:
  commander: CrewMember
  specialists: CrewMember[4]
  morale: integer (0-100)
  leadershipModifier: float (0.5-1.5)
```

- Health tier should be **derived** from the health value, not stored separately.
- Ability modifiers should be **calculated** each turn based on health tier.
- Morale should be updated at the **end of each turn** after all events resolve.

### NPC Encounter Logic

- **Mission Control**: Always available unless comms are blocked. Dialogue selected based on current game state (resource levels, crew status, phase).
- **Gateway (Tanaka)**: Triggered on Phase 4 entry. Available for 2–3 turns. Trade inventory is fixed.
- **ISS Crew**: 40% random chance during Phase 3. One-turn encounter. No repeat.

### Dialogue System Requirements

- Dialogue should be **state-aware**: NPCs and crew reference current conditions (low supplies, crew deaths, morale level).
- Crew flavor text should be drawn from **role-specific and personality-specific text banks** to avoid repetition.
- Death text and memorial text should be **unique per character** — not generic.

---

## References

- **Related Design Documents**:
  - [Lunar Colony Overview](lunar-colony-overview.md) — Mission phases, resource systems, victory conditions
  - [Character Design Template](templates/character-design.md) — Template structure used for this document

- **Historical Sources**:
  - Oregon Trail (1985, MECC) — Party system, permanent death, resource management
  - Apollo mission transcripts — Mission Control dialogue tone, astronaut communication style
  - NASA Artemis program documentation — Mission structure, crew roles, Gateway station concept

- **Character Inspiration**:
  - Dr. Alex Chen (Pilot): Michael Collins, Neil Armstrong, Sunita Williams
  - Specialist Jordan Rivera (Engineer): John Aaron, the Apollo 13 ground team, Megan McArthur
  - Dr. Sam Okafor (Scientist): Harrison Schmitt (Apollo 17), Hayabusa mission scientists
  - Dr. Morgan Park (Medical Officer): Story Musgrave, Josef Schmid (NASA flight surgeon)
  - Commander Keiko Tanaka (NPC): Frontier fort commanders, ISS long-duration crew members
