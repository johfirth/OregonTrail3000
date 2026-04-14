# Event System — Lunar Colony 3000

> **Status**: Draft
> **Author**: Game Designer Agent
> **Last Updated**: 2025-07-18
> **Parent Document**: [Lunar Colony 3000 Overview](lunar-colony-overview.md)
> **Reference**: [Oregon Trail Mechanics Analysis](../.github/references/oregon-trail-analysis.md)

## Overview

The event system is the beating heart of Lunar Colony 3000. Every turn, the game draws from a **weighted probability table** to inject unpredictable hazards — and rare moments of hope — into the mission. This system is modeled directly on the Oregon Trail's 16-event random table, expanded to 24 events organized into three pools: **Transit**, **Surface**, and **Universal**.

Like the original, events are **not equally likely**. The distribution is deliberately skewed toward resource drain and crew stress, creating a hostile environment where survival feels earned. Positive events are rare (4 out of 24) and never fully offset the cumulative pressure.

---

## Event Architecture

### Event Trigger Types

- **Random (Weighted)**: The primary event mechanism. Each turn, one event is drawn from the active pool based on probability weights. This is the direct descendant of the Oregon Trail's `RND`-based event table.
- **Contextual**: Certain events are modified or suppressed by game state. For example, *Solar Flare Warning* cannot fire on consecutive turns, and *Lunar Dust Contamination* only fires during Phase 6.
- **Chain**: Some events set a flag that increases the probability (or guarantees the occurrence) of a follow-up event on the next turn. See [Event Chains](#event-chains).
- **Phase-Gated**: Each event is tagged with the phases in which it can occur. The active event pool changes as the mission progresses.

### Event Resolution

Events resolve through one of four mechanisms:

| Resolution Type | Description | Example |
|---|---|---|
| **Automatic** | Effect applies immediately, no player input | *Communications Blackout* |
| **Choice-Based** | Player selects from 2–3 options with different trade-offs | *Solar Flare Warning*, *Space Debris Field* |
| **Skill-Modified** | A crew specialist's bonus modifies the outcome | *Equipment Calibration Drift* (Engineer negates) |
| **Compound** | Automatic effect + player choice for mitigation | *Habitat Pressure Warning* (damage is automatic, repair is a choice) |

### Event Data Structure

Each event contains the following fields:

```
Event {
  id:             string    // E.g., "EVT_TRANSIT_01"
  name:           string    // Human-readable name
  category:       enum      // TRANSIT | SURFACE | UNIVERSAL
  phases:         int[]     // Which phases this event can fire in
  probability:    float     // Weight in its pool (%)
  severity:       enum      // LOW | MEDIUM | HIGH | CRITICAL | POSITIVE
  description:    string    // Narrative text shown to the player
  choices:        Choice[]  // Player options (may be empty for automatic events)
  effects:        Effect[]  // Mechanical impacts on game state
  chain_trigger:  string?   // ID of follow-up event (if any)
  specialist_mod: string?   // Which crew role modifies this event
  oregon_analog:  string?   // Which Oregon Trail event inspired this
}
```

---

## Event Catalog — 24 Events

### Transit Events (Phase 3: Lunar Transit)

These 10 events form the **Transit Pool**, active during the 3-day coast phase between Earth and the Moon. The player is trapped in a tin can in the void — claustrophobia, equipment wear, and cosmic hazards dominate.

---

#### EVT_TRANSIT_01 — Micrometeorite Strike

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Wagon breakdown (6%) |
| **Probability** | 6% |
| **Severity** | Medium |
| **Phases** | 3 (Transit) |
| **Specialist Modifier** | Engineer: repair cost reduced to -2 Spare Parts |

**Description:**
> ⚠️ IMPACT ALERT — Hull sensor grid detects a micrometeorite strike on Module 3. The particle — no larger than a grain of sand — punched through the outer shielding layer at 25 km/s. Pressure is holding, but the hull plating needs patching before the next thermal cycle weakens the impact site. Your engineer pulls replacement panels from stores.

**Effects:**
- −3 Spare Parts (repair materials consumed)
- −0.5 turn progress (crew diverts to repair EVA)

**Player Choices:** None (automatic resolution)

**Design Note:** This is the baseline "stuff breaks" event — frequent enough to drain spare parts over time, never severe enough to threaten the mission alone. The Engineer specialist reduces cost to −2, making crew composition matter.

---

#### EVT_TRANSIT_02 — Solar Flare Warning

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Heavy rains / cold weather (10%) |
| **Probability** | 10% |
| **Severity** | Medium-High |
| **Phases** | 3 (Transit), 6 (Surface) |
| **Specialist Modifier** | Scientist: 1 turn advance warning (can shelter proactively) |

**Description:**
> 🌞 SOLAR WEATHER ALERT — NOAA's Space Weather Prediction Center reports a Class M solar flare eruption. Elevated proton flux is inbound. Estimated arrival: 47 minutes. You have two options: shelter the crew in the storm cellar (the most-shielded module) and wait it out, or keep the crew at stations and rely on hull shielding to absorb the radiation.

**Player Choices:**

| Option | Effect | Best When... |
|---|---|---|
| **(A) Shelter in place** | −1 turn progress (crew hunkers down, mission paused) | You have time to spare and can't afford shielding loss |
| **(B) Push through** | −2 Shielding (hull absorbs radiation dose) | You're behind schedule and have shielding reserves |

**Design Note:** This is the highest-probability event in the Transit Pool (10%), mirroring the Oregon Trail's heavy rain/weather at 10%. The choice is never objectively correct — it depends on the player's current resource balance between time and shielding. If the player has a Scientist, they get a warning 1 turn before the flare hits, allowing proactive shelter without the full time penalty (−0.5 turn instead of −1).

**Chain Trigger:** If this event fires and the player chose **(B) Push through**, there is a 25% chance that *EVT_UNIVERSAL_06 — Coronal Mass Ejection* fires on the next turn (the flare was a precursor to a CME). See [Solar Storm Sequence](#chain-2-solar-storm-sequence).

---

#### EVT_TRANSIT_03 — Navigation Computer Glitch

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Heavy fog (5%) |
| **Probability** | 5% |
| **Severity** | Low |
| **Phases** | 3 (Transit) |
| **Specialist Modifier** | Pilot: negates propulsion cost entirely |

**Description:**
> 🖥️ NAV SYSTEM ANOMALY — The primary navigation computer's star tracker has drifted 0.03° off the reference frame. It's a minor deviation now, but uncorrected it'll compound into a significant course error by lunar approach. The flight computer is recalculating a correction burn. Propulsion reserves will be tapped to realign your trajectory.

**Effects:**
- −2 Propulsion (correction burn required)

**Player Choices:** None (automatic resolution)

**Design Note:** A low-severity nibble at propulsion reserves. The Pilot specialist eliminates the cost entirely, reflecting their expertise in manual navigation. This event is the fog equivalent — disorienting but not dangerous.

---

#### EVT_TRANSIT_04 — Oxygen Recycler Malfunction

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Ox leg injury (5%) |
| **Probability** | 5% |
| **Severity** | Medium |
| **Phases** | 3 (Transit), 6 (Surface) |
| **Specialist Modifier** | Engineer: repair cost reduced to −1 Spare Parts |

**Description:**
> 🫁 LIFE SUPPORT WARNING — The CO₂ scrubber in the Environmental Control and Life Support System (ECLSS) is showing reduced efficiency. Lithium hydroxide canisters are saturating faster than expected. You can divert spare parts to rebuild the scrubber assembly, or accept a higher oxygen consumption rate for the remainder of the transit.

**Player Choices:**

| Option | Effect | Best When... |
|---|---|---|
| **(A) Repair now** | −2 Spare Parts (one-time fix) | You have parts to spare and a long journey ahead |
| **(B) Accept degraded performance** | +0.5 Life Support consumption per turn (ongoing) | Parts are critical and you're close to your destination |

**Design Note:** This mirrors the ox injury's permanent speed reduction. Option B creates a slow bleed that compounds over multiple turns — a classic Oregon Trail pressure mechanic. The longer the player waits, the more expensive it gets.

---

#### EVT_TRANSIT_05 — Crew Psychological Stress

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Illness — mild (partial, 8% of the 26% illness pool) |
| **Probability** | 8% |
| **Severity** | Low-Medium |
| **Phases** | 3 (Transit), 6 (Surface) |
| **Specialist Modifier** | Doctor: halves morale penalty (−3 instead of −5) |

**Description:**
> 😰 CREW STATUS UPDATE — [Random Crew Member] has been withdrawn and irritable for the past 12 hours. Mission psychologists on the ground flag elevated cortisol markers from the biomonitor feed. The confined quarters, constant hum of machinery, and 240,000 miles of empty void are taking a psychological toll. Crew cohesion is weakening.

**Effects:**
- −5 Morale
- Random crew member flagged as "Stressed" (increases vulnerability to future illness events)

**Player Choices:** None (automatic resolution)

**Design Note:** Morale is the slow-burn resource. This event doesn't feel dangerous in isolation, but stacking stress across multiple crew members compounds into mission-threatening territory. At 8%, this is the second most common transit event — psychological strain is the most realistic threat on a lunar mission.

---

#### EVT_TRANSIT_06 — Communications Blackout

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Son gets lost / lost trail (2%) |
| **Probability** | 4% |
| **Severity** | Low |
| **Phases** | 3 (Transit) |
| **Specialist Modifier** | None |

**Description:**
> 📡 COMMS LOST — Antenna gimbal malfunction. The high-gain antenna has lost lock on the Deep Space Network relay. You're out of contact with Houston. No telemetry down, no voice up. Your crew is alone with the hiss of static. The antenna should re-acquire signal in approximately one orbit cycle, but until then, you're flying blind.

**Effects:**
- No Mission Control advice available for 1 turn (if a hint/advice system exists, it's disabled)
- −3 Morale (isolation anxiety)

**Player Choices:** None (automatic resolution)

**Design Note:** A light atmospheric event that reinforces the isolation theme. The mechanical impact is minor, but the narrative weight is significant — the player feels alone. This is the "lost trail" equivalent: temporarily disoriented but not in danger.

---

#### EVT_TRANSIT_07 — Food Storage Contamination

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Fire in wagon (2%) |
| **Probability** | 3% |
| **Severity** | Medium |
| **Phases** | 3 (Transit) |
| **Specialist Modifier** | Doctor: reduces loss to −2 Life Support (identifies contamination early) |

**Description:**
> 🦠 CONTAMINATION ALERT — Routine food supply inspection reveals bacterial growth in Storage Bay 2. A seal failure allowed moisture into the freeze-dried ration packs. Three days' worth of food is compromised. The affected supplies must be jettisoned to prevent cross-contamination. Nobody wants to find out what space mold does to your intestines.

**Effects:**
- −3 Life Support (contaminated food destroyed)

**Player Choices:** None (automatic resolution)

**Design Note:** Rare but painful. Losing 3 Life Support units is significant in a game where every supply day counts. Mirrors the Oregon Trail's fire event — sudden, unavoidable loss of critical supplies.

---

#### EVT_TRANSIT_08 — Space Debris Field

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Riders / Bandits (3%) |
| **Probability** | 5% |
| **Severity** | High |
| **Phases** | 3 (Transit) |
| **Specialist Modifier** | Pilot: Option A costs only −2 Propulsion |

**Description:**
> 🛰️ COLLISION WARNING — USSPACECOM tracking reports a debris cloud in your flight path. It's the remnants of a defunct weather satellite that broke apart in a Kessler cascade six months ago. Fragments range from paint flecks to refrigerator-sized panels, spread across a 200-km band. You have three options.

**Player Choices:**

| Option | Effect | Best When... |
|---|---|---|
| **(A) Evasive maneuver** | −3 Propulsion (burn fuel to change trajectory) | Propulsion reserves are healthy; you need hull/crew intact |
| **(B) Raise shields** | −2 Shielding (absorb impacts with the radiation shield) | Shielding is high; propulsion is critical for landing |
| **(C) Risk it — maintain course** | 30% chance: nothing happens. 70% chance: −5 Spare Parts + random crew member injured | You're desperate and willing to gamble |

**Design Note:** This is the bandit encounter equivalent — the most tactically interesting transit event. All three options are viable depending on game state. Option C introduces a die roll, mirroring the Oregon Trail's "riders might be friendly" uncertainty. The 70/30 split makes it a bad bet in most situations, but a calculated risk when resources are depleted everywhere else.

---

#### EVT_TRANSIT_09 — Equipment Calibration Drift

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Son gets lost (2%) |
| **Probability** | 3% |
| **Severity** | Low |
| **Phases** | 3 (Transit), 4 (Gateway) |
| **Specialist Modifier** | Engineer: **negates this event entirely** (auto-calibration routine) |

**Description:**
> 🔧 CALIBRATION NOTICE — Science instrument suite is reporting readings outside nominal parameters. The spectrometer, magnetometer, and thermal sensors need manual recalibration. It's not urgent, but drifted instruments could compromise surface operations if uncorrected. Your engineer breaks out the calibration toolkit.

**Effects:**
- −1 Spare Parts (calibration consumables)

**Player Choices:** None (automatic resolution)

**Design Note:** The lightest-touch event in the pool. Exists primarily to make the Engineer specialist feel valuable — they completely negate this event. For non-Engineer crews, it's a small but cumulative drain.

---

#### EVT_TRANSIT_10 — Inspirational Earth View

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Helpful Indians (5%) — **POSITIVE** |
| **Probability** | 4% |
| **Severity** | Positive |
| **Phases** | 3 (Transit) |
| **Specialist Modifier** | None |

**Description:**
> 🌍 EARTH RISING — During a routine attitude adjustment, the spacecraft rotates to reveal a breathtaking view of Earth through the observation window. The entire crew gathers in silence. The blue marble hangs in the black, impossibly beautiful, impossibly fragile. For a moment, the stress melts away. Someone breaks out the good coffee. Commander, your crew needed this.

**Effects:**
- +10 Morale (significant mood boost)
- +1 Life Support (crew celebrates with a proper meal from reserves — net positive due to efficiency from high morale)

**Player Choices:** None (automatic — it's a gift)

**Design Note:** The sole positive event in the Transit Pool, mapped directly from "Helpful Indians." At 4%, it's rare enough to feel special. The +10 Morale is the largest single morale swing in the game, and the +1 Life Support is a small but meaningful bonus. This event exists to punctuate the tension with a moment of beauty — the "Overview Effect" that real astronauts describe.

---

### Surface Events (Phase 6: Surface Operations)

These 8 events form the **Surface Pool**, active once the crew has landed and begun establishing the lunar colony. The threats shift from cosmic to geological and mechanical — dust, temperature, pressure, and the unforgiving regolith.

---

#### EVT_SURFACE_01 — Lunar Dust Contamination

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Unsafe water (5%) |
| **Probability** | 8% |
| **Severity** | Medium |
| **Phases** | 6 (Surface) |
| **Specialist Modifier** | Engineer: repair cost reduced to −1 Spare Parts |

**Description:**
> 🌑 DUST INFILTRATION — Lunar regolith has breached the airlock seals. The ultra-fine, electrostatically charged dust — sharper than broken glass at the microscopic level — has contaminated the inner habitat. It's in the ventilation filters, on suit visors, and coating the instrument panels. Prolonged inhalation causes "lunar hay fever" at best, silicosis at worst. Decontamination protocol initiated.

**Effects:**
- −2 Spare Parts (filter replacements and seal repair)
- Random crew member health −10% (dust inhalation)

**Player Choices:** None (automatic resolution)

**Design Note:** Lunar dust is the most cited real hazard by Apollo astronauts. At 8%, this is the most common surface event — mirroring how pervasive the dust problem actually is. The crew health hit creates long-term pressure on Medical resources.

---

#### EVT_SURFACE_02 — Solar Panel Damage

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Wagon breakdown (6%) |
| **Probability** | 5% |
| **Severity** | Medium-High |
| **Phases** | 6 (Surface) |
| **Specialist Modifier** | Engineer: repair cost reduced to −1 Spare Parts |

**Description:**
> ☀️ POWER GRID ALERT — Solar array output has dropped 34%. Diagnostic imaging shows physical damage to Panel Array C — likely micrometeorite impact or thermal stress fracture. With reduced power generation, life support systems are drawing from battery reserves. You can spend parts to repair the array, or accept reduced power and the increased life support drain.

**Player Choices:**

| Option | Effect | Best When... |
|---|---|---|
| **(A) Repair array** | −2 Spare Parts (one-time fix) | You have parts and need sustainable power |
| **(B) Accept reduced power** | +0.3 Life Support consumption per turn (ongoing drain) | Parts are critical for other repairs |

**Design Note:** Another repair-or-bleed choice in the mold of the Oxygen Recycler. The ongoing drain from Option B is slightly less severe (+0.3 vs +0.5) because surface operations have shorter remaining duration than transit.

---

#### EVT_SURFACE_03 — Ice Deposit Discovery

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Helpful Indians (5%) — **POSITIVE** |
| **Probability** | 5% |
| **Severity** | Positive |
| **Phases** | 6 (Surface) |
| **Specialist Modifier** | Scientist: **doubles the bonus** (+8 Life Support instead of +4) |

**Description:**
> 🧊 EUREKA — During a routine geological survey near Shackleton Crater's permanently shadowed region, your crew strikes a rich vein of water ice just 0.5 meters below the regolith surface. The ice is remarkably pure — minimal sulfur contamination. Your ISRU (In-Situ Resource Utilization) unit can process this into potable water and breathable oxygen. This changes everything, Commander.

**Effects:**
- +4 Life Support (water and oxygen extracted from ice)
- Scientist bonus: +8 Life Support instead (superior extraction technique)

**Player Choices:** None (automatic — it's a discovery)

**Design Note:** The big positive event of the Surface Pool. At +4 (or +8 with Scientist), this can single-handedly rescue a struggling mission. It rewards players who chose Scientist crew composition and reinforces the thematic promise of lunar ISRU. Mapped from "Helpful Indians" — the game's reminder that sometimes the universe gives back.

---

#### EVT_SURFACE_04 — EVA Suit Breach

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Poisonous snake (2%) |
| **Probability** | 3% |
| **Severity** | Critical |
| **Phases** | 6 (Surface) |
| **Specialist Modifier** | Doctor: crew member stabilized at Injured instead of Critical |

**Description:**
> 🚨 EVA EMERGENCY — [Random Crew Member]'s suit integrity alarm is shrieking. A sharp regolith fragment has punctured the outer pressure layer of the EVA suit near the left knee joint. Pressure is dropping. Internal sealant is deploying but it's not holding. The crew member needs to get back to the airlock NOW. Every second counts.

**Effects:**
- If Medical ≥ 2: −2 Medical, −1 Spare Parts → crew member health drops to 40% ("Injured")
- If Medical < 2: crew member drops to **Critical** (10% health) — one more health event and they die
- Doctor specialist: crew member stabilizes at "Injured" (40%) regardless of Medical supply level (emergency field treatment)

**Player Choices:** None (automatic — emergency resolution)

**Design Note:** This is the snakebite equivalent — rare (3%) but potentially fatal. The binary check against Medical supplies mirrors the Oregon Trail's "die if no medicine" mechanic for snakebite. The Doctor specialist acts as a safety net, but the resource drain is still severe.

---

#### EVT_SURFACE_05 — Habitat Pressure Warning

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Wagon swamped at river (10%) |
| **Probability** | 6% |
| **Severity** | High |
| **Phases** | 6 (Surface) |
| **Specialist Modifier** | Engineer: repair cost reduced to −2 Spare Parts |

**Description:**
> 🏠 PRESSURE ALERT — Habitat Module B is showing a slow pressure decay. Rate: 0.02 psi/hour. At this rate, the module will be uninhabitable within 72 hours. The leak is somewhere in the thermal expansion joints — finding and patching it requires a tedious EVA inspection and hull sealant application. Alternatively, you can seal off Module B and redistribute crew to remaining modules, but life support efficiency will suffer.

**Player Choices:**

| Option | Effect | Best When... |
|---|---|---|
| **(A) Full repair** | −3 Spare Parts (seal, patch, and pressure test) | You have parts and need full habitat capacity |
| **(B) Seal off module** | −2 Life Support per turn (ongoing, cramped conditions) | Parts are critical; you're close to mission end |

**Design Note:** High severity due to the ongoing bleed from Option B. At −2 Life Support/turn, an unfixed pressure leak can drain supplies catastrophically fast. This creates urgent repair pressure — the surface equivalent of "your wagon is sinking in the river."

---

#### EVT_SURFACE_06 — Regolith 3D Printer Success

| Field | Value |
|---|---|
| **Oregon Trail Analog** | None (new event) — **POSITIVE** |
| **Probability** | 4% |
| **Severity** | Positive |
| **Phases** | 6 (Surface) |
| **Specialist Modifier** | Engineer: +1 additional Spare Part (+3 total) |

**Description:**
> 🖨️ FABRICATION SUCCESS — The experimental regolith 3D printer has produced its first batch of structural components using sintered lunar soil. The parts aren't pretty, but stress testing confirms they meet load-bearing specifications. Your crew now has a renewable source of basic replacement parts. The age of lunar manufacturing has begun, Commander.

**Effects:**
- +2 Spare Parts (fabricated components)
- +5 Morale (crew pride in achievement)

**Player Choices:** None (automatic — it's a success)

**Design Note:** A new event with no Oregon Trail analog — it represents the promise of ISRU technology. The +2 Spare Parts helps offset the constant drain from surface hazards, and the morale boost reflects crew satisfaction in self-sufficiency.

---

#### EVT_SURFACE_07 — Temperature Extreme

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Cold weather / heavy rains (10% — partial) |
| **Probability** | 7% |
| **Severity** | Medium |
| **Phases** | 6 (Surface) |
| **Specialist Modifier** | None |

**Description:**
> 🌡️ THERMAL ALERT — The lunar day/night cycle is brutal: +127°C in direct sunlight, −173°C in shadow. Your habitat's thermal regulation system is struggling with the extreme gradient as the terminator line approaches your site. Thermal cycling is causing micro-fractures in external equipment and degrading radiation shielding adhesive.

**Effects:**
- −1 Shielding (thermal degradation of radiation protection)
- −1 Spare Parts (equipment stress damage)

**Player Choices:** None (automatic resolution)

**Design Note:** A reliable, moderate-impact event that erodes two resources at once. At 7%, it's common enough to be a persistent concern. No mitigation options — the Moon's thermal environment is simply hostile.

---

#### EVT_SURFACE_08 — Rover Malfunction

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Ox wanders off (2%) |
| **Probability** | 4% |
| **Severity** | Low-Medium |
| **Phases** | 6 (Surface) |
| **Specialist Modifier** | Engineer: repair cost halved to −1 Spare Parts |

**Description:**
> 🚗 ROVER DOWN — The unpressurized lunar rover has thrown a drive motor fault during a survey traverse 3 km from base. The right-front wheel assembly seized — likely regolith intrusion into the bearing housing. The crew can retrieve and repair the rover, but it'll cost parts and EVA time. Without the rover, exploration range is limited to foot traverse distance.

**Effects:**
- −2 Spare Parts (motor replacement and bearing repack)
- Engineer specialist: −1 Spare Parts (field repair expertise)

**Player Choices:** None (automatic resolution)

**Design Note:** The "ox wanders off" equivalent — your mobility asset breaks down. The Engineer specialist shines here, halving the cost. Without an Engineer, rover repairs become a significant parts drain.

---

### Universal Events (Any Phase)

These 6 events can occur in **any phase** of the mission. They represent threats that aren't tied to a specific location — crew health, equipment failure, interpersonal dynamics, and cosmic catastrophe.

---

#### EVT_UNIVERSAL_01 — Crew Illness: Radiation Sickness

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Illness — serious (partial, from 26% illness pool) |
| **Probability** | 6% |
| **Severity** | High |
| **Phases** | 2, 3, 4, 5, 6 (all except Phase 1: Prep and Phase 7: Victory) |
| **Specialist Modifier** | Doctor: reduces health drop to 15% (effective treatment protocol) |

**Description:**
> ☢️ MEDICAL ALERT — [Random Crew Member] is presenting symptoms consistent with acute radiation syndrome: nausea, fatigue, and a declining white blood cell count. Cumulative radiation exposure has exceeded the crew member's personal dose limit. Without treatment, the condition will deteriorate. Medical Officer recommends immediate intervention with the onboard pharmaceutical suite.

**Effects:**
- Random crew member health drops 30%
- −2 Medical (treatment supplies consumed)
- If Medical < 2: crew member health drops 50% instead (inadequate treatment)
- Doctor specialist: health drop reduced to 15% (superior treatment protocol)

**Player Choices:** None (automatic — medical emergency)

**Design Note:** The Oregon Trail's illness event was 26% of all events — the single most common occurrence. In Lunar Colony 3000, illness is split across multiple events (this + Crew Psychological Stress + EVA Suit Breach). Radiation sickness is the most severe of the three and directly punishes players who've been losing Shielding.

---

#### EVT_UNIVERSAL_02 — Equipment Failure: Critical System

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Wild animals attack (10%) |
| **Probability** | 5% |
| **Severity** | High |
| **Phases** | 2, 3, 4, 5, 6 |
| **Specialist Modifier** | Engineer: automatic success on skill challenge |

**Description:**
> 🔴 CRITICAL FAILURE — Primary [random system: propulsion / life support / navigation / power] has suffered a catastrophic malfunction. Alarms are blaring. The system is offline and degrading. An emergency EVA repair is required — but it's not a simple swap. This requires improvisation under pressure. One wrong move could make things worse.

**Resolution:** EVA Skill Challenge (the game's equivalent of the Oregon Trail's shooting mechanic)
- **Success**: −3 Spare Parts (clean repair)
- **Failure**: −5 Spare Parts + random crew member injured (20% health loss from repair accident)
- **Engineer specialist**: automatic success (they know these systems inside and out)

**Player Choices:** The skill challenge itself is the player interaction (typing/reaction time mechanic, per the game's EVA system).

**Design Note:** This is the "wild animals attack" equivalent — a high-stakes event that invokes the real-time skill mechanic. The Engineer's auto-success makes them the most valuable crew member for risk mitigation, mirroring how ammunition was the most versatile resource in Oregon Trail.

---

#### EVT_UNIVERSAL_03 — Crew Conflict

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Daughter breaks arm (2%) — internal party issue |
| **Probability** | 4% |
| **Severity** | Low-Medium |
| **Phases** | 3, 4, 6 |
| **Specialist Modifier** | Commander: reduces morale penalty to −4 (leadership intervention) |

**Description:**
> 😤 CREW TENSION — [Crew Member A] and [Crew Member B] have had a heated confrontation over [random: workload distribution / resource rationing / mission priorities / personal space]. Voices were raised. A tool was thrown (it missed). The rest of the crew is walking on eggshells. As Commander, you need to intervene before this fractures crew cohesion entirely.

**Player Choices:**

| Option | Effect | Best When... |
|---|---|---|
| **(A) Side with Crew Member A** | −5 Morale (Crew Member B feels undermined) but A's performance improves (+5% health) | A is a critical specialist for upcoming challenges |
| **(B) Side with Crew Member B** | −5 Morale (Crew Member A feels undermined) but B's performance improves (+5% health) | B is a critical specialist for upcoming challenges |
| **(C) Mediate neutrally** | −8 Morale (nobody feels heard, but no lasting resentment) | Crew cohesion is more important than individual performance |

**Design Note:** No option is "correct." Siding with a crew member creates a targeted benefit but targeted resentment. Neutral mediation costs more morale but avoids playing favorites. The Commander specialist reduces Option C's penalty to −4, making neutral mediation much more attractive for Commander-led crews.

---

#### EVT_UNIVERSAL_04 — Supply Module Damage

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Hail storm (5%) |
| **Probability** | 4% |
| **Severity** | Medium |
| **Phases** | 2, 3, 5, 6 |
| **Specialist Modifier** | None |

**Description:**
> 📦 SUPPLY DAMAGE — A structural failure in Supply Module mounting brackets has allowed unsecured cargo to shift during [transit maneuver / landing vibration / thermal cycling]. Several supply containers are damaged. Inventory assessment reveals losses across multiple categories.

**Effects:**
- −2 Life Support (damaged food/water containers)
- −1 Medical (compromised pharmaceutical packaging)
- −1 Spare Parts (bent/broken replacement components)

**Player Choices:** None (automatic resolution)

**Design Note:** The hail storm equivalent — broad, shallow damage across multiple resource types. Total impact (−4 across three categories) is significant but spread out, making it less immediately threatening than a focused hit. No mitigation possible — sometimes bad things just happen.

---

#### EVT_UNIVERSAL_05 — Unexpected Science Discovery

| Field | Value |
|---|---|
| **Oregon Trail Analog** | None (new event) — **POSITIVE** |
| **Probability** | 3% |
| **Severity** | Positive |
| **Phases** | 3, 4, 6 |
| **Specialist Modifier** | Scientist: doubles score bonus |

**Description:**
> 🔬 DISCOVERY — [Random discovery: unusual mineral formation / anomalous radiation signature / evidence of ancient volcanic activity / unexpected magnetic field data / biosignature false-positive that generates fascinating debate]. The crew is electrified. This is why they became astronauts. The data is transmitted to Earth, where it immediately trends on every science feed. Your mission just made the front page.

**Effects:**
- +15 Morale (crew morale surge from purpose and recognition)
- +100 bonus score points (scientific achievement)
- Scientist specialist: +200 bonus score points instead (superior analysis and publication)

**Player Choices:** None (automatic — it's a discovery)

**Design Note:** A new event designed to reward the Scientist specialist and give the player a narrative high point. The +15 Morale is the largest single morale gain in the game, and the score bonus incentivizes Scientist crew composition for players chasing high scores.

---

#### EVT_UNIVERSAL_06 — Coronal Mass Ejection (CME)

| Field | Value |
|---|---|
| **Oregon Trail Analog** | Blizzard (mountain passage) |
| **Probability** | 3% |
| **Severity** | **CRITICAL** |
| **Phases** | 3, 5, 6 |
| **Specialist Modifier** | Scientist: 1-turn advance warning (if not triggered by chain) |

**Description:**
> ☠️ EMERGENCY — CORONAL MASS EJECTION INBOUND. This is not a drill. A massive solar eruption has sent a wall of charged particles screaming toward the Moon at 2,000 km/s. Estimated impact: 19 minutes. Radiation levels will spike to lethal thresholds. All crew to storm shelter. Seal all modules. This is the big one, Commander.

**Effects:**
- −4 Shielding (massive radiation absorption)
- All crew health −20% (radiation dose despite shielding)
- −1 turn progress (crew shelters for extended period)
- **IF Shielding < 2 when CME hits**: random crew member **dies** (lethal radiation dose)
- **IF Shielding = 0**: **two** crew members die

**Player Choices:** None (automatic — there is no choice, only survival)

**Design Note:** The maximum-severity event. At 3%, it's rare — most playthroughs won't see it. But when it hits, it's devastating. The Shielding < 2 death threshold creates a hard resource floor that players must maintain. This is the blizzard equivalent — the game's way of saying "if you let your defenses drop, people die." The crew death mechanic mirrors the Oregon Trail's "died of cold" in the mountains.

---

## Probability Distribution Tables

### Transit Event Pool (Phase 3)

Events drawn during Lunar Transit. One event per turn.

| ID | Event | Weight | Cumulative | Severity | Oregon Trail Analog |
|---|---|---|---|---|---|
| EVT_TRANSIT_02 | Solar Flare Warning | 10% | 10% | Medium-High | Heavy rains (10%) |
| EVT_TRANSIT_05 | Crew Psychological Stress | 8% | 18% | Low-Medium | Illness — mild |
| EVT_TRANSIT_01 | Micrometeorite Strike | 6% | 24% | Medium | Wagon breakdown (6%) |
| EVT_UNIVERSAL_01 | Crew Illness: Radiation Sickness | 6% | 30% | High | Illness — serious |
| EVT_TRANSIT_03 | Navigation Computer Glitch | 5% | 35% | Low | Heavy fog (5%) |
| EVT_TRANSIT_04 | Oxygen Recycler Malfunction | 5% | 40% | Medium | Ox injury (5%) |
| EVT_TRANSIT_08 | Space Debris Field | 5% | 45% | High | Bandits (3%) |
| EVT_UNIVERSAL_02 | Equipment Failure: Critical System | 5% | 50% | High | Wild animals (10%) |
| EVT_TRANSIT_06 | Communications Blackout | 4% | 54% | Low | Lost trail |
| EVT_TRANSIT_10 | Inspirational Earth View | 4% | 58% | Positive | Helpful Indians (5%) |
| EVT_UNIVERSAL_03 | Crew Conflict | 4% | 62% | Low-Medium | Daughter breaks arm |
| EVT_UNIVERSAL_04 | Supply Module Damage | 4% | 66% | Medium | Hail storm (5%) |
| EVT_TRANSIT_09 | Equipment Calibration Drift | 3% | 69% | Low | Son gets lost (2%) |
| EVT_TRANSIT_07 | Food Storage Contamination | 3% | 72% | Medium | Fire in wagon (2%) |
| EVT_UNIVERSAL_05 | Unexpected Science Discovery | 3% | 75% | Positive | — (new) |
| EVT_UNIVERSAL_06 | Coronal Mass Ejection | 3% | 78% | CRITICAL | Blizzard |
| — | *No event this turn* | 22% | 100% | — | — |

**Transit Pool Total: 78% event chance per turn, 22% quiet turn.**

**Distribution Analysis:**
- Negative events: 66% (14 events)
- Positive events: 7% (2 events)
- No event: 22%
- Ratio of negative to positive: ~9.4:1 (Oregon Trail was 15:1)

---

### Surface Event Pool (Phase 6)

Events drawn during Surface Operations. One event per turn.

| ID | Event | Weight | Cumulative | Severity | Oregon Trail Analog |
|---|---|---|---|---|---|
| EVT_SURFACE_01 | Lunar Dust Contamination | 8% | 8% | Medium | Unsafe water (5%) |
| EVT_SURFACE_07 | Temperature Extreme | 7% | 15% | Medium | Cold weather |
| EVT_UNIVERSAL_01 | Crew Illness: Radiation Sickness | 6% | 21% | High | Illness — serious |
| EVT_SURFACE_05 | Habitat Pressure Warning | 6% | 27% | High | Wagon swamped (10%) |
| EVT_TRANSIT_05 | Crew Psychological Stress | 5% | 32% | Low-Medium | Illness — mild |
| EVT_SURFACE_02 | Solar Panel Damage | 5% | 37% | Medium-High | Wagon breakdown |
| EVT_SURFACE_03 | Ice Deposit Discovery | 5% | 42% | Positive | Helpful Indians (5%) |
| EVT_UNIVERSAL_02 | Equipment Failure: Critical System | 5% | 47% | High | Wild animals (10%) |
| EVT_TRANSIT_02 | Solar Flare Warning | 4% | 51% | Medium-High | Heavy rains |
| EVT_SURFACE_06 | Regolith 3D Printer Success | 4% | 55% | Positive | — (new) |
| EVT_SURFACE_08 | Rover Malfunction | 4% | 59% | Low-Medium | Ox wanders (2%) |
| EVT_UNIVERSAL_03 | Crew Conflict | 4% | 63% | Low-Medium | Daughter breaks arm |
| EVT_UNIVERSAL_04 | Supply Module Damage | 4% | 67% | Medium | Hail storm (5%) |
| EVT_SURFACE_04 | EVA Suit Breach | 3% | 70% | Critical | Poisonous snake (2%) |
| EVT_UNIVERSAL_05 | Unexpected Science Discovery | 3% | 73% | Positive | — (new) |
| EVT_UNIVERSAL_06 | Coronal Mass Ejection | 3% | 76% | CRITICAL | Blizzard |
| EVT_TRANSIT_04 | Oxygen Recycler Malfunction | 2% | 78% | Medium | Ox injury |
| — | *No event this turn* | 22% | 100% | — | — |

**Surface Pool Total: 78% event chance per turn, 22% quiet turn.**

**Distribution Analysis:**
- Negative events: 63% (13 events)
- Positive events: 12% (3 events)
- No event: 22%
- Ratio of negative to positive: ~5.25:1 (slightly more generous than transit — reward for surviving)

---

### Severity Distribution Summary

| Severity | Transit Pool | Surface Pool | Design Intent |
|---|---|---|---|
| Positive | 7% (2 events) | 12% (3 events) | Rare hope; surface rewards survival |
| Low | 12% (3 events) | 0% | Light pressure, specialist showcase |
| Low-Medium | 12% (2 events) | 9% (2 events) | Morale and parts drain |
| Medium | 12% (3 events) | 17% (3 events) | Core resource erosion |
| Medium-High | 10% (1 event) | 9% (2 events) | Significant choices required |
| High | 16% (3 events) | 17% (3 events) | Major resource loss, crew risk |
| Critical | 3% (1 event) | 6% (2 events) | Potential crew death |

---

## Phase-Specific Event Availability Matrix

| Event | Ph 2: Launch | Ph 3: Transit | Ph 4: Gateway | Ph 5: Descent | Ph 6: Surface |
|---|:---:|:---:|:---:|:---:|:---:|
| EVT_TRANSIT_01 — Micrometeorite Strike | | ✅ | | | |
| EVT_TRANSIT_02 — Solar Flare Warning | | ✅ | | | ✅ |
| EVT_TRANSIT_03 — Navigation Computer Glitch | | ✅ | | | |
| EVT_TRANSIT_04 — Oxygen Recycler Malfunction | | ✅ | | | ✅ |
| EVT_TRANSIT_05 — Crew Psychological Stress | | ✅ | | | ✅ |
| EVT_TRANSIT_06 — Communications Blackout | | ✅ | | | |
| EVT_TRANSIT_07 — Food Storage Contamination | | ✅ | | | |
| EVT_TRANSIT_08 — Space Debris Field | | ✅ | | | |
| EVT_TRANSIT_09 — Equipment Calibration Drift | | ✅ | ✅ | | |
| EVT_TRANSIT_10 — Inspirational Earth View | | ✅ | | | |
| EVT_SURFACE_01 — Lunar Dust Contamination | | | | | ✅ |
| EVT_SURFACE_02 — Solar Panel Damage | | | | | ✅ |
| EVT_SURFACE_03 — Ice Deposit Discovery | | | | | ✅ |
| EVT_SURFACE_04 — EVA Suit Breach | | | | | ✅ |
| EVT_SURFACE_05 — Habitat Pressure Warning | | | | | ✅ |
| EVT_SURFACE_06 — Regolith 3D Printer Success | | | | | ✅ |
| EVT_SURFACE_07 — Temperature Extreme | | | | | ✅ |
| EVT_SURFACE_08 — Rover Malfunction | | | | | ✅ |
| EVT_UNIVERSAL_01 — Radiation Sickness | ✅ | ✅ | ✅ | ✅ | ✅ |
| EVT_UNIVERSAL_02 — Equipment Failure | ✅ | ✅ | ✅ | ✅ | ✅ |
| EVT_UNIVERSAL_03 — Crew Conflict | | ✅ | ✅ | | ✅ |
| EVT_UNIVERSAL_04 — Supply Module Damage | ✅ | ✅ | | ✅ | ✅ |
| EVT_UNIVERSAL_05 — Science Discovery | | ✅ | ✅ | | ✅ |
| EVT_UNIVERSAL_06 — Coronal Mass Ejection | | ✅ | | ✅ | ✅ |

**Notes:**
- Phase 1 (Mission Prep) has **no random events** — it's purely a planning/shopping phase.
- Phase 2 (Launch) has minimal events — only Universal events that represent systemic risks during ascent.
- Phase 4 (Gateway) is a brief resupply phase with reduced event exposure.
- Phase 5 (Descent) has Universal events plus CME — a solar event during descent is catastrophic.
- Phase 7 (Colony Establishment) has **no random events** — it's a scoring/resolution phase.

---

## Event Chains

Event chains are sequences where one event triggers or increases the probability of follow-up events on subsequent turns. They create escalating crises that reward proactive resource management.

### Chain 1: Cascading System Failure

**Trigger:** EVT_UNIVERSAL_02 — Equipment Failure: Critical System (if the skill challenge is **failed**)

```
Turn N:   Equipment Failure (skill challenge FAILED)
            → -5 Spare Parts, crew member injured
            → Sets flag: SYSTEM_DEGRADED = true

Turn N+1: If SYSTEM_DEGRADED and Spare Parts < 5:
            → 60% chance: EVT_SURFACE_05 — Habitat Pressure Warning fires
            → (damaged system cascades into structural failure)

Turn N+2: If Habitat Pressure Warning was NOT repaired (Option B chosen):
            → 40% chance: CREW EMERGENCY
            → Random crew member health drops 25%
            → -1 Life Support (emergency O₂ venting)
            → SYSTEM_DEGRADED flag cleared
```

**Player Agency:** The chain can be broken at every link:
1. Succeed at the skill challenge → chain never starts
2. Have ≥ 5 Spare Parts → cascading failure doesn't trigger
3. Repair the habitat pressure leak (Option A) → chain terminates
4. Even at the final stage, it's a 40% chance — not guaranteed

**Design Note:** This chain teaches players that deferred maintenance is dangerous. Choosing the "cheap" option at each stage compounds into a crisis. It mirrors real mission planning, where NASA's philosophy is "fix it now, because later will be worse."

---

### Chain 2: Solar Storm Sequence

**Trigger:** EVT_TRANSIT_02 — Solar Flare Warning (if the player chose **Option B: Push through**)

```
Turn N:   Solar Flare Warning → Player chooses "Push through"
            → -2 Shielding
            → Sets flag: FLARE_PUSHED = true

Turn N+1: If FLARE_PUSHED:
            → 25% chance: EVT_UNIVERSAL_06 — Coronal Mass Ejection fires
            → (the flare was a precursor to a CME)
            → Normal CME effects apply (-4 Shielding, all crew -20% health, etc.)
            → FLARE_PUSHED flag cleared

          If CME does NOT fire:
            → FLARE_PUSHED flag cleared (the storm passed)
```

**Player Agency:**
1. Choose Option A (Shelter) during the flare → chain never starts, but you lose time
2. Choose Option B (Push through) → 25% chance of catastrophic follow-up
3. With Scientist specialist → advance warning allows proactive shielding preparation

**Design Note:** This is the game's most punishing chain. A player who pushed through a solar flare with low shielding and then gets hit by a CME could lose crew members. The 25% probability means it's uncommon, but when it happens, it's memorable. This mirrors the Oregon Trail's mountain blizzard — the game's way of punishing players who took risks when they shouldn't have.

**Cumulative worst case (Turn N → N+1):**
- Turn N: −2 Shielding (from push-through)
- Turn N+1: −4 Shielding, all crew −20% health, −1 turn progress
- **Total: −6 Shielding, −20% crew health, −1 turn**
- If Shielding drops below 2: crew member death

---

### Chain 3: Lunar Dust Storm

**Trigger:** EVT_SURFACE_01 — Lunar Dust Contamination

```
Turn N:   Lunar Dust Contamination
            → -2 Spare Parts, crew health -10%
            → Sets flag: DUST_CONTAMINATION = true

Turn N+1: If DUST_CONTAMINATION:
            → 35% chance: EVT_SURFACE_02 — Solar Panel Damage fires
            → (dust coating reduces panel efficiency, accelerating degradation)
            → Normal Solar Panel Damage effects apply
            → If Solar Panel Damage was NOT repaired (Option B chosen):
              → Sets flag: POWER_CRISIS = true
            → DUST_CONTAMINATION flag cleared

Turn N+2: If POWER_CRISIS:
            → Automatic: POWER CRISIS EVENT (not a standard event — chain-only)
            → -3 Life Support (emergency power rationing)
            → -5 Morale (crew living in cold, dark habitat)
            → POWER_CRISIS flag cleared
```

**Player Agency:**
1. Dust contamination is automatic — chain always starts
2. Solar panel damage is a 35% chance — may not trigger
3. Repair the solar panels (Option A) → chain terminates
4. If power crisis fires, it's a one-time hit — painful but not lethal

**Design Note:** This chain reflects the real challenge Apollo astronauts flagged: lunar dust gets into everything, coating solar panels and degrading equipment. It creates a surface-specific pressure loop that rewards the Engineer specialist (reduced repair costs throughout the chain).

---

## Decision Points — Detailed Analysis

### Decision Design Principles

Every choice in the event system follows these rules:

1. **No objectively correct option.** Each choice has a context where it's optimal. "Correct" depends on current resource state, mission phase, and crew composition.
2. **Trade-offs are transparent.** The player knows what each option costs. No hidden gotchas (except event chains, which are disclosed after the first encounter).
3. **Consequences scale with game state.** Losing 2 Shielding when you have 10 feels different from losing 2 when you have 3. The same event can range from "annoying" to "catastrophic" depending on when it fires.
4. **Specialist bonuses reward crew composition.** Players who brought the right specialist get a softer version of the event, validating their Phase 1 decisions.

### Decision Matrix — When Each Option Is Best

| Event | Option A | Option B | Option C | Best Strategy Context |
|---|---|---|---|---|
| **Solar Flare Warning** | Shelter (−1 turn) | Push through (−2 Shielding) | — | A when ahead of schedule; B when behind but Shielding > 6 |
| **Oxygen Recycler** | Repair (−2 Parts) | Accept drain (+0.5 LS/turn) | — | A when > 3 turns remain; B when ≤ 2 turns to destination |
| **Space Debris Field** | Evade (−3 Propulsion) | Shield (−2 Shielding) | Risk it (30/70 gamble) | A when Propulsion > 8; B when Shielding > 6; C when desperate |
| **Solar Panel Damage** | Repair (−2 Parts) | Accept drain (+0.3 LS/turn) | — | A when > 4 surface turns remain; B when ≤ 2 turns |
| **Habitat Pressure** | Full repair (−3 Parts) | Seal module (−2 LS/turn) | — | A almost always (−2 LS/turn is devastating); B only if Parts = 0 |
| **Crew Conflict** | Side with A (−5 Morale, +A) | Side with B (−5 Morale, +B) | Mediate (−8 Morale) | A/B when that specialist is critical; C with Commander (−4 penalty) |

### Break-Even Analysis: Repair vs. Ongoing Drain

For events with "repair now vs. accept ongoing cost" choices:

| Event | Repair Cost | Ongoing Cost | Break-Even Point |
|---|---|---|---|
| Oxygen Recycler | 2 Spare Parts | 0.5 LS/turn | **4 turns** — repair is better if > 4 turns remain |
| Solar Panel Damage | 2 Spare Parts | 0.3 LS/turn | **~7 turns** — repair is better if > 7 surface turns remain |
| Habitat Pressure | 3 Spare Parts | 2 LS/turn | **1.5 turns** — repair is almost ALWAYS better |

---

## Player Experience

### Emotional Arc Through Events

The event system is tuned to create a specific emotional journey:

| Phase | Event Tone | Player Feeling | Design Mechanism |
|---|---|---|---|
| Phase 3 (Transit) | Isolation, attrition | Watchful, tense | Steady resource drain, rare positives |
| Phase 6 (Surface) | Hostile environment, moments of triumph | Determined, occasionally elated | More positive events (3 vs 2), but higher severity ceiling |
| Event chains | Escalating crises | Dread, urgency | Compounding failures punish neglect |
| Positive events | Relief, celebration | Gratitude, optimism | Rare enough (~7–12%) to feel earned |
| CME | Existential terror | Fear, helplessness | The game's "you have died of dysentery" moment |

### The "Quiet Turn" Design

22% of turns have no event. This is deliberate:

1. **Pacing**: Constant events would exhaust the player. Quiet turns let them breathe.
2. **Dread**: A quiet turn makes the player think "something bad is coming." The absence of events creates tension.
3. **Resource management**: Quiet turns are when the player can assess their situation without new crises. They're the "calm before the storm."
4. **Oregon Trail precedent**: The original had implicit quiet turns where only travel distance and eating occurred.

---

## Implementation Notes

### Probability Engine

```
1. Determine active phase → select event pool (Transit or Surface)
2. Inject Universal events into the pool at their designated weights
3. Roll a random number 0–100
4. Walk the cumulative probability table until the roll falls within an event's range
5. If roll > total event weight (i.e., falls in the "no event" band), skip
6. Check event chain flags — if a chain follow-up is pending, roll for that instead
7. Check phase validity — ensure the drawn event is valid for current phase
8. Apply specialist modifiers to effects
9. If event has choices, present to player and apply selected outcome
10. Set any chain flags triggered by this event
11. Log event to mission narrative
```

### Event Queue Management

- Maximum **1 event per turn** (excluding chain follow-ups)
- Chain events **override** the normal random draw — they fire instead of a new random event
- An event **cannot fire on consecutive turns** (cooldown of 1 turn per event ID)
- The CME event has a **mission-wide cooldown of 5 turns** (it can only fire once per ~10 turn window)

### State Tracking for Chains

Three boolean flags are sufficient:

| Flag | Set By | Cleared By | Effect |
|---|---|---|---|
| `SYSTEM_DEGRADED` | Equipment Failure (failed skill check) | Chain 1 completion or repair | Enables Cascading System Failure chain |
| `FLARE_PUSHED` | Solar Flare Warning (Option B) | Next turn (regardless of CME roll) | 25% chance of CME on next turn |
| `DUST_CONTAMINATION` | Lunar Dust Contamination | Next turn (regardless of panel roll) | 35% chance of Solar Panel Damage on next turn |
| `POWER_CRISIS` | Solar Panel Damage (Option B, during dust chain) | Next turn (automatic) | Triggers Power Crisis event |

### Event Logging

Every event is recorded for the end-of-mission narrative playback:

```
EventLog {
  turn:         int
  event_id:     string
  description:  string
  choice_made:  string?
  effects:      Effect[]
  crew_affected: string?
  chain_source:  string?   // If this event was triggered by a chain
}
```

---

## Balance Notes & Design Rationale

### Resource Drain Budget

Across a typical 10-turn transit + 8-turn surface game (18 total turns), expected resource losses from events alone (assuming average luck and no specialist bonuses):

| Resource | Expected Transit Drain | Expected Surface Drain | Total Expected Drain |
|---|---|---|---|
| Spare Parts | −8 to −12 | −6 to −10 | −14 to −22 |
| Life Support | −3 to −5 | −4 to −7 | −7 to −12 |
| Shielding | −2 to −4 | −2 to −4 | −4 to −8 |
| Medical | −2 to −3 | −2 to −3 | −4 to −6 |
| Propulsion | −2 to −5 | 0 | −2 to −5 |
| Morale | −15 to −25 | −10 to −20 | −25 to −45 |

**Implication for Mission Prep:** Players must budget for these expected losses during Phase 1 resource allocation. A balanced loadout should survive average luck; a specialized loadout can survive bad luck in one area but will be vulnerable in others.

### Specialist Value Ranking

Based on event mitigation frequency and impact:

1. **Engineer** — Modifies 7 events, including auto-success on skill challenges. Most broadly valuable.
2. **Doctor** — Modifies 3 events, but those events are the most health-threatening. Prevents crew death.
3. **Scientist** — Modifies 3 events with large bonuses (doubled ice discovery, doubled score). High ceiling, low floor.
4. **Pilot** — Modifies 2 events (navigation glitch, debris evasion). Niche but impactful in transit.
5. **Commander** — Modifies 1 event (crew conflict) but leadership bonus affects morale economy globally.

### Oregon Trail Comparison

| Metric | Oregon Trail (1978) | Lunar Colony 3000 |
|---|---|---|
| Total events | 16 | 24 |
| Positive events | 1 (6.25%) | 4 (16.7%) |
| Negative events | 15 (93.75%) | 20 (83.3%) |
| Most common event | Illness (26%) | Solar Flare Warning (10% transit) / Dust (8% surface) |
| Fatal events | ~4 (snakebite, blizzard, combat, starvation) | 2 (CME, EVA suit breach) |
| Player choice events | ~2 (riders, hunting) | 6 (flare, debris, recycler, panels, pressure, conflict) |
| Event pools | 1 (all events, all locations) | 2 (Transit + Surface, with Universal overlap) |

The event system is more generous than the original Oregon Trail (4 positives vs 1, more player agency) but maintains the hostile tone through higher event frequency (78% vs ~100% in Oregon Trail, but with more severe individual impacts).

---

## References

- [Lunar Colony 3000 — Game Overview](lunar-colony-overview.md)
- [Oregon Trail Mechanics Analysis](../.github/references/oregon-trail-analysis.md)
- [Event System Template](templates/event-system.md)
- NASA Space Weather Prediction Center — solar event classification and effects
- Apollo Program Lunar Dust Reports — regolith hazard characterization
- ESA ECLSS Technical Documentation — life support failure modes
