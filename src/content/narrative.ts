// ============================================================
// Lunar Colony 3000 — Narrative Text
// All milestone narration, endings, death sequences, and warnings.
// Sourced from game-design/narrative-outline-artemis.md.
// ============================================================

export const NARRATIVE = {
  milestones: {
    missionBriefing:
      'The room is small and windowless — Building 30, Conference Room 4B. The same room where Apollo 13\'s rescue was planned. NASA Administrator Vasquez stands at the front: "Artemis VII is not a visit. You are going to the Moon to stay. Your budget is fixed. I fought for every dollar and I lost more fights than I won. Commander, don\'t forget the duct tape."',

    launchCountdown:
      'You are lying on your back, 322 feet above the ground, strapped into a seat that vibrates with the thrum of eight million pounds of thrust waiting to happen. The countdown clock hits single digits. The solid rocket boosters light. The hold-down bolts blow. The acceleration presses you into your seat. Through the comm static, Chen\'s voice: "Tower clear. Roll program initiated." You are leaving Earth. There is no turning back.',

    earthInRearview:
      'The TLI burn is done. The engine cuts off and silence hits like a wall. You look out the porthole. Earth is behind you now — a blue marble framed in the tiny window, impossibly bright against the black. "Two hundred forty thousand miles to go," Chen says. "Three days. Give or take." Your supplies are finite. The journey has begun.',

    gatewayArrival:
      'The Moon fills your viewport. It hangs below you like a frozen ocean — grey and white and utterly still. Gateway appears ahead — a small, bright cross against the grey. A voice you don\'t recognize: "Artemis VII, Gateway Control. Welcome to the neighborhood. Coffee\'s terrible, but it\'s hot." This is the last outpost. The last fort before the wilderness.',

    descentBegins:
      'The lander undocks from Gateway with a soft clunk. Through the triangular windows, the Moon rises to meet you. Chen reports: "Descent engine primed. PDI burn in thirty seconds." The terrain below resolves from abstract grey to specific boulders. Park murmurs from the jump seat: "No pressure." Everything depends on the next sixty seconds.',

    touchdown:
      'CONTACT LIGHT. The lander settles. Dust — grey, ancient, untouched for a billion years — billows outward in slow, silent arcs. Chen\'s hands leave the controls. "Engine stop. Descent complete." Then: "Houston, Artemis VII. The Eagle has landed." Houston erupts. Through the static — the raw, human sound of two hundred engineers who just put five people on the Moon. You made it. Now you have to survive it.',

    firstEva:
      'The airlock cycles. The outer hatch swings open, and the Moon is right there — real, under your boots. You step down the ladder. The dust clings to everything. It smells, impossibly, like spent gunpowder. The horizon is disturbingly close. And there, hanging in the black — Earth, the size of a marble in the sky. "How\'s the view?" Chen asks. "It\'s worth the trip." Time to build a colony.',

    baseCampEstablished:
      'The habitat inflates with a sound like a slow exhale. Rivera watches the pressure gauge: "One-point-zero. Holding. The habitat is pressurized." For the first time since launch, you hear sound unfiltered through a helmet. Park steps inside and takes a breath: "Smells like a new car. A new car in a parking lot with no atmosphere. But not bad." Rivera raises a pouch of reconstituted coffee. "To Habitat Module Alpha. May the seals hold and the plumbing work." The mission feels less like survival and more like living.',
  },

  endings: {
    thrivingColony:
      'You stand on the crater rim at dawn. The habitat complex is behind you: three pressurized modules, solar arrays gleaming, the ISRU processor humming. Your crew is alive. All of them. Every specialist who climbed into that spacecraft at Kennedy Space Center is standing on the Moon, working, building, living. You open the comm channel: "Houston, Artemis VII. Colony site is established and self-sustaining. Crew health is good — all members active and operational. Houston, we have a colony." The President responds: "Welcome home. Not home to Earth. Home to the Moon. Because that\'s what you\'ve made it."',

    sustainableOutpost:
      'The habitat is pressurized. The ice is flowing. The colony — if you can call three modules and a drill rig a colony — is functional. It\'s not luxury. But it\'s real, and it\'s working, and you\'re alive. You open the comm channel: "Houston, Artemis VII. Colony site established. We are operational. It\'s not luxury, but it\'s home." Houston responds: "You\'ve done something extraordinary, Commander. Something difficult and painful and extraordinary. The relief crew is being prepped." It\'s not everything you hoped for. But it\'s enough.',

    bareSurvival:
      'The habitat is pressurized. That\'s about all you can say for it. The air is thin. The water ration is half a liter per person per day. There are two of you. Two, out of five. You open the comm channel: "Houston, Artemis VII. Colony site... established. Crew status: two surviving. We are alive. We made it. Barely." Houston: "Just hold on. You\'ve already done something no one thought possible." You survived. The colony — such as it is — exists. It\'s not triumph. But it\'s not defeat.',

    heroicSacrifice:
      'In the final hours, you transmitted everything. Every ice core analysis. Every regolith sample reading. The ISRU processor ran for six hours and twelve minutes — proof that water can be extracted from lunar ice. You didn\'t build the colony. You proved it could be built. Your last transmission: "All scientific data has been uploaded. We came here to build something permanent. We didn\'t make it. But the data we collected will make sure the next crew does. Tell them we got close. Tell them what to bring. Artemis VII out." You did not complete the mission. But because of you, someone will.',

    totalMissionLoss:
      'The telemetry feed from Artemis VII goes dark. Mission Control monitors the dead channel for forty-eight hours, per protocol. No signal. No beacon. No voice. A memorial is held at Johnson Space Center. Five chairs. Five photographs. The NASA Administrator stands at the podium: "They walked into the unknown because someone has to go first. They were brave. They were brilliant. They were ours. We will fly again. We owe them that." On the Moon, the habitat stands empty. The bootprints in the regolith will last for a million years.',
  },

  deathDebrief: {
    intro:
      'CONGRESSIONAL MISSION DEBRIEF — Conducted by the Senate Subcommittee on Space Exploration and Fiscal Accountability. The hearing room is wood-paneled and overlit. A row of senators sits behind a raised desk. You are represented by a cardboard cutout with your mission photo taped to it. This is standard procedure.',
    questions: [
      {
        question: 'Would you like a Congressional hearing?',
        yesResponse:
          'A full investigation with subpoenas and C-SPAN coverage has been scheduled. Senator Martinez: "Motion carried. Moving on."',
        noResponse:
          'A quiet internal review and a PDF no one will read will be filed. Senator Martinez: "Motion carried. Moving on."',
      },
      {
        question: 'Would you like a memorial?',
        yesResponse:
          'A tasteful plaque at Kennedy Space Center has been approved. Senator Okonkwo: "The plaque will read: \'They aimed for the Moon. They hit the Moon. The Moon hit back.\' Any objections? Good."',
        noResponse:
          'A crater will be named after you — there are plenty. Senator Okonkwo: "The plaque will read: \'They aimed for the Moon. They hit the Moon. The Moon hit back.\'"',
      },
      {
        question: 'Should we inform your next of kin?',
        yesResponse:
          'A formal visit with a flag has been arranged. Senator Park (no relation): "For the record, your Aunt Sadie in Tallahassee has already called this office fourteen times."',
        noResponse:
          'Your mom already saw it on the livestream. Senator Park (no relation): "Your Aunt Sadie in Tallahassee has already called this office fourteen times. She wants you to know she \'told you so.\'"',
      },
    ],
    signature:
      'Sincerely,\nThe Lunar Exploration Oversight Committee\n"Ad Astra Per Aspera (And Also Per Budget Reconciliation)"',
  },

  crewDeaths: {
    pilot:
      'Chen\'s station goes dark. The autopilot takes over, but it doesn\'t fly like Chen. Nothing flies like Chen. "Bessie" — the name Chen never officially gave the main engine — is still listed in the maintenance logs in Chen\'s handwriting. Rivera doesn\'t change it. You mark the coordinates in the mission log.',
    engineer:
      'Rivera\'s checklist notebook is found open on the console. The last entry, in Rivera\'s meticulous handwriting: "Within tolerance. Checked twice." The O₂ recycler alarm goes off six hours later — a minor fault Rivera would have caught in six minutes. Nobody touches Rivera\'s notebook. Nobody closes it. You mark the coordinates in the mission log.',
    scientist:
      'Okafor\'s sample bag sits in the airlock, half full. Six sealed pouches of regolith, each labeled in Okafor\'s careful print. Beside it, a note: "For the archive." The ice field is visible through the lander window. Okafor mapped every square meter of it from Earth orbit. Now you\'re guessing where to drill. You mark the coordinates in the mission log.',
    commander:
      'The Commander has fallen. The crew gathers in silence that stretches for sixty seconds — NASA protocol. Mission Control takes over remote coordination, but without the Commander\'s leadership, the crew\'s cohesion fractures. The mission cannot continue.',
  },

  warnings: {
    lowLifeSupport: '⚠️ Life support supplies critically low! Rationing is mandatory. Every breath counts now, Commander.',
    lowFuel: '⚠️ Propulsion fuel dangerously low! Maneuver options are severely limited.',
    lowMorale: '⚠️ Crew morale is plummeting. Tensions are high. The crew is approaching breaking point.',
    lowShielding: '⚠️ Radiation shielding compromised! The next solar event could be lethal.',
    lowMedical: '⚠️ Medical supplies critically low! Any crew illness could become fatal.',
    lowSpareParts: '⚠️ Spare parts nearly exhausted! The next equipment failure may be unrecoverable.',
  },

  openingNarration:
    'The year is 2028.\n\nThree years ago, NASA planted the first boots on the Moon\'s south pole since the Apollo program ended. That mission lasted seventy-two hours. Yours is meant to last forever.\n\nYou are the Mission Commander of Artemis VII — the most ambitious crewed spaceflight in human history. Your orders are simple to state and almost impossible to execute: fly a crew of five to the lunar south pole, land safely, and establish the first permanent human colony beyond Earth.\n\nYour mission budget is fixed. Your crew is irreplaceable. The Moon doesn\'t negotiate, and space doesn\'t forgive.\n\nChoose wisely. Pack carefully. Fly well.\n\nAnd whatever you do — don\'t run out of oxygen.',
} as const;
