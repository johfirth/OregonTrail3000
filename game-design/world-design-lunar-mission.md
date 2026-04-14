# World Design — Lunar Colony 3000

> **Status**: Draft
> **Author**: Game Designer Agent
> **Last Updated**: 2025-07-18
> **Parent Document**: [Lunar Colony Overview](lunar-colony-overview.md)

## Overview

Lunar Colony 3000 is a text-based adventure set during NASA's Artemis program (2026–2030). The player commands a crew of up to 5 specialists on a ~240,000-mile journey from Kennedy Space Center to the Moon's south pole. The world is organized into **7 sequential phases**, each functioning as a distinct location zone with its own hazards, resources, and player actions — mirroring the geographic progression of the original Oregon Trail.

The world is hard sci-fi in flavor but game-friendly in execution: real orbital mechanics are simplified into turn-based decisions, real landing sites provide strategic variety, and real environmental hazards create emergent drama.

---

## Setting

### Time Period

- **Era**: 2026–2030, the peak of NASA's Artemis program
- The Space Launch System (SLS) Block 2 is operational
- Lunar Gateway station orbits the Moon in a Near-Rectilinear Halo Orbit (NRHO)
- The Human Landing System (HLS) is proven technology
- In-Situ Resource Utilization (ISRU) is experimental but viable
- International and commercial partners contribute modules and supplies
- **Gameplay effect**: The player has access to real-but-cutting-edge technology. Nothing is science fiction — everything is science *almost-fact*. Equipment can fail because it's first-generation, not because it's fantasy.

### Geography

The "geography" of this game is **orbital mechanics rendered as a trail**:

| Segment | Real-World Equivalent | Game Distance | Travel Turns |
|---|---|---|---|
| Earth surface → LEO | Launch + ascent | 0–250 mi altitude | 1 turn (launch event) |
| LEO → TLI | Trans-Lunar Injection burn | 250 mi → escape velocity | 1 turn (burn event) |
| TLI → NRHO | Cislunar coast | ~240,000 mi | 6 turns (1 turn = ~12 hrs) |
| NRHO → Gateway dock | Rendezvous maneuver | ~100 mi relative | 1 turn |
| Gateway → descent orbit | De-orbit burn | NRHO → 15 mi altitude | 1 turn |
| Descent → landing | Powered descent | 15 mi → 0 | 1–3 turns (skill challenge) |
| Surface operations | EVA & construction | Radius ~5 mi from lander | 12–20 turns |

**Total journey**: ~22–33 turns from launch to colony establishment.

### Culture & Society

- **Mission Control (Houston)**: The player's lifeline. Provides advice, relays telemetry warnings, and occasionally overrides decisions. Communication has a 1.3-second delay (Earth–Moon), which is abstracted as "you can't get real-time help."
- **Crew dynamics**: 5 specialists with distinct personalities, skills, and stress responses. Social friction is a hazard — cramped quarters for 3+ days breed conflict.
- **International cooperation**: Gateway modules are contributed by ESA, JAXA, and CSA. Some resupply options reflect international partnerships (e.g., ESA care packages, JAXA experimental equipment).
- **Public attention**: The mission is livestreamed. Certain dramatic events generate "Public Interest" which can unlock bonus funding or political pressure to take risks.

---

## Locations

### Route Overview

```
                        LUNAR COLONY 3000 — MISSION TRAJECTORY
                        ======================================

  EARTH                                                              MOON
    ┃                                                                 ┃
    ┃  Phase 1       Phase 2        Phase 3          Phase 4          ┃
    ┃  MISSION       LAUNCH &       LUNAR            GATEWAY          ┃
    ┃  PREP          EARTH ORBIT    TRANSIT           STATION          ┃
    ┃                                                                 ┃
    ╋━━━━━━━━━━╋━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━╋        ┃
  KSC         LEO         TLI              Cislunar       NRHO       ┃
  (0 mi)    (250 mi)   (250+ mi)        (~120,000 mi)  (240,000 mi) ┃
                                                                     ┃
                                            Phase 5                  ┃
                                            DESCENT ━━━━━━━━━━━━━━━━╋
                                                                     ┃
                                            Phase 6                  ┃
                                            SURFACE OPS ━━━━━━━━━━━━╋
                                                                     ┃
                                            Phase 7        ┏━━━━━━━━╋
                                            COLONY!        ┃  🌙    ┃
                                                           ┗━━━━━━━━┛

  ═══ Propulsive flight    ━━━ Coast/orbit    ╋ Decision point
```

### Journey Distance Table

| # | Location | Distance from Earth | Phase | Type | Oregon Trail Parallel |
|---|----------|--------------------:|-------|------|----------------------|
| 1 | Kennedy Space Center | 0 mi | 1 — Mission Prep | Origin | Independence, MO |
| 2 | Low Earth Orbit (LEO) | 250 mi | 2 — Launch & Orbit | Checkpoint | Departure checkpoint |
| 3 | Cislunar Space | 250–239,900 mi | 3 — Lunar Transit | Trail | The Great Plains |
| 4 | Lunar Gateway Station | ~240,000 mi | 4 — Orbit & Gateway | Fort | Fort Kearny / Fort Laramie |
| 5 | Near-Rectilinear Halo Orbit | ~240,000 mi | 4 — Orbit & Gateway | Staging Area | River crossing staging |
| 6–10 | Landing Site (player choice) | Surface | 5 — Descent & Landing | Destination approach | Mountain pass |
| 11–14 | Surface Zones | Surface (0–5 mi radius) | 6–7 — Surface & Colony | Final destination | Willamette Valley |

---

### Location Details

---

#### 1. Kennedy Space Center (KSC)

- **Type**: Origin / Mission Prep Hub
- **Phase**: 1 — Mission Prep
- **Distance**: 0 mi (Earth surface, Merritt Island, Florida)
- **Oregon Trail parallel**: Independence, Missouri — the outfitting town

**Description**:
The player stands in the Vehicle Assembly Building, looking up at the fully stacked SLS rocket. Banks of monitors show weather data, trajectory calculations, and crew vitals. The air smells like ozone and anticipation. Outside, the crawlerway stretches toward Pad 39B, where the rocket will roll out for launch. This is the last place where everything is cheap and nothing is life-or-death.

**Available actions**:
| Action | Effect |
|--------|--------|
| Allocate mission budget | Distribute credits across 6 resource categories |
| Select crew | Choose 5 specialists from a pool of 8–10 candidates |
| Configure spacecraft | Choose loadout trade-offs (heavy shielding vs. more fuel, etc.) |
| Run simulations | Spend time (turns) to reduce risk on specific phases |
| Review mission briefing | View landing site previews, hazard forecasts |
| Set departure window | Choose launch date — affects solar weather during transit |

**Resources available**:
| Resource | Base Cost | Notes |
|----------|----------:|-------|
| Propulsion (fuel units) | 50 credits/unit | Bulk discount at 20+ units |
| Life Support (supply days) | 30 credits/day | Minimum 10 days required |
| Spare Parts | 40 credits/unit | Each unit = 1 repair attempt |
| Radiation Shielding | 100 credits/rating | Expensive but critical |
| Medical/Science | 60 credits/unit | Dual-purpose: health + score |
| Reserve Budget | 1:1 | Unspent credits carry forward |

**Starting budget**: 2,000 credits (Astronaut difficulty)

**Hazards**: None — this is the safe zone. But every credit spent here is a credit you don't have later.

**Events**:
- Weather delay (lose 1 turn, solar weather shifts)
- Crew personality conflict discovered during training (morale penalty)
- Last-minute equipment upgrade offered (spend credits or decline)
- Congressional oversight visit (cosmetic event, boosts Public Interest)

---

#### 2. Low Earth Orbit (LEO)

- **Type**: Systems Check Zone / Checkpoint
- **Phase**: 2 — Launch & Earth Orbit
- **Distance**: ~250 miles altitude, orbital velocity ~17,500 mph
- **Oregon Trail parallel**: First river crossing — commit or turn back

**Description**:
The roar of launch fades to silence. Through the porthole, Earth curves impossibly blue against black. The crew floats in microgravity for the first time on this mission. Every system needs a green light before Mission Control authorizes Trans-Lunar Injection — the burn that commits you to the Moon. This is your last chance to abort cheaply.

**Available actions**:
| Action | Effect |
|--------|--------|
| Run full systems check | Reveals hidden equipment damage from launch vibration |
| Perform TLI burn | Commits to lunar transit (no return without major fuel cost) |
| Delay in orbit | +1 turn, consume 0.5 life support days, may improve solar forecast |
| Abort to Earth | End mission (scored as failure, but crew survives) |
| Jettison damaged equipment | Free mass budget but lose the item permanently |

**Resources available**: No resupply. You have only what you launched with.

**Hazards**:
| Hazard | Probability | Effect |
|--------|:-----------:|--------|
| Launch vibration damage | 15% | 1 random system at reduced capacity |
| Space sickness (crew) | 30% | 1–2 crew incapacitated for 2 turns |
| Orbital debris warning | 10% | Must maneuver, costs fuel |
| Communications glitch | 5% | Lose Mission Control support for 1 turn |

**Key decision**: **Go / No-Go for TLI**. If systems check reveals damage, the player must decide: proceed with damaged equipment, spend spare parts to fix it, or abort. Aborting here is embarrassing but safe. Proceeding with damage is risky but preserves the mission.

---

#### 3. Cislunar Space (Transit)

- **Type**: Trail / Open transit zone
- **Phase**: 3 — Lunar Transit
- **Distance**: 250 mi → 239,900 mi (approximately 240,000 mi total)
- **Duration**: 6 turns (each turn ≈ 12 hours, total ~3 days)
- **Oregon Trail parallel**: The Great Plains — long, resource-draining, random events

**Description**:
Earth shrinks behind you. The Moon grows ahead. Between them: nothing. Three days of coasting through the void, monitoring systems, rationing supplies, and hoping the Sun stays quiet. The crew plays cards, runs experiments, and tries not to think about how thin the hull is. Every 12 hours, a turn passes — and something might go wrong.

**Available actions**:
| Action | Effect |
|--------|--------|
| Maintain course | Standard resource consumption, advance 1 turn |
| Perform course correction | Costs 1 fuel unit, required if trajectory drifts |
| Run experiments | Science crew earns bonus score, slight medical supply cost |
| Crew rest cycle | Reduces stress, costs 1 extra life support day |
| Emergency drill | Spend 1 turn, +10% success rate on next hazard response |
| Conserve resources | Half rations — saves 0.5 life support/turn, crew stress +1 |

**Resources consumed per turn**:
| Resource | Normal Rate | Conservation Rate |
|----------|:-----------:|:-----------------:|
| Life Support | 1.0 days | 0.5 days |
| Propulsion | 0.0 (coasting) | 0.0 |
| Spare Parts | 0.0 | 0.0 |
| Shielding | 0.0 (passive) | 0.0 |
| Medical/Science | 0.1 (maintenance) | 0.1 |

**Hazards (random event pool — 1 event per turn, 60% chance)**:

| Hazard | Probability | Severity | Effect |
|--------|:-----------:|:--------:|--------|
| Solar flare (minor) | 15% | ⚠️ Low | Crew radiation +1; shielding absorbs if rating ≥ 2 |
| Solar flare (major) | 5% | 🔴 High | Crew radiation +3; requires shielding ≥ 4 or crew health drops |
| Coronal Mass Ejection (CME) | 2% | 💀 Critical | Radiation +5; shelter protocol required or crew member at risk of death |
| Micrometeorite strike | 10% | ⚠️ Low | Hull integrity -1; repair with spare part or leak worsens |
| Equipment malfunction | 12% | ⚠️ Medium | Random system degrades; spare part to fix |
| Crew stress event | 10% | ⚠️ Low | Morale drops; options: mediate, ignore, sedate |
| Crew illness | 5% | ⚠️ Medium | 1 crew member sick; medical supplies to treat |
| Communication blackout | 5% | ⚠️ Low | No Mission Control advice for 1 turn |
| Nothing happens | 40% | ✅ None | Quiet turn — resource consumption only |

**Key mechanic**: This phase is a **resource attrition gauntlet**. The player must survive 6 turns of consumption and random events with whatever they packed at KSC. Over-packing life support here means under-packing fuel for landing.

---

#### 4. Lunar Gateway Station

- **Type**: Fort / Resupply station
- **Phase**: 4 — Lunar Orbit & Gateway
- **Distance**: ~240,000 mi from Earth (NRHO orbit around Moon)
- **Oregon Trail parallel**: Fort Laramie — the mid-journey resupply point with premium prices

**Description**:
Gateway appears as a small bright cross against the Moon's grey surface — a collection of modules no bigger than a school bus, orbiting in a vast halo path. Docking is automated but tense. Inside, the station smells like recycled air and aluminum. Supply racks line the walls. Everything here costs double what it cost at KSC — it had to be launched from Earth months ago.

**Available actions**:
| Action | Effect |
|--------|--------|
| Dock with Gateway | Required to access station; costs 1 fuel unit for rendezvous |
| Resupply (buy resources) | Purchase at 2× KSC prices using reserve budget |
| Crew rest | Full rest cycle: stress reset, minor health recovery (1 turn) |
| Repair equipment | Use Gateway's workshop: +50% repair success rate |
| Select landing site | **Critical decision** — choose from 5 candidate sites |
| Transfer to HLS lander | Commit to descent phase; no return to Gateway |
| Consult Mission Control | Get updated hazard data for landing sites |
| Trade with international module | ESA/JAXA supplies at 1.5× price (different inventory) |

**Resources available for purchase**:
| Resource | Gateway Price | KSC Price | Markup |
|----------|-------------:|----------:|:------:|
| Propulsion | 100 credits/unit | 50 credits/unit | 2× |
| Life Support | 60 credits/day | 30 credits/day | 2× |
| Spare Parts | 80 credits/unit | 40 credits/unit | 2× |
| Shielding | 150 credits/rating | 100 credits/rating | 1.5× |
| Medical/Science | 100 credits/unit | 60 credits/unit | 1.7× |

**Hazards**:
| Hazard | Probability | Effect |
|--------|:-----------:|--------|
| Docking malfunction | 10% | Costs extra fuel unit; potential hull scratch |
| Gateway supply shortage | 15% | 1–2 resource types unavailable |
| Station emergency | 5% | Must evacuate quickly; lose 1 turn of rest/resupply |

**Key decision**: **Landing site selection** (see Landing Sites section below). This is the single most consequential strategic decision in the game.

---

#### 5. Near-Rectilinear Halo Orbit (NRHO) — Staging Area

- **Type**: Staging / Transfer zone
- **Phase**: 4–5 transition
- **Distance**: ~240,000 mi from Earth, ~43,500 mi above lunar north pole at apoapsis, ~1,000 mi above south pole at periapsis
- **Oregon Trail parallel**: The river bank before a major crossing — final preparations

**Description**:
You've undocked from Gateway and transferred into the Human Landing System — a separate spacecraft that will carry you to the surface. The lander feels smaller, more fragile. Through the triangular windows, the Moon fills your entire view: grey, pockmarked, ancient. You can see the south pole's long shadows. The descent burn is minutes away. Everything you've done has led to this.

**Available actions**:
| Action | Effect |
|--------|--------|
| Final systems check | Last chance to catch problems; reveals lander status |
| Compute descent trajectory | Required before descent; uses landing site data |
| Adjust fuel reserves | Redistribute fuel between descent and abort reserves |
| Abort to Gateway | Return to Gateway (costs 2 fuel units, adds 2 turns) |
| Begin powered descent | Commits to landing sequence |

**Resources available**: None for purchase. This is a commitment zone.

**Hazards**:
| Hazard | Probability | Effect |
|--------|:-----------:|--------|
| Lander system fault | 8% | Must repair or abort |
| Navigation sensor drift | 12% | Descent accuracy reduced; increases landing difficulty |
| Communication shadow | 5% | Lose Earth contact during part of descent |

---

### Landing Sites

The player selects one of 5 candidate sites at the Moon's south pole. Each site is a real location from NASA's Artemis landing site studies. The choice creates a **unique risk/reward profile** for the rest of the game.

All sites are within the south polar region (85°S–90°S latitude), where:
- Permanently Shadowed Regions (PSRs) contain water ice
- Elevated rims receive near-continuous sunlight
- Terrain is ancient, rugged, and cratered

---

#### 6. Shackleton Crater Rim

- **Type**: Landing site (player-selectable)
- **Coordinates**: ~89.9°S, 0°E
- **Oregon Trail parallel**: The easy mountain pass — safest route, moderate rewards

**Description**:
The rim of Shackleton Crater catches sunlight nearly 90% of the time — a golden ridge surrounded by permanent shadow. The terrain is relatively flat for a polar site, with gentle slopes and few boulders. Below, in the crater's eternal darkness, ice deposits wait. It's the most studied site on the south pole: well-mapped, well-understood, and as close to "safe" as the Moon gets.

**Available actions (post-landing)**:
- Deploy solar arrays on the sunlit rim (high efficiency)
- Send rover into Shackleton crater for ice extraction (moderate difficulty)
- Construct habitat on flat rim terrain (low difficulty)
- Establish Earth communication relay (good line-of-sight)

**Characteristics**:
| Attribute | Rating | Notes |
|-----------|:------:|-------|
| Sunlight (solar power) | ★★★★★ | ~90% illumination; best solar site |
| Ice Access | ★★★☆☆ | Shackleton PSR nearby but steep descent into crater |
| Terrain Difficulty | ★★☆☆☆ | Relatively flat rim, few obstacles |
| Earth Communications | ★★★★☆ | Good Earth visibility from rim |
| Scientific Interest | ★★★☆☆ | Well-studied; fewer surprises |

**Unique hazard**: Crater rim is narrow in places — base construction must avoid edges.
**Unique benefit**: Most forgiving site for first-time players; consistent solar power.

---

#### 7. de Gerlache Crater Rim

- **Type**: Landing site (player-selectable)
- **Coordinates**: ~88.5°S, 270°E
- **Oregon Trail parallel**: The moderate pass — harder terrain, better hunting grounds

**Description**:
De Gerlache's rim is a jagged, shadow-streaked ridge with deep permanently shadowed regions cutting close to the surface. The ice here is more accessible than at Shackleton — you won't need to descend into a deep crater to reach it. But the terrain is punishing: sharp-edged rocks, steep local slopes, and narrow flat zones for landing. The sunlight is decent but interrupted by surrounding topography.

**Available actions (post-landing)**:
- Deploy solar arrays on intermittently lit ridgeline (moderate efficiency)
- Extract ice from shallow PSRs within walking distance (low difficulty)
- Construct habitat on limited flat zones (moderate difficulty)
- Set up relay antenna for Earth comms (moderate line-of-sight)

**Characteristics**:
| Attribute | Rating | Notes |
|-----------|:------:|-------|
| Sunlight (solar power) | ★★★☆☆ | ~70% illumination; topographic shadowing |
| Ice Access | ★★★★☆ | Shallow PSRs close to rim; easy extraction |
| Terrain Difficulty | ★★★★☆ | Rough, rocky, steep slopes |
| Earth Communications | ★★★☆☆ | Periodic occlusion by surrounding terrain |
| Scientific Interest | ★★★★☆ | Diverse geology, unexplored PSRs |

**Unique hazard**: Rough terrain increases EVA injury risk by 20%.
**Unique benefit**: Ice extraction requires fewer turns than any other site.

---

#### 8. Nobile Crater Rim

- **Type**: Landing site (player-selectable)
- **Coordinates**: ~85.2°S, 53°E
- **Oregon Trail parallel**: The dangerous shortcut — high risk, highest resource payoff

**Description**:
Nobile is an ancient, battered crater with some of the richest confirmed ice deposits on the south pole. The rim is heavily degraded — broken and uneven, littered with boulders the size of houses. Sunlight is scarce; the surrounding terrain casts long shadows that keep much of the area in perpetual twilight. Landing here is a gamble: the ice could sustain a colony for years, but getting the base built before power runs out is a race against darkness.

**Available actions (post-landing)**:
- Deploy solar arrays on scattered sunlit patches (low efficiency, must be distributed)
- Extract ice from abundant shallow deposits (very low difficulty, high yield)
- Construct habitat on uneven terrain (high difficulty; requires extra spare parts)
- Establish Earth comms relay on elevated boulder (limited line-of-sight)

**Characteristics**:
| Attribute | Rating | Notes |
|-----------|:------:|-------|
| Sunlight (solar power) | ★★☆☆☆ | ~50% illumination; deep shadows |
| Ice Access | ★★★★★ | Richest confirmed deposits; surface-accessible |
| Terrain Difficulty | ★★★★★ | Extremely rough, boulder-strewn, uneven |
| Earth Communications | ★★☆☆☆ | Obstructed sightlines; intermittent contact |
| Scientific Interest | ★★★★★ | Pristine ancient terrain; high discovery potential |

**Unique hazard**: Solar power deficit — must rely on fuel cells as backup; life support at risk during extended shadow periods.
**Unique benefit**: Ice yield is 2× all other sites — fastest path to water self-sufficiency.

---

#### 9. Connecting Ridge

- **Type**: Landing site (player-selectable)
- **Coordinates**: ~88.0°S, 120°E
- **Oregon Trail parallel**: The standard trail — no extremes, no shortcuts, predictable

**Description**:
The Connecting Ridge links the rims of Shackleton and de Gerlache craters — an elevated spine of ancient regolith with moderate sunlight, moderate ice access, and moderate everything else. It's not the best at anything, but it's not the worst either. For a commander who wants a balanced hand, this is the conservative play. The ridge offers decent flat terrain for construction and reasonable access to PSRs on either side.

**Available actions (post-landing)**:
- Deploy solar arrays along the ridge spine (moderate efficiency)
- Access PSRs on either flank for ice extraction (moderate difficulty)
- Construct habitat on ridgeline flats (moderate difficulty)
- Dual-direction Earth communication relay (good sightlines)

**Characteristics**:
| Attribute | Rating | Notes |
|-----------|:------:|-------|
| Sunlight (solar power) | ★★★★☆ | ~75% illumination; ridge catches light well |
| Ice Access | ★★★☆☆ | PSRs accessible on both flanks, moderate distance |
| Terrain Difficulty | ★★★☆☆ | Ridge is walkable; flanks are steep |
| Earth Communications | ★★★★☆ | Elevated position, good Earth visibility |
| Scientific Interest | ★★★☆☆ | Geologically interesting transition zone |

**Unique hazard**: Ridge is narrow — limited buildable area; expansion constrained.
**Unique benefit**: Balanced risk profile; no single critical weakness.

---

#### 10. Malapert Massif

- **Type**: Landing site (player-selectable)
- **Coordinates**: ~86.0°S, 0°E
- **Oregon Trail parallel**: The scenic overlook — best views, best comms, but thin on resources

**Description**:
Malapert Massif is a mountain. A genuine 5-kilometer-high lunar mountain near the south pole, with the best direct line-of-sight to Earth of any candidate site. Standing on its summit, you could theoretically see Earth without relay satellites — and Earth can see you. Sunlight on the peak is excellent. But ice? Ice is far below, in shadowed valleys that require long, treacherous EVA traverses. Building a colony here means excellent communications and power, but a constant struggle for water.

**Available actions (post-landing)**:
- Deploy solar arrays on peak (high efficiency; excellent sunlight)
- Establish direct-to-Earth communication dish (best comms of any site)
- Construct habitat on summit plateau (moderate difficulty, limited area)
- Long-range EVA to valley PSRs for ice (high difficulty, 2× travel time)

**Characteristics**:
| Attribute | Rating | Notes |
|-----------|:------:|-------|
| Sunlight (solar power) | ★★★★★ | ~90% illumination; peak altitude advantage |
| Ice Access | ★★☆☆☆ | Distant valley PSRs; long EVA required |
| Terrain Difficulty | ★★★☆☆ | Summit is manageable; slopes to ice are steep |
| Earth Communications | ★★★★★ | Direct line-of-sight; no relay needed |
| Scientific Interest | ★★★★☆ | Unique highland geology; potential pyroclastic deposits |

**Unique hazard**: Water acquisition costs 2× time and crew fatigue; dehydration risk is elevated.
**Unique benefit**: Uninterrupted Earth communication — Mission Control support never drops out.

---

### Landing Site Selection Table

| Site | Sunlight | Ice Access | Terrain | Earth Comms | Science | Risk | Reward | Play Style |
|------|:--------:|:----------:|:-------:|:-----------:|:-------:|:----:|:------:|------------|
| **Shackleton Rim** | ★★★★★ | ★★★☆☆ | ★★☆☆☆ | ★★★★☆ | ★★★☆☆ | Low | Moderate | Safe / Beginner |
| **de Gerlache Rim** | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | Medium | High | Ice-focused |
| **Nobile Rim** | ★★☆☆☆ | ★★★★★ | ★★★★★ | ★★☆☆☆ | ★★★★★ | Very High | Very High | Expert / Gambler |
| **Connecting Ridge** | ★★★★☆ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | Low | Moderate | Balanced / Safe |
| **Malapert Massif** | ★★★★★ | ★★☆☆☆ | ★★★☆☆ | ★★★★★ | ★★★★☆ | Medium | Medium | Comms-focused |

**Terrain Difficulty rating note**: Higher stars = MORE difficult (more hazardous). All other ratings: higher = better.

**Numerical equivalents** (for implementation):

| Site | Sunlight % | Ice Yield | Landing Δv (m/s) | Comms Uptime % | Risk Score (1–10) |
|------|:----------:|:---------:|:-----------------:|:--------------:|:------------------:|
| Shackleton Rim | 90% | 60 units/turn | 1,800 | 85% | 3 |
| de Gerlache Rim | 70% | 90 units/turn | 1,950 | 65% | 6 |
| Nobile Rim | 50% | 120 units/turn | 2,100 | 45% | 9 |
| Connecting Ridge | 75% | 55 units/turn | 1,850 | 80% | 4 |
| Malapert Massif | 90% | 30 units/turn | 1,900 | 95% | 5 |

---

### Surface Zones (Post-Landing)

After landing, the area around the lander is divided into 4 operational zones. The player dispatches crew on EVA missions to each zone. All zones exist at every landing site, but their difficulty and yield vary by site selection.

---

#### 11. Landing Zone (LZ)

- **Type**: Base of operations / immediate surroundings
- **Radius**: 0–200 meters from lander
- **Oregon Trail parallel**: The campsite — where you rest, store supplies, and make decisions

**Description**:
The lander sits on its four legs in the grey dust, surrounded by a blast crater from the descent engine. Boot prints radiate outward like spokes. The ascent stage towers overhead — your lifeboat if everything goes wrong. This 200-meter circle is home: equipment lockers, the airlock, the comms antenna, and a few square meters of flat regolith for the initial habitat deployment.

**Available actions**:
| Action | Effect |
|--------|--------|
| Unload cargo | Deploy equipment from lander (required first action) |
| Set up comms antenna | Establishes Earth link; quality depends on landing site |
| Deploy emergency shelter | Temporary inflatable habitat; 2 crew capacity |
| Maintain lander systems | Keeps ascent stage viable for emergency abort |
| Triage crew health | Medical check-up; uses medical supplies |

**Resources**: Access to all lander cargo; no new resources generated here.

**Hazards**:
- Descent engine exhaust contamination (regolith around lander is disturbed and abrasive)
- Lander tip-over risk if on slope > 8° (landing quality dependent)
- Thermal cycling stress on equipment (sunlit LZs cycle +120°C to -170°C)

---

#### 12. Ice Extraction Site

- **Type**: Resource extraction zone
- **Distance**: 0.5–5 km from lander (varies by landing site)
- **Oregon Trail parallel**: Hunting grounds — leave camp, spend time, bring back essentials

**Description**:
The permanently shadowed region is the darkest place you've ever seen. Helmet lights carve white cones through absolute blackness. The temperature reads -230°C on the suit display. Beneath your boots, ancient regolith holds water ice — billions of years old, never touched by sunlight. Your drill bites into the surface, and grey-white ice chips spiral upward in slow motion. This ice is life: water to drink, oxygen to breathe, hydrogen for fuel.

**Available actions**:
| Action | Effect |
|--------|--------|
| Ice drilling (manual) | 1 crew, 1 turn: yields ice based on site rating |
| Ice drilling (automated) | Requires ISRU deploy; 0 crew, continuous yield |
| Sample collection | Science bonus; uses science equipment |
| Deploy ISRU processor | Converts raw ice to water + O₂ + H₂ (permanent upgrade) |

**Resource yield per turn** (by landing site):

| Site | Manual Yield | Automated Yield | EVA Travel Time |
|------|:------------:|:---------------:|:---------------:|
| Shackleton Rim | 10 units | 20 units/turn | 2 hrs (1.5 km into crater) |
| de Gerlache Rim | 15 units | 30 units/turn | 0.5 hrs (200m to PSR) |
| Nobile Rim | 20 units | 40 units/turn | 0.5 hrs (surface deposits) |
| Connecting Ridge | 9 units | 18 units/turn | 1.5 hrs (flank descent) |
| Malapert Massif | 5 units | 10 units/turn | 4 hrs (valley traverse) |

**Hazards**:
| Hazard | Probability | Effect |
|--------|:-----------:|--------|
| EVA suit thermal failure | 10% | Crew member at risk; abort EVA or spend medical supplies |
| Drill bit breakage | 15% | Requires spare part to repair |
| Rockfall in crater | 5% | Crew injury risk; 1 turn EVA delay |
| Navigation loss in PSR | 8% | Crew disoriented; +1 turn to return, stress increase |
| Dust contamination of ice | 10% | Reduced yield this turn (50%) |

---

#### 13. Solar Ridge

- **Type**: Power generation zone
- **Distance**: 0.2–2 km from lander (elevated terrain, site-dependent)
- **Oregon Trail parallel**: The high ground — strategic advantage, exposed position

**Description**:
The ridge catches sunlight that never quite reaches the valley floor. Up here, the Sun hangs just above the horizon — never rising, never setting, just circling the sky at a perpetual shallow angle. The regolith glows pale gold. This is where solar arrays go: angled panels drinking in photons, cables snaking downhill to the base. More panels mean more power — and power means survival.

**Available actions**:
| Action | Effect |
|--------|--------|
| Deploy solar array (small) | +5 kW capacity; 1 turn, 1 crew |
| Deploy solar array (large) | +15 kW capacity; 2 turns, 2 crew, 1 spare part |
| Repair damaged panels | 1 spare part, 1 turn |
| Run power cable to base | Connects arrays to habitat; required for powered operations |
| Deploy battery storage | Stores power for shadow periods; uses 1 spare part |

**Power requirements** (for colony establishment):
| System | Power Draw |
|--------|:----------:|
| Life support (per crew) | 2 kW |
| ISRU water processing | 5 kW |
| Habitat heating | 8 kW |
| Communications | 3 kW |
| Science equipment | 2 kW |
| **Minimum for 3 crew** | **24 kW** |
| **Target for full colony** | **40 kW** |

**Power generation** (by landing site):
| Site | Efficiency | kW per Small Array | kW per Large Array |
|------|:----------:|:------------------:|:------------------:|
| Shackleton Rim | 90% | 4.5 kW | 13.5 kW |
| de Gerlache Rim | 70% | 3.5 kW | 10.5 kW |
| Nobile Rim | 50% | 2.5 kW | 7.5 kW |
| Connecting Ridge | 75% | 3.75 kW | 11.25 kW |
| Malapert Massif | 90% | 4.5 kW | 13.5 kW |

**Hazards**:
| Hazard | Probability | Effect |
|--------|:-----------:|--------|
| Dust accumulation on panels | 20% per turn | -10% efficiency until cleaned |
| Panel structural failure | 5% | Array destroyed; must redeploy |
| EVA crew fall on slope | 8% | Injury; medical supplies needed |
| Electrical short (dust in connectors) | 7% | Power cable damaged; spare part to fix |

---

#### 14. Base Camp Construction Zone

- **Type**: Habitat construction zone
- **Distance**: 50–300 meters from lander (flat terrain selected by player)
- **Oregon Trail parallel**: Building your homestead — the final act

**Description**:
The construction zone is a patch of flat regolith that the crew has cleared of the largest rocks. Here, inflatable modules will expand into habitable spaces. Regolith will be piled onto them as radiation shielding. Airlocks will connect them to each other and to the lander. This is where the mission transforms from "visit" to "colony." Every module placed, every system connected, every test passed brings you closer to the win condition.

**Available actions**:
| Action | Effect |
|--------|--------|
| Deploy inflatable habitat module | +2 crew capacity; 2 turns, 2 crew, 2 spare parts |
| Connect airlock | Links modules; 1 turn, 1 crew, 1 spare part |
| Apply regolith shielding | +2 radiation protection; 2 turns, 1 crew |
| Install life support systems | Enables independent air/water; 1 turn, 1 crew, 1 spare part |
| Pressurize and test habitat | Required for occupancy; 1 turn, reveals defects |
| Move crew into habitat | Frees lander for other uses; habitat must be pressurized |

**Colony establishment requirements** (win condition checklist):

| Requirement | Threshold | How to Achieve |
|-------------|-----------|----------------|
| Pressurized habitat | ≥ 1 module operational | Deploy + pressurize |
| Life support independent | O₂ + H₂O from ISRU | Deploy ISRU + connect |
| Power supply stable | ≥ 24 kW sustained | Solar arrays deployed |
| Water supply sustained | ≥ 10 units/turn | Ice extraction active |
| Crew minimum | ≥ 2 alive and healthy | Keep them alive |
| Radiation shielding | ≥ 2 rating on habitat | Regolith shielding applied |

**Hazards**:
| Hazard | Probability | Effect |
|--------|:-----------:|--------|
| Module puncture during inflation | 8% | Spare part to patch; delay 1 turn |
| Regolith contamination of airlock seals | 12% | Seal failure; crew exposure risk |
| Structural settling on uneven ground | 5% | Module at risk; must reinforce (spare part) |
| Dust storm (electrostatic levitation) | 3% | Reduced visibility; EVA suspended 1 turn |

---

## Environmental Systems

### Solar Weather

Solar weather is the primary macro-hazard system. It affects the entire mission from LEO through surface operations.

**Solar Weather States** (one active state per turn, with transition probabilities):

| State | Duration | Radiation Level | Effect on Gameplay |
|-------|:--------:|:---------------:|-------------------|
| ☀️ **Quiet Sun** | 1–4 turns | Baseline | Normal operations; no radiation penalty |
| ⚡ **Active Sun** | 1–2 turns | +1 rad/turn | Minor shielding consumption; crew awareness |
| 🔥 **Solar Flare** | 1 turn | +3 rad/turn | Crew must shelter; EVA cancelled; equipment at risk |
| 💥 **CME (Coronal Mass Ejection)** | 1–2 turns | +5 rad/turn | CRITICAL — full shelter protocol; shielding consumed rapidly; crew health at risk; potential equipment destruction |

**State transition matrix**:
```
            → Quiet   → Active   → Flare   → CME
Quiet         70%       25%        4%        1%
Active        40%       40%       15%        5%
Flare         50%       30%       10%       10%
CME           60%       30%        5%        5%
```

**Radiation accumulation**:
| Crew Radiation Level | Effect |
|:--------------------:|--------|
| 0–5 rad | No effect |
| 6–10 rad | Fatigue: -1 action efficiency |
| 11–15 rad | Nausea: crew member loses 1 turn |
| 16–20 rad | Acute radiation syndrome: medical supplies required or crew member dies |
| 21+ rad | Fatal: crew member death within 1 turn |

**Shielding interaction**: Each point of shielding rating absorbs 1 rad/turn before crew is exposed. Shielding degrades by 0.5 per CME event.

---

### Temperature

Lunar surface temperatures are extreme and bimodal — there is no atmosphere to moderate them.

| Condition | Temperature | Effect on Equipment | Effect on Crew |
|-----------|:-----------:|--------------------:|----------------|
| Direct sunlight | +120°C (+248°F) | Electronics overheat after 4 hrs without cooling | EVA suit cooling system required; 1 coolant unit/EVA |
| Shadow (normal) | -170°C (-274°F) | Batteries lose 30% capacity; lubricants freeze | EVA suit heating required; 1 heater unit/EVA |
| PSR (permanent shadow) | -230°C (-382°F) | Electronics fail without heaters; mechanical joints seize | Maximum EVA duration: 2 hours; suit heater at maximum |
| Day/night boundary | Rapid thermal cycling | Thermal stress cracks in equipment; +5% malfunction rate | Crew must cross quickly; fatigue +1 |

**Temperature management actions**:
- Deploy thermal blankets on equipment (1 spare part, reduces malfunction rate)
- Schedule EVAs during optimal thermal windows
- Use lander as thermal shelter during extreme events

---

### Lunar Dust (Regolith)

Lunar dust is one of the most insidious hazards on the Moon. It is:
- **Electrostatically charged** — clings to everything
- **Abrasive** — sharp, glassy microparticles that never weather smooth
- **Pervasive** — gets into seals, joints, lungs, and electronics
- **Toxic** — contains nanoparticles of iron and silica that damage lung tissue

**Dust accumulation system**:

Every EVA increases the mission's "Dust Contamination Level" by 1 point.

| Dust Level | Effect |
|:----------:|--------|
| 0–5 | Negligible — normal operations |
| 6–10 | Seal degradation — airlock failure risk +5% per EVA |
| 11–15 | Equipment wear — all equipment malfunction rate +10% |
| 16–20 | Health hazard — crew respiratory issues (medical supplies to treat) |
| 21+ | Critical — crew health declining; equipment failing; emergency protocols |

**Dust mitigation actions**:
| Action | Effect | Cost |
|--------|--------|------|
| Brush-down before airlock entry | -1 dust level per EVA | 0 (but adds 10 min to EVA) |
| Deploy dust-exclusion airlock | -50% dust accumulation rate | 2 spare parts, 1 turn |
| Electrostatic dust repeller | -2 dust level per turn | 1 spare part, 1 kW power |

---

### Terrain

Terrain affects landing difficulty, EVA mobility, and construction feasibility.

**Terrain parameters by landing site**:

| Site | Slope (°) | Boulder Density | Crater Density | Flat Area (m²) | Mobility Rating |
|------|:---------:|:---------------:|:--------------:|:--------------:|:---------------:|
| Shackleton Rim | 3–8° | Low | Low | 5,000 | Easy |
| de Gerlache Rim | 8–15° | High | Medium | 2,000 | Hard |
| Nobile Rim | 10–20° | Very High | High | 1,500 | Very Hard |
| Connecting Ridge | 5–10° | Medium | Low | 3,500 | Moderate |
| Malapert Massif | 5–12° | Medium | Medium | 3,000 | Moderate |

**Terrain effects on gameplay**:
| Mobility Rating | EVA speed | Injury risk/EVA | Construction difficulty |
|-----------------|:---------:|:---------------:|:----------------------:|
| Easy | 2 km/hr | 3% | Normal (1× time) |
| Moderate | 1.5 km/hr | 6% | Slow (1.25× time) |
| Hard | 1 km/hr | 10% | Hard (1.5× time) |
| Very Hard | 0.5 km/hr | 15% | Very Hard (2× time) |

---

### Communication Windows

Earth communication depends on direct line-of-sight from the landing site to Earth. At the south pole, Earth appears near the horizon and is periodically blocked by terrain.

| Site | Earth Visibility | Comms Uptime | Blackout Duration |
|------|:----------------:|:------------:|:-----------------:|
| Shackleton Rim | Good | 85% | 1–2 hrs/day |
| de Gerlache Rim | Fair | 65% | 3–5 hrs/day |
| Nobile Rim | Poor | 45% | 6–10 hrs/day |
| Connecting Ridge | Good | 80% | 1–3 hrs/day |
| Malapert Massif | Excellent | 95% | <1 hr/day |

**Communication effects**:
| Comms Status | Effect |
|:------------:|--------|
| Full contact | Mission Control advice available; +10% hazard warning accuracy |
| Delayed contact | 1.3-second latency; advice available but not real-time |
| Blackout | No Mission Control; player makes all decisions alone; event difficulty +10% |
| Emergency beacon only | Last resort; takes 1 turn for help to arrive |

---

## Journey Progression

### Full Mission Timeline

```
TURN  PHASE           LOCATION                 KEY EVENT
────  ──────────────  ───────────────────────  ──────────────────────────────
 1    Mission Prep    Kennedy Space Center      Budget allocation & crew select
 2    Mission Prep    Kennedy Space Center      Spacecraft configuration
 3    Launch          Pad 39B → LEO             Launch sequence (pass/fail)
 4    Earth Orbit     LEO (250 mi)              Systems check → Go/No-Go for TLI
 5    Transit         Cislunar Space             TLI burn + coast begins
 6    Transit         Cislunar Space             Random event
 7    Transit         Cislunar Space             Random event
 8    Transit         Cislunar Space             Midpoint — Earth/Moon equidistant
 9    Transit         Cislunar Space             Random event
10    Transit         Cislunar Space             Lunar approach
11    Gateway         NRHO / Gateway Station     Docking + resupply + site selection
12    Staging         NRHO                       Transfer to lander + final checks
13    Descent         Descent orbit → surface    Powered descent (skill challenge)
14    Surface Ops     Landing Zone               Cargo unload + initial deployment
15    Surface Ops     LZ + Ice Site              First EVA — ice extraction
16    Surface Ops     LZ + Solar Ridge           Solar array deployment
17    Surface Ops     Construction Zone           Habitat module deployment
18    Surface Ops     All zones                  ISRU activation + systems connect
19    Surface Ops     All zones                  Habitat pressurization + testing
20    Surface Ops     All zones                  Crew moves into habitat
 …    Surface Ops     All zones                  Continued ops (variable turns)
 N    Colony!         Base Camp                  Colony viability assessment → SCORE
```

### Distance Progression (ASCII Map)

```
    Distance from Earth (miles)
    0          60,000     120,000    180,000    240,000
    |────────────|──────────|──────────|──────────|
    ·                                             ·
    KSC  LEO                                   MOON
    ┃     ┃                                      ┃
    ╠═════╣  Turn 3: Launch                      ┃
    ┃     ╠══════════╗                            ┃
    ┃     ┃  Turn 5  ║  TLI Burn                 ┃
    ┃     ┃          ╠═══════════╗                ┃
    ┃     ┃          ║  Turns    ║                ┃
    ┃     ┃          ║  6-10:    ╠════════════════╣
    ┃     ┃          ║  Coast    ║   Turn 11:     ┃
    ┃     ┃          ║          ║   Gateway dock  ┃
    ┃     ┃          ║          ║                 ╠══╗
    ┃     ┃          ║          ║   Turn 13:      ┃  ║
    ┃     ┃          ║          ║   Landing!      ┃  ║
    ┃     ┃          ║          ║                 ┃  ║
    ┃     ┃          ║          ║   Turns 14-N:   ┃  ║
    ┃     ┃          ║          ║   Surface Ops   ┃  ╠═🌙
    ┃     ┃          ║          ║                 ┃  ║
    ┃     ┃          ║          ║   COLONY!       ┃  ║
    ┗━━━━━┻━━━━━━━━━━╩══════════╩═════════════════┻━━╝

    ═══ Propulsive flight    ━━━ Coasting    ╋ Decision point
```

---

## Player Experience

### Emotional Arc by Phase

| Phase | Emotion | Player Feeling | Design Goal |
|-------|---------|----------------|-------------|
| **1 — Mission Prep** | 🟢 Excitement + Anxiety | "So many options, not enough budget. What if I get this wrong?" | Establish strategic tension; every choice costs something |
| **2 — Launch & LEO** | 🟡 Tension + Commitment | "We're really doing this. The rocket is shaking. Did something break?" | Build visceral stakes; first real danger |
| **3 — Transit** | 🔵 Isolation + Dread | "Nothing but void for three days. Earth is a blue dot. What was that noise?" | Slow-burn tension; resource attrition; loneliness |
| **4 — Gateway** | 🟢 Relief + Strategy | "We made it to the station. Time to plan the landing. But everything costs double…" | Brief respite; critical strategic decisions |
| **5 — Descent** | 🔴 Fear + Focus | "Fuel dropping fast. Boulder field ahead. Do I abort or commit?" | Peak tension; moment of truth; skill challenge |
| **6 — Surface Ops** | 🟠 Determination + Exhaustion | "We're on the Moon but we're not done. The dust, the cold, the distance from help…" | Grind with purpose; every turn matters; attrition returns |
| **7 — Colony** | 🏆 Triumph or 💀 Devastation | "We did it… or we didn't." | Catharsis; emotional payoff; replayability hook |

### Narrative Tone Shifts

**Turns 1–4 (Earth proximity)**: Warm, technical, optimistic. Mission Control is chatty. The crew jokes. Equipment is described in clean, new terms. The tone mirrors the optimism of a space program press conference.

**Turns 5–10 (Deep space)**: Cold, sparse, tense. Communications have a lag. Descriptions emphasize silence and distance. Equipment is described in worn, used terms. The crew is quieter. Random events feel like ambushes in the dark.

**Turns 11–12 (Gateway/staging)**: Businesslike, strategic. The tone shifts to military briefing mode. Numbers matter. The landing site choice is presented with clinical data, but the stakes bleed through. The crew is focused.

**Turn 13 (Descent)**: Staccato, urgent. Short sentences. Numbers counting down. Fuel remaining. Altitude dropping. Every word costs time. The tone mirrors Apollo 11's final descent — "60 seconds."

**Turns 14–N (Surface)**: Gritty, determined. The novelty has worn off. The Moon is beautiful but hostile. Descriptions emphasize dust, cold, and fatigue. Small victories (first water extracted, first habitat pressurized) are deeply satisfying precisely because everything else is hard.

**Final turn (Colony assessment)**: Reflective. Win or lose, the tone steps back. The game asks: "Was it worth it?" And then shows the score, the memorial, or the triumph — and asks if you want to try again.

---

## Implementation Notes

### Data Structures for Locations

Each location should be represented as a structured object containing:

```
Location {
  id: string               // e.g., "kennedy-space-center", "shackleton-rim"
  name: string             // Display name
  phase: int               // 1-7
  type: enum               // ORIGIN, CHECKPOINT, TRAIL, FORT, LANDING_SITE, SURFACE_ZONE
  distance_from_earth: int // Miles (0 for surface zones, use parent site)
  description: string      // Flavor text
  actions: Action[]        // Available player actions
  resources: Resource[]    // Purchasable/extractable resources
  hazards: Hazard[]        // Event pool with probabilities
  environment: {
    sunlight_pct: float    // 0.0-1.0
    temperature_range: [min, max]  // Celsius
    terrain_difficulty: enum       // EASY, MODERATE, HARD, VERY_HARD
    comms_uptime: float            // 0.0-1.0
  }
  oregon_trail_parallel: string   // Design note for developer context
}
```

### Map/Route Representation

The mission route is a **linear graph** with one branch point (landing site selection):

```
KSC → LEO → Cislunar[6 turns] → Gateway → NRHO → {Site Choice} → LZ → [Surface Zones]
                                                      ↓
                                              ┌───────┼───────┐───────┐───────┐
                                          Shackleton  deGerlache  Nobile  Ridge  Malapert
```

Surface zones are **parallel-accessible** from the Landing Zone (not sequential).

### Distance and Travel Calculations

- **Transit phase**: Fixed 6 turns, no distance-based variability
- **Surface EVA**: Distance = landing site to zone center (see tables above)
- **EVA time**: distance ÷ mobility speed (km/hr) = travel hours; round up to turn fractions
- **Fuel costs**: Each propulsive maneuver has a fixed Δv cost translated to fuel units

### Environmental Effect Systems

Implement as **per-turn state machines**:

1. **Solar weather**: Markov chain with transition matrix (see above)
2. **Dust accumulation**: Counter incremented per EVA, decremented by mitigation actions
3. **Temperature**: Determined by location + sunlight state (binary: sun or shadow)
4. **Radiation**: Accumulated per crew member; solar weather level minus shielding rating
5. **Communications**: Uptime percentage per site; random blackout check each turn

### Turn Processing Order

Each game turn should process in this order:
1. Solar weather state transition
2. Environmental effects applied (temperature, dust, radiation)
3. Resource consumption (life support)
4. Player actions resolved
5. Random event check (60% chance during transit; 40% on surface)
6. Equipment degradation check
7. Crew health update
8. Communication status update
9. Victory/defeat condition check
10. Advance turn counter

---

## References

- [Lunar Colony Overview](lunar-colony-overview.md) — parent design document
- [World Design Template](templates/world-design.md) — structural template
- NASA Artemis Program — mission architecture, landing site candidates, Gateway station
- NASA Lunar South Pole Atlas — Shackleton, de Gerlache, Nobile, Connecting Ridge, Malapert Massif
- NASA Human Landing System (HLS) — Starship HLS specifications
- Apollo 11–17 mission transcripts — descent phase narrative inspiration
- Lunar Reconnaissance Orbiter (LRO) data — terrain, illumination, and temperature maps
