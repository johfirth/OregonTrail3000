// ============================================================
// Artemis Trail — Event Data
// All 24 events from the game design document.
// ============================================================

import {
  GameEvent,
  EventCategory,
  EventSeverity,
  Phase,
  ResourceType,
} from '../engine/types';

// --- Transit Events (10 events, Phase 3: Lunar Transit) ---

const micrometeorite: GameEvent = {
  id: 'micrometeorite-strike',
  name: 'Micrometeorite Strike',
  description:
    '⚠️ IMPACT ALERT — Hull sensor grid detects a micrometeorite strike on Module 3. The particle — no larger than a grain of sand — punched through the outer shielding layer at 25 km/s. Pressure is holding, but the hull plating needs patching before the next thermal cycle weakens the impact site. Your engineer pulls replacement panels from stores.',
  probability: 6,
  category: EventCategory.Environmental,
  severity: EventSeverity.Moderate,
  phases: [Phase.LunarTransit],
  effects: [
    {
      type: 'RESOURCE',
      target: ResourceType.SpareParts,
      value: -3,
      description: 'Repair materials consumed for hull patching',
    },
  ],
};

const solarFlare: GameEvent = {
  id: 'solar-flare-warning',
  name: 'Solar Flare Warning',
  description:
    '🌞 SOLAR WEATHER ALERT — NOAA\'s Space Weather Prediction Center reports a Class M solar flare eruption. Elevated proton flux is inbound. Estimated arrival: 47 minutes. You have two options: shelter the crew in the storm cellar and wait it out, or push through and rely on hull shielding to absorb the radiation.',
  probability: 10,
  category: EventCategory.Environmental,
  severity: EventSeverity.Moderate,
  phases: [Phase.LunarTransit, Phase.SurfaceOps],
  choices: [
    {
      id: 'shelter',
      text: 'Shelter in place — hunker down in the storm module and wait it out',
      effects: [
        {
          type: 'NARRATIVE',
          value: 0,
          description: 'Crew shelters in the storm module. Mission paused for one turn.',
        },
      ],
    },
    {
      id: 'push-through',
      text: 'Push through — rely on hull shielding to absorb the radiation dose',
      effects: [
        {
          type: 'RESOURCE',
          target: ResourceType.Shielding,
          value: -2,
          description: 'Hull absorbs radiation dose, degrading shielding',
        },
      ],
    },
  ],
  effects: [],
};

const navigationGlitch: GameEvent = {
  id: 'navigation-glitch',
  name: 'Navigation Computer Glitch',
  description:
    '🖥️ NAV SYSTEM ANOMALY — The primary navigation computer\'s star tracker has drifted 0.03° off the reference frame. It\'s a minor deviation now, but uncorrected it\'ll compound into a significant course error by lunar approach. The flight computer is recalculating a correction burn.',
  probability: 5,
  category: EventCategory.Mechanical,
  severity: EventSeverity.Minor,
  phases: [Phase.LunarTransit],
  effects: [
    {
      type: 'RESOURCE',
      target: ResourceType.Propulsion,
      value: -2,
      description: 'Correction burn required to realign trajectory',
    },
  ],
};

const o2RecyclerMalfunction: GameEvent = {
  id: 'o2-recycler-malfunction',
  name: 'Oxygen Recycler Malfunction',
  description:
    '🫁 LIFE SUPPORT WARNING — The CO₂ scrubber in the ECLSS is showing reduced efficiency. Lithium hydroxide canisters are saturating faster than expected. You can divert spare parts to rebuild the scrubber assembly, or accept a higher oxygen consumption rate for the remainder of the transit.',
  probability: 5,
  category: EventCategory.Mechanical,
  severity: EventSeverity.Moderate,
  phases: [Phase.LunarTransit, Phase.SurfaceOps],
  choices: [
    {
      id: 'repair-now',
      text: 'Repair the scrubber now — divert spare parts for a one-time fix',
      effects: [
        {
          type: 'RESOURCE',
          target: ResourceType.SpareParts,
          value: -2,
          description: 'Spare parts consumed to rebuild scrubber assembly',
        },
      ],
    },
    {
      id: 'accept-degraded',
      text: 'Accept degraded performance — higher oxygen consumption rate ongoing',
      effects: [
        {
          type: 'RESOURCE',
          target: ResourceType.LifeSupport,
          value: -2,
          description: 'Increased life support consumption from degraded scrubber',
        },
      ],
    },
  ],
  effects: [],
};

const crewStress: GameEvent = {
  id: 'crew-psychological-stress',
  name: 'Crew Psychological Stress',
  description:
    '😰 CREW STATUS UPDATE — A crew member has been withdrawn and irritable for the past 12 hours. Mission psychologists on the ground flag elevated cortisol markers from the biomonitor feed. The confined quarters, constant hum of machinery, and 240,000 miles of empty void are taking a psychological toll. Crew cohesion is weakening.',
  probability: 8,
  category: EventCategory.Medical,
  severity: EventSeverity.Minor,
  phases: [Phase.LunarTransit, Phase.SurfaceOps],
  effects: [
    {
      type: 'MORALE',
      value: -5,
      description: 'Crew morale drops from psychological strain',
    },
    {
      type: 'HEALTH',
      target: 'random',
      value: -10,
      description: 'Random crew member flagged as Stressed',
    },
  ],
};

const commsBlackout: GameEvent = {
  id: 'comms-blackout',
  name: 'Communications Blackout',
  description:
    '📡 COMMS LOST — Antenna gimbal malfunction. The high-gain antenna has lost lock on the Deep Space Network relay. You\'re out of contact with Houston. No telemetry down, no voice up. Your crew is alone with the hiss of static. The antenna should re-acquire signal in approximately one orbit cycle.',
  probability: 4,
  category: EventCategory.Mechanical,
  severity: EventSeverity.Minor,
  phases: [Phase.LunarTransit],
  effects: [
    {
      type: 'MORALE',
      value: -3,
      description: 'Isolation anxiety from loss of Earth contact',
    },
  ],
};

const foodContamination: GameEvent = {
  id: 'food-contamination',
  name: 'Food Storage Contamination',
  description:
    '🦠 CONTAMINATION ALERT — Routine food supply inspection reveals bacterial growth in Storage Bay 2. A seal failure allowed moisture into the freeze-dried ration packs. Three days\' worth of food is compromised. The affected supplies must be jettisoned to prevent cross-contamination. Nobody wants to find out what space mold does to your intestines.',
  probability: 3,
  category: EventCategory.Supply,
  severity: EventSeverity.Moderate,
  phases: [Phase.LunarTransit],
  effects: [
    {
      type: 'RESOURCE',
      target: ResourceType.LifeSupport,
      value: -3,
      description: 'Contaminated food supplies jettisoned',
    },
  ],
};

const spaceDebris: GameEvent = {
  id: 'space-debris-field',
  name: 'Space Debris Field',
  description:
    '🛰️ COLLISION WARNING — USSPACECOM tracking reports a debris cloud in your flight path. It\'s the remnants of a defunct weather satellite that broke apart in a Kessler cascade six months ago. Fragments range from paint flecks to refrigerator-sized panels, spread across a 200-km band. You have three options.',
  probability: 5,
  category: EventCategory.Environmental,
  severity: EventSeverity.Severe,
  phases: [Phase.LunarTransit],
  choices: [
    {
      id: 'evasive-maneuver',
      text: 'Evasive maneuver — burn fuel to change trajectory around the field',
      effects: [
        {
          type: 'RESOURCE',
          target: ResourceType.Propulsion,
          value: -3,
          description: 'Fuel consumed for evasive trajectory change',
        },
      ],
    },
    {
      id: 'raise-shields',
      text: 'Raise shields — absorb impacts with the radiation shield array',
      effects: [
        {
          type: 'RESOURCE',
          target: ResourceType.Shielding,
          value: -2,
          description: 'Shielding absorbs debris impacts',
        },
      ],
    },
    {
      id: 'risk-it',
      text: 'Risk it — maintain course and hope for the best (30% safe / 70% hit)',
      effects: [
        {
          type: 'RESOURCE',
          target: ResourceType.SpareParts,
          value: -5,
          description: 'Debris strikes cause extensive hull damage',
        },
        {
          type: 'HEALTH',
          target: 'random',
          value: -20,
          description: 'Random crew member injured by debris impact',
        },
      ],
    },
  ],
  effects: [],
};

const calibrationDrift: GameEvent = {
  id: 'equipment-calibration-drift',
  name: 'Equipment Calibration Drift',
  description:
    '🔧 CALIBRATION NOTICE — Science instrument suite is reporting readings outside nominal parameters. The spectrometer, magnetometer, and thermal sensors need manual recalibration. It\'s not urgent, but drifted instruments could compromise surface operations if uncorrected.',
  probability: 3,
  category: EventCategory.Mechanical,
  severity: EventSeverity.Minor,
  phases: [Phase.LunarTransit, Phase.Gateway],
  effects: [
    {
      type: 'RESOURCE',
      target: ResourceType.SpareParts,
      value: -1,
      description: 'Calibration consumables used',
    },
  ],
};

const inspirationalView: GameEvent = {
  id: 'inspirational-earth-view',
  name: 'Inspirational Earth View',
  description:
    '🌍 EARTH RISING — During a routine attitude adjustment, the spacecraft rotates to reveal a breathtaking view of Earth through the observation window. The entire crew gathers in silence. The blue marble hangs in the black, impossibly beautiful, impossibly fragile. For a moment, the stress melts away. Someone breaks out the good coffee. Commander, your crew needed this.',
  probability: 4,
  category: EventCategory.Positive,
  severity: EventSeverity.Positive,
  phases: [Phase.LunarTransit],
  effects: [
    {
      type: 'MORALE',
      value: 10,
      description: 'Significant mood boost from the Overview Effect',
    },
    {
      type: 'RESOURCE',
      target: ResourceType.LifeSupport,
      value: 1,
      description: 'Crew celebrates with a proper meal — net positive from high morale',
    },
  ],
};

// --- Surface Events (8 events, Phase 6: Surface Operations) ---

const lunarDust: GameEvent = {
  id: 'lunar-dust-contamination',
  name: 'Lunar Dust Contamination',
  description:
    '🌑 DUST INFILTRATION — Lunar regolith has breached the airlock seals. The ultra-fine, electrostatically charged dust — sharper than broken glass at the microscopic level — has contaminated the inner habitat. It\'s in the ventilation filters, on suit visors, and coating the instrument panels. Decontamination protocol initiated.',
  probability: 8,
  category: EventCategory.Environmental,
  severity: EventSeverity.Moderate,
  phases: [Phase.SurfaceOps],
  effects: [
    {
      type: 'RESOURCE',
      target: ResourceType.SpareParts,
      value: -2,
      description: 'Filter replacements and seal repair',
    },
    {
      type: 'HEALTH',
      target: 'random',
      value: -10,
      description: 'Random crew member suffers dust inhalation',
    },
  ],
};

const solarPanelDamage: GameEvent = {
  id: 'solar-panel-damage',
  name: 'Solar Panel Damage',
  description:
    '☀️ POWER GRID ALERT — Solar array output has dropped 34%. Diagnostic imaging shows physical damage to Panel Array C — likely micrometeorite impact or thermal stress fracture. With reduced power generation, life support systems are drawing from battery reserves.',
  probability: 5,
  category: EventCategory.Mechanical,
  severity: EventSeverity.Moderate,
  phases: [Phase.SurfaceOps],
  choices: [
    {
      id: 'repair-array',
      text: 'Repair the solar array — spend spare parts for a one-time fix',
      effects: [
        {
          type: 'RESOURCE',
          target: ResourceType.SpareParts,
          value: -2,
          description: 'Spare parts consumed for solar panel repair',
        },
      ],
    },
    {
      id: 'accept-reduced-power',
      text: 'Accept reduced power — increased life support drain ongoing',
      effects: [
        {
          type: 'RESOURCE',
          target: ResourceType.LifeSupport,
          value: -2,
          description: 'Ongoing power deficit drains life support reserves',
        },
      ],
    },
  ],
  effects: [],
};

const iceDiscovery: GameEvent = {
  id: 'ice-deposit-discovery',
  name: 'Ice Deposit Discovery',
  description:
    '🧊 EUREKA — During a routine geological survey near the permanently shadowed region, your crew strikes a rich vein of water ice just 0.5 meters below the regolith surface. The ice is remarkably pure — minimal sulfur contamination. Your ISRU unit can process this into potable water and breathable oxygen. This changes everything, Commander.',
  probability: 5,
  category: EventCategory.Positive,
  severity: EventSeverity.Positive,
  phases: [Phase.SurfaceOps],
  effects: [
    {
      type: 'RESOURCE',
      target: ResourceType.LifeSupport,
      value: 4,
      description: 'Water and oxygen extracted from ice deposit',
    },
  ],
};

const evaSuitBreach: GameEvent = {
  id: 'eva-suit-breach',
  name: 'EVA Suit Breach',
  description:
    '🚨 EVA EMERGENCY — A crew member\'s suit integrity alarm is shrieking. A sharp regolith fragment has punctured the outer pressure layer near the left knee joint. Pressure is dropping. Internal sealant is deploying but it\'s not holding. The crew member needs to get back to the airlock NOW. Every second counts.',
  probability: 3,
  category: EventCategory.Medical,
  severity: EventSeverity.Catastrophic,
  phases: [Phase.SurfaceOps],
  effects: [
    {
      type: 'HEALTH',
      target: 'random',
      value: -40,
      description: 'Crew member suffers severe decompression injury',
    },
    {
      type: 'RESOURCE',
      target: ResourceType.Medical,
      value: -2,
      description: 'Emergency medical treatment consumes supplies',
    },
    {
      type: 'RESOURCE',
      target: ResourceType.SpareParts,
      value: -1,
      description: 'EVA suit repair materials consumed',
    },
  ],
};

const habitatPressure: GameEvent = {
  id: 'habitat-pressure-warning',
  name: 'Habitat Pressure Warning',
  description:
    '🏠 PRESSURE ALERT — Habitat Module B is showing a slow pressure decay. Rate: 0.02 psi/hour. At this rate, the module will be uninhabitable within 72 hours. The leak is somewhere in the thermal expansion joints. You can repair the full habitat, or seal off Module B and redistribute crew.',
  probability: 6,
  category: EventCategory.Mechanical,
  severity: EventSeverity.Severe,
  phases: [Phase.SurfaceOps],
  choices: [
    {
      id: 'full-repair',
      text: 'Full repair — seal, patch, and pressure test the module',
      effects: [
        {
          type: 'RESOURCE',
          target: ResourceType.SpareParts,
          value: -3,
          description: 'Full habitat seal repair consumes spare parts',
        },
      ],
    },
    {
      id: 'seal-module',
      text: 'Seal off Module B — accept cramped conditions and ongoing drain',
      effects: [
        {
          type: 'RESOURCE',
          target: ResourceType.LifeSupport,
          value: -3,
          description: 'Cramped conditions increase life support consumption',
        },
        {
          type: 'MORALE',
          value: -5,
          description: 'Crew morale drops from cramped living conditions',
        },
      ],
    },
  ],
  effects: [],
};

const regolith3dPrinter: GameEvent = {
  id: 'regolith-3d-printer-success',
  name: 'Regolith 3D Printer Success',
  description:
    '🖨️ FABRICATION SUCCESS — The experimental regolith 3D printer has produced its first batch of structural components using sintered lunar soil. The parts aren\'t pretty, but stress testing confirms they meet load-bearing specifications. Your crew now has a renewable source of basic replacement parts. The age of lunar manufacturing has begun, Commander.',
  probability: 4,
  category: EventCategory.Positive,
  severity: EventSeverity.Positive,
  phases: [Phase.SurfaceOps],
  effects: [
    {
      type: 'RESOURCE',
      target: ResourceType.SpareParts,
      value: 2,
      description: 'Fabricated structural components from lunar regolith',
    },
    {
      type: 'MORALE',
      value: 5,
      description: 'Crew pride in achieving lunar manufacturing',
    },
  ],
};

const temperatureExtreme: GameEvent = {
  id: 'temperature-extreme',
  name: 'Temperature Extreme',
  description:
    '🌡️ THERMAL ALERT — The lunar day/night cycle is brutal: +127°C in direct sunlight, −173°C in shadow. Your habitat\'s thermal regulation system is struggling with the extreme gradient as the terminator line approaches your site. Thermal cycling is causing micro-fractures in external equipment and degrading radiation shielding adhesive.',
  probability: 7,
  category: EventCategory.Environmental,
  severity: EventSeverity.Moderate,
  phases: [Phase.SurfaceOps],
  effects: [
    {
      type: 'RESOURCE',
      target: ResourceType.Shielding,
      value: -1,
      description: 'Thermal degradation of radiation protection',
    },
    {
      type: 'RESOURCE',
      target: ResourceType.SpareParts,
      value: -1,
      description: 'Equipment stress damage from thermal cycling',
    },
  ],
};

const roverMalfunction: GameEvent = {
  id: 'rover-malfunction',
  name: 'Rover Malfunction',
  description:
    '🚗 ROVER DOWN — The unpressurized lunar rover has thrown a drive motor fault during a survey traverse 3 km from base. The right-front wheel assembly seized — likely regolith intrusion into the bearing housing. The crew can retrieve and repair the rover, but it\'ll cost parts and EVA time.',
  probability: 4,
  category: EventCategory.Mechanical,
  severity: EventSeverity.Minor,
  phases: [Phase.SurfaceOps],
  effects: [
    {
      type: 'RESOURCE',
      target: ResourceType.SpareParts,
      value: -2,
      description: 'Motor replacement and bearing repack',
    },
  ],
};

// --- Universal Events (6 events, any phase) ---

const radiationSickness: GameEvent = {
  id: 'radiation-sickness',
  name: 'Crew Illness: Radiation Sickness',
  description:
    '☢️ MEDICAL ALERT — A crew member is presenting symptoms consistent with acute radiation syndrome: nausea, fatigue, and a declining white blood cell count. Cumulative radiation exposure has exceeded the crew member\'s personal dose limit. Without treatment, the condition will deteriorate.',
  probability: 6,
  category: EventCategory.Medical,
  severity: EventSeverity.Severe,
  phases: [Phase.Launch, Phase.LunarTransit, Phase.Gateway, Phase.Descent, Phase.SurfaceOps],
  effects: [
    {
      type: 'HEALTH',
      target: 'random',
      value: -30,
      description: 'Random crew member suffers radiation sickness — health drops 30%',
    },
    {
      type: 'RESOURCE',
      target: ResourceType.Medical,
      value: -2,
      description: 'Treatment supplies consumed for radiation therapy',
    },
  ],
};

const criticalEquipmentFailure: GameEvent = {
  id: 'critical-equipment-failure',
  name: 'Equipment Failure: Critical System',
  description:
    '🔴 CRITICAL FAILURE — A primary system has suffered a catastrophic malfunction. Alarms are blaring. The system is offline and degrading. An emergency EVA repair is required — but it\'s not a simple swap. This requires improvisation under pressure. One wrong move could make things worse.',
  probability: 5,
  category: EventCategory.Mechanical,
  severity: EventSeverity.Severe,
  phases: [Phase.Launch, Phase.LunarTransit, Phase.Gateway, Phase.Descent, Phase.SurfaceOps],
  effects: [
    {
      type: 'RESOURCE',
      target: ResourceType.SpareParts,
      value: -3,
      description: 'Emergency repair consumes spare parts',
    },
    {
      type: 'HEALTH',
      target: 'random',
      value: -15,
      description: 'Crew member strained during high-pressure repair',
    },
  ],
};

const crewConflict: GameEvent = {
  id: 'crew-conflict',
  name: 'Crew Conflict',
  description:
    '😤 CREW TENSION — Two crew members have had a heated confrontation over workload distribution. Voices were raised. A tool was thrown (it missed). The rest of the crew is walking on eggshells. As Commander, you need to intervene before this fractures crew cohesion entirely.',
  probability: 4,
  category: EventCategory.Medical,
  severity: EventSeverity.Moderate,
  phases: [Phase.LunarTransit, Phase.Gateway, Phase.SurfaceOps],
  choices: [
    {
      id: 'side-with-a',
      text: 'Side with Crew Member A — back their position, boost their performance',
      effects: [
        {
          type: 'MORALE',
          value: -5,
          description: 'Crew Member B feels undermined — morale drops',
        },
        {
          type: 'HEALTH',
          target: 'random',
          value: 5,
          description: 'Supported crew member performs better',
        },
      ],
    },
    {
      id: 'side-with-b',
      text: 'Side with Crew Member B — back their position, boost their performance',
      effects: [
        {
          type: 'MORALE',
          value: -5,
          description: 'Crew Member A feels undermined — morale drops',
        },
        {
          type: 'HEALTH',
          target: 'random',
          value: 5,
          description: 'Supported crew member performs better',
        },
      ],
    },
    {
      id: 'mediate',
      text: 'Mediate neutrally — nobody feels heard, but no lasting resentment',
      effects: [
        {
          type: 'MORALE',
          value: -8,
          description: 'Nobody feels heard — larger morale hit',
        },
      ],
    },
  ],
  effects: [],
};

const supplyModuleDamage: GameEvent = {
  id: 'supply-module-damage',
  name: 'Supply Module Damage',
  description:
    '📦 SUPPLY DAMAGE — A structural failure in Supply Module mounting brackets has allowed unsecured cargo to shift. Several supply containers are damaged. Inventory assessment reveals losses across multiple categories.',
  probability: 4,
  category: EventCategory.Supply,
  severity: EventSeverity.Moderate,
  phases: [Phase.Launch, Phase.LunarTransit, Phase.Descent, Phase.SurfaceOps],
  effects: [
    {
      type: 'RESOURCE',
      target: ResourceType.LifeSupport,
      value: -2,
      description: 'Damaged food/water containers',
    },
    {
      type: 'RESOURCE',
      target: ResourceType.Medical,
      value: -1,
      description: 'Compromised pharmaceutical packaging',
    },
    {
      type: 'RESOURCE',
      target: ResourceType.SpareParts,
      value: -1,
      description: 'Bent/broken replacement components',
    },
  ],
};

const scienceDiscovery: GameEvent = {
  id: 'unexpected-science-discovery',
  name: 'Unexpected Science Discovery',
  description:
    '🔬 DISCOVERY — The crew has found something extraordinary: an unusual mineral formation with an anomalous radiation signature. The crew is electrified. This is why they became astronauts. The data is transmitted to Earth, where it immediately trends on every science feed. Your mission just made the front page.',
  probability: 3,
  category: EventCategory.Positive,
  severity: EventSeverity.Positive,
  phases: [Phase.LunarTransit, Phase.Gateway, Phase.SurfaceOps],
  effects: [
    {
      type: 'MORALE',
      value: 15,
      description: 'Crew morale surge from purpose and recognition',
    },
    {
      type: 'SCORE',
      value: 100,
      description: 'Scientific achievement bonus — front page news',
    },
  ],
};

const coronalMassEjection: GameEvent = {
  id: 'coronal-mass-ejection',
  name: 'Coronal Mass Ejection',
  description:
    '☠️ EMERGENCY — CORONAL MASS EJECTION INBOUND. This is not a drill. A massive solar eruption has sent a wall of charged particles screaming toward the Moon at 2,000 km/s. Estimated impact: 19 minutes. Radiation levels will spike to lethal thresholds. All crew to storm shelter. Seal all modules. This is the big one, Commander.',
  probability: 3,
  category: EventCategory.Environmental,
  severity: EventSeverity.Catastrophic,
  phases: [Phase.LunarTransit, Phase.Descent, Phase.SurfaceOps],
  effects: [
    {
      type: 'RESOURCE',
      target: ResourceType.Shielding,
      value: -4,
      description: 'Massive radiation absorption from CME impact',
    },
    {
      type: 'HEALTH',
      target: 'all',
      value: -20,
      description: 'All crew suffer radiation dose despite shielding',
    },
  ],
};

// --- Exported collections ---

export const TRANSIT_EVENTS: GameEvent[] = [
  micrometeorite,
  solarFlare,
  navigationGlitch,
  o2RecyclerMalfunction,
  crewStress,
  commsBlackout,
  foodContamination,
  spaceDebris,
  calibrationDrift,
  inspirationalView,
];

export const SURFACE_EVENTS: GameEvent[] = [
  lunarDust,
  solarPanelDamage,
  iceDiscovery,
  evaSuitBreach,
  habitatPressure,
  regolith3dPrinter,
  temperatureExtreme,
  roverMalfunction,
];

export const UNIVERSAL_EVENTS: GameEvent[] = [
  radiationSickness,
  criticalEquipmentFailure,
  crewConflict,
  supplyModuleDamage,
  scienceDiscovery,
  coronalMassEjection,
];

export const EVENTS: GameEvent[] = [
  ...TRANSIT_EVENTS,
  ...SURFACE_EVENTS,
  ...UNIVERSAL_EVENTS,
];
