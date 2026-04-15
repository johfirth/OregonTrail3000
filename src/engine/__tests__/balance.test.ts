import { describe, it, expect } from 'vitest';
import {
  createEngine,
  Phase,
  Difficulty,
  DIFFICULTY_MODIFIERS,
  LANDING_SITES,
  LaunchProfile,
  SurfaceActivity,
  EvaOutcome,
  ResourceType,
  RESOURCE_COSTS,
  type GameResult,
  type GameState,
} from '../index';

interface SimResult {
  won: boolean;
  turns: number;
  phase: Phase;
  crewAlive: number;
  gameOverReason: string | null;
  finalResources: Record<string, number>;
  finalPhase: string;
}

function playFullGame(seed: number, difficulty: Difficulty): SimResult {
  const engine = createEngine();
  let result = engine.createGame({
    difficulty,
    commanderName: `Sim-${seed}`,
    rngSeed: seed,
  });

  // Phase 1: Allocate resources (balanced allocation)
  const mods = DIFFICULTY_MODIFIERS[difficulty];
  const budget = mods.availableBudget;

  // Use actual resource costs from constants
  const lsCost = RESOURCE_COSTS[ResourceType.LifeSupport].costPerUnit;
  const spCost = RESOURCE_COSTS[ResourceType.SpareParts].costPerUnit;
  const shCost = RESOURCE_COSTS[ResourceType.Shielding].costPerUnit;
  const mdCost = RESOURCE_COSTS[ResourceType.Medical].costPerUnit;

  // Ensure minimum viable fuel (200 FU for all maneuvers), then distribute rest
  const minFuel = 200;
  const propulsionFU = Math.max(minFuel, Math.floor(budget * 0.31));
  const remaining = budget - propulsionFU;
  const lifeSupportCR = Math.floor(remaining * 0.38);
  const sparePartsCR = Math.floor(remaining * 0.22);
  const shieldingCR = Math.floor(remaining * 0.18);
  const medicalCR = Math.floor(remaining * 0.12);

  result = engine.executeCommand(result.state, {
    type: 'ALLOCATE_RESOURCES',
    resources: {
      [ResourceType.Propulsion]: propulsionFU,
      [ResourceType.LifeSupport]: Math.floor(lifeSupportCR / lsCost),
      [ResourceType.SpareParts]: Math.floor(sparePartsCR / spCost),
      [ResourceType.Shielding]: Math.floor(shieldingCR / shCost),
      [ResourceType.Medical]: Math.floor(medicalCR / mdCost),
      [ResourceType.Budget]: 0,
    },
  });

  // Start mission
  result = engine.executeCommand(result.state, { type: 'START_MISSION' });

  let turns = 0;
  const maxTurns = 80; // safety valve

  while (!result.state.isGameOver && result.state.phase !== Phase.Colony && turns < maxTurns) {
    const actions = result.availableActions.filter(a => a.enabled);
    if (actions.length === 0) break;

    // Handle events with choices
    if (result.state.currentEvent?.choices?.length) {
      result = engine.executeCommand(result.state, {
        type: 'EVENT_CHOICE',
        eventId: result.state.currentEvent.id,
        choiceId: result.state.currentEvent.choices[0].id,
      });
      turns++;
      continue;
    }

    // Handle pending EVA skill result
    if (result.state.currentEvent?.id?.startsWith('eva-pending-')) {
      result = engine.executeCommand(result.state, {
        type: 'EVA_SKILL_RESULT',
        outcome: EvaOutcome.Successful,
      });
      turns++;
      continue;
    }

    const phase = result.state.phase;

    if (phase === Phase.Launch) {
      if (!result.state.phaseData.launchProfile) {
        result = engine.executeCommand(result.state, {
          type: 'SELECT_LAUNCH_PROFILE',
          profile: LaunchProfile.Standard,
        });
      } else {
        result = engine.executeCommand(result.state, { type: 'PROCEED' });
      }
    } else if (phase === Phase.LunarTransit) {
      result = engine.executeCommand(result.state, { type: 'PROCEED' });
    } else if (phase === Phase.Gateway) {
      if (!result.state.phaseData.gatewayVisited) {
        result = engine.executeCommand(result.state, { type: 'STOP_AT_GATEWAY' });
      } else if (!result.state.phaseData.gatewayResupplied) {
        result = engine.executeCommand(result.state, { type: 'PROCEED' });
      } else {
        // Select first landing site
        result = engine.executeCommand(result.state, {
          type: 'SELECT_LANDING_SITE',
          siteId: LANDING_SITES[0].id,
        });
      }
    } else if (phase === Phase.Descent) {
      if (!result.state.phaseData.landingAttempted) {
        result = engine.executeCommand(result.state, {
          type: 'EXECUTE_DESCENT',
          fuelUnits: 60,
        });
      } else {
        result = engine.executeCommand(result.state, { type: 'PROCEED' });
      }
    } else if (phase === Phase.SurfaceOps) {
      // Alternate between shelter and ice extraction EVA
      if (result.state.phaseData.surfaceTurnsCompleted % 2 === 0) {
        result = engine.executeCommand(result.state, {
          type: 'SELECT_SURFACE_ACTIVITY',
          activity: SurfaceActivity.Shelter,
        });
      } else {
        // Try ice extraction if we have parts, otherwise shelter
        if (result.state.resources[ResourceType.SpareParts] >= 3) {
          result = engine.executeCommand(result.state, {
            type: 'SELECT_SURFACE_ACTIVITY',
            activity: SurfaceActivity.EvaIceExtraction,
          });
        } else {
          result = engine.executeCommand(result.state, {
            type: 'SELECT_SURFACE_ACTIVITY',
            activity: SurfaceActivity.Shelter,
          });
        }
      }
    } else {
      result = engine.executeCommand(result.state, { type: 'PROCEED' });
    }

    turns++;
  }

  return {
    won: result.state.phase === Phase.Colony && !result.state.isGameOver,
    turns,
    phase: result.state.phase,
    crewAlive: result.state.crew.filter(c => c.isAlive).length,
    gameOverReason: result.state.gameOverReason,
    finalResources: {
      propulsion: result.state.resources[ResourceType.Propulsion],
      lifeSupport: result.state.resources[ResourceType.LifeSupport],
      spareParts: result.state.resources[ResourceType.SpareParts],
      shielding: result.state.resources[ResourceType.Shielding],
      medical: result.state.resources[ResourceType.Medical],
      budget: result.state.resources[ResourceType.Budget],
    },
    finalPhase: result.state.phase,
  };
}

function analyzeResults(label: string, results: SimResult[]) {
  const wins = results.filter(r => r.won).length;
  const avgTurns = results.reduce((s, r) => s + r.turns, 0) / results.length;
  const winResults = results.filter(r => r.won);
  const lossResults = results.filter(r => !r.won);

  const avgCrewAlive = winResults.length > 0
    ? (winResults.reduce((s, r) => s + r.crewAlive, 0) / winResults.length).toFixed(1)
    : 'N/A';

  // Death reason breakdown
  const deathReasons: Record<string, number> = {};
  for (const r of lossResults) {
    const reason = r.gameOverReason ?? 'unknown';
    deathReasons[reason] = (deathReasons[reason] || 0) + 1;
  }

  // Phase where losses occur
  const lossPhases: Record<string, number> = {};
  for (const r of lossResults) {
    lossPhases[r.finalPhase] = (lossPhases[r.finalPhase] || 0) + 1;
  }

  // Average remaining resources for winners
  const avgResources: Record<string, string> = {};
  if (winResults.length > 0) {
    for (const key of Object.keys(winResults[0].finalResources)) {
      const avg = winResults.reduce((s, r) => s + r.finalResources[key], 0) / winResults.length;
      avgResources[key] = avg.toFixed(1);
    }
  }

  // Stuck games (hit maxTurns without game over or colony)
  const stuckGames = results.filter(r => !r.won && !r.gameOverReason && r.turns >= 50).length;

  console.log(`\n${'='.repeat(50)}`);
  console.log(`${label}`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Win rate: ${wins}/100 (${wins}%)`);
  console.log(`Avg turns: ${avgTurns.toFixed(1)}`);
  console.log(`Avg crew alive (wins): ${avgCrewAlive}`);
  console.log(`Stuck games (maxTurns): ${stuckGames}`);
  console.log(`\nDeath reasons:`);
  for (const [reason, count] of Object.entries(deathReasons).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count}x: ${reason}`);
  }
  console.log(`\nLoss phases:`);
  for (const [phase, count] of Object.entries(lossPhases).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count}x: ${phase}`);
  }
  if (winResults.length > 0) {
    console.log(`\nAvg remaining resources (wins):`);
    for (const [key, val] of Object.entries(avgResources)) {
      console.log(`  ${key}: ${val}`);
    }
  }
}

describe('Game Balance Analysis', () => {
  it('measures win rate across 100 Cadet games', () => {
    const results: SimResult[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(playFullGame(i * 7 + 42, Difficulty.Cadet));
    }
    analyzeResults('CADET DIFFICULTY', results);
    // This test is for analysis — always passes
    expect(results.length).toBe(100);
  });

  it('measures win rate across 100 Astronaut games', () => {
    const results: SimResult[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(playFullGame(i * 13 + 7, Difficulty.Astronaut));
    }
    analyzeResults('ASTRONAUT DIFFICULTY', results);
    expect(results.length).toBe(100);
  });

  it('measures win rate across 100 Commander games', () => {
    const results: SimResult[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(playFullGame(i * 17 + 99, Difficulty.Commander));
    }
    analyzeResults('COMMANDER DIFFICULTY', results);
    expect(results.length).toBe(100);
  });

  it('measures win rate across 100 Ironman games', () => {
    const results: SimResult[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(playFullGame(i * 19 + 13, Difficulty.Ironman));
    }
    analyzeResults('IRONMAN DIFFICULTY', results);
    expect(results.length).toBe(100);
  });
});
