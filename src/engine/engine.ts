// Main Engine Implementation — implements GameEngine interface

import {
  type GameEngine,
  type GameConfig,
  type GameState,
  type GameCommand,
  type GameResult,
  type GameAction,
  type NarrativeEntry,
  type SaveData,
  type ScoreBreakdown,
  type Resources,
  Phase,
  ResourceType,
  HealthStatus,
  ConsumptionLevel,
  LaunchProfile,
  EvaType,
  EvaOutcome,
  SurfaceActivity,
  ScoreRating,
  VictoryTier,
  Difficulty,
  DIFFICULTY_MODIFIERS,
  RESOURCE_COSTS,
  LAUNCH_PROFILES,
  GATEWAY_BASE_PRICE_MULTIPLIER,
  GATEWAY_MEDICAL_COST,
  EVA_ICE_BASE_YIELD,
  EVA_REPAIR_YIELD_SR,
  EVA_REPAIR_YIELD_PU,
  EVA_SCIENCE_BASE_SCORE,
  EVA_ICE_PARTS_COST,
  EVA_REPAIR_PARTS_COST,
  EVA_MIN_SPARE_PARTS,
  DESCENT_MIN_FUEL,
  DESCENT_MAX_FUEL,
  LANDING_ABORT_FUEL_COST,
  LANDING_CRASH_THRESHOLD,
  SCORE_PER_CREW,
  SCORE_PER_HEALTHY_CREW,
  SCORE_PER_SD,
  SCORE_PER_PU,
  SCORE_PER_SR,
  SCORE_PER_MU,
  SCORE_PER_FU,
  SCORE_PER_SCIENCE_EVA,
  SCORE_LANDING_MAX,
  SCORE_SITE_DIFFICULTY_MAX,
  SCORE_SPEED_PER_TURN,
  SCORE_SPEED_TARGET_TURNS,
  SCORE_NO_DEATHS_BONUS,
  LANDING_SITES,
} from './types';
import { createRng, type Rng } from './rng';
import { createInitialState } from './state';
import { canAdvancePhase, advancePhase } from './phases';
import { applyEventEffects } from './events';
import { processTurn } from './turns';
import { createSaveData, loadSaveData } from './save';

// --- Helper: create narrative entry ---
let narrativeCounter = 0;
function narr(text: string, type: NarrativeEntry['type'], turn: number): NarrativeEntry {
  return { id: `narr-${turn}-${++narrativeCounter}`, text, type, timestamp: turn };
}

// --- Scoring ---
function calculateScore(state: GameState): { breakdown: ScoreBreakdown; rating: ScoreRating } {
  const aliveCrew = state.crew.filter(c => c.isAlive);
  const healthyCrew = aliveCrew.filter(c => c.healthStatus === HealthStatus.Healthy);

  const siteAvg = state.selectedLandingSite
    ? (state.selectedLandingSite.sunlight +
        state.selectedLandingSite.iceAccess +
        state.selectedLandingSite.terrainDifficulty +
        state.selectedLandingSite.communications) / 4
    : 3;

  const breakdown: ScoreBreakdown = {
    survivingCrew: aliveCrew.length * SCORE_PER_CREW,
    crewHealthBonus: healthyCrew.length * SCORE_PER_HEALTHY_CREW,
    remainingLifeSupport: Math.floor(state.resources[ResourceType.LifeSupport]) * SCORE_PER_SD,
    remainingSpareParts: state.resources[ResourceType.SpareParts] * SCORE_PER_PU,
    remainingShielding: state.resources[ResourceType.Shielding] * SCORE_PER_SR,
    remainingMedical: state.resources[ResourceType.Medical] * SCORE_PER_MU,
    remainingFuel: state.resources[ResourceType.Propulsion] * SCORE_PER_FU,
    scienceEvas: state.phaseData.scienceEvasCompleted * SCORE_PER_SCIENCE_EVA,
    landingQuality: Math.min(SCORE_LANDING_MAX, Math.max(0, Math.floor(state.phaseData.landingScore / 2))),
    siteDifficulty: Math.min(SCORE_SITE_DIFFICULTY_MAX, Math.floor((6 - siteAvg) * 25)),
    speedBonus: Math.max(0, SCORE_SPEED_TARGET_TURNS - state.totalTurns) * SCORE_SPEED_PER_TURN,
    noDeathsBonus: aliveCrew.length === 4 ? SCORE_NO_DEATHS_BONUS : 0,
    total: 0,
  };

  breakdown.total =
    breakdown.survivingCrew +
    breakdown.crewHealthBonus +
    breakdown.remainingLifeSupport +
    breakdown.remainingSpareParts +
    breakdown.remainingShielding +
    breakdown.remainingMedical +
    breakdown.remainingFuel +
    breakdown.scienceEvas +
    breakdown.landingQuality +
    breakdown.siteDifficulty +
    breakdown.speedBonus +
    breakdown.noDeathsBonus +
    state.score;

  let rating: ScoreRating;
  if (breakdown.total >= 3000) rating = ScoreRating.S;
  else if (breakdown.total >= 2200) rating = ScoreRating.A;
  else if (breakdown.total >= 1500) rating = ScoreRating.B;
  else if (breakdown.total >= 1000) rating = ScoreRating.C;
  else if (breakdown.total >= 500) rating = ScoreRating.D;
  else rating = ScoreRating.F;

  return { breakdown, rating };
}

function determineVictoryTier(state: GameState): VictoryTier {
  const alive = state.crew.filter(c => c.isAlive).length;
  const hasResources =
    state.resources[ResourceType.LifeSupport] >= 5 &&
    state.resources[ResourceType.SpareParts] >= 3;

  if (alive >= 4 && hasResources && state.phaseData.scienceEvasCompleted >= 2) {
    return VictoryTier.ThrivingColony;
  }
  if (alive >= 3 && state.resources[ResourceType.LifeSupport] >= 2) {
    return VictoryTier.SustainableOutpost;
  }
  return VictoryTier.BareSurvival;
}

// --- Available Actions ---
function getAvailableActions(state: GameState): GameAction[] {
  const actions: GameAction[] = [];

  if (state.isGameOver) return actions;

  // If there's a pending event with choices, only offer event choice
  if (state.currentEvent && state.currentEvent.choices && state.currentEvent.choices.length > 0) {
    for (const choice of state.currentEvent.choices) {
      actions.push({
        command: 'EVENT_CHOICE',
        label: choice.text,
        description: `Respond to: ${state.currentEvent.name}`,
        enabled: true,
      });
    }
    return actions;
  }

  switch (state.phase) {
    case Phase.MissionPrep: {
      const mods = DIFFICULTY_MODIFIERS[state.difficulty];
      actions.push({
        command: 'ALLOCATE_RESOURCES',
        label: 'Allocate Resources',
        description: `Distribute ${mods.availableBudget} CR across mission resources`,
        enabled: true,
      });
      actions.push({
        command: 'SET_CONSUMPTION',
        label: 'Set Consumption Level',
        description: 'Choose rationing, standard, or generous life support',
        enabled: true,
      });
      const hasResources = state.resources[ResourceType.Propulsion] > 0;
      actions.push({
        command: 'START_MISSION',
        label: 'Start Mission',
        description: 'Begin the lunar mission',
        enabled: hasResources,
        disabledReason: hasResources ? undefined : 'Allocate resources before starting',
      });
      break;
    }

    case Phase.Launch: {
      if (!state.phaseData.launchProfile) {
        actions.push({
          command: 'SELECT_LAUNCH_PROFILE',
          label: 'Conservative Launch',
          description: `90 FU, 5% complication chance`,
          enabled: state.resources[ResourceType.Propulsion] >= 90,
          disabledReason: state.resources[ResourceType.Propulsion] < 90 ? 'Not enough fuel' : undefined,
        });
        actions.push({
          command: 'SELECT_LAUNCH_PROFILE',
          label: 'Standard Launch',
          description: `80 FU, 12% complication chance`,
          enabled: state.resources[ResourceType.Propulsion] >= 80,
          disabledReason: state.resources[ResourceType.Propulsion] < 80 ? 'Not enough fuel' : undefined,
        });
        actions.push({
          command: 'SELECT_LAUNCH_PROFILE',
          label: 'Aggressive Launch',
          description: `65 FU, 25% complication chance`,
          enabled: state.resources[ResourceType.Propulsion] >= 65,
          disabledReason: state.resources[ResourceType.Propulsion] < 65 ? 'Not enough fuel' : undefined,
        });
      } else {
        actions.push({
          command: 'PROCEED',
          label: 'Continue to Lunar Transit',
          description: 'Proceed through the launch phase',
          enabled: true,
        });
      }
      break;
    }

    case Phase.LunarTransit: {
      actions.push({
        command: 'SET_CONSUMPTION',
        label: 'Set Consumption Level',
        description: 'Adjust life support consumption',
        enabled: true,
      });
      actions.push({
        command: 'PROCEED',
        label: 'Continue Transit',
        description: `${state.phaseData.transitTurnsRemaining} turns remaining`,
        enabled: true,
      });
      break;
    }

    case Phase.Gateway: {
      if (!state.phaseData.gatewayVisited) {
        actions.push({
          command: 'STOP_AT_GATEWAY',
          label: 'Dock at Gateway Station',
          description: 'Dock and optionally resupply (costs 5 FU)',
          enabled: state.resources[ResourceType.Propulsion] >= 3,
          disabledReason: state.resources[ResourceType.Propulsion] < 3 ? 'Insufficient fuel for docking' : undefined,
        });
        actions.push({
          command: 'PROCEED',
          label: 'Bypass Gateway',
          description: 'Skip docking and proceed to landing site selection',
          enabled: true,
        });
      } else if (!state.phaseData.gatewayResupplied) {
        // At gateway, can resupply or proceed
        if (state.resources[ResourceType.Budget] > 0) {
          actions.push({
            command: 'GATEWAY_RESUPPLY',
            label: 'Resupply at Gateway',
            description: `Buy supplies at marked-up prices (${state.resources[ResourceType.Budget]} CR available)`,
            enabled: true,
          });
        }
        // Medical treatment
        const treatable = state.crew.filter(
          c => c.isAlive && (c.healthStatus === HealthStatus.Ill || c.healthStatus === HealthStatus.Critical)
        );
        for (const member of treatable) {
          actions.push({
            command: 'GATEWAY_MEDICAL',
            label: `Treat ${member.name}`,
            description: `${GATEWAY_MEDICAL_COST} CR — cure to Stressed`,
            enabled: state.resources[ResourceType.Budget] >= GATEWAY_MEDICAL_COST,
            disabledReason: state.resources[ResourceType.Budget] < GATEWAY_MEDICAL_COST ? 'Not enough credits' : undefined,
          });
        }
        actions.push({
          command: 'SELECT_LANDING_SITE',
          label: 'Select Landing Site',
          description: 'Choose a landing site and proceed to descent',
          enabled: true,
        });
      } else {
        actions.push({
          command: 'SELECT_LANDING_SITE',
          label: 'Select Landing Site',
          description: 'Choose a landing site and proceed to descent',
          enabled: true,
        });
      }
      break;
    }

    case Phase.Descent: {
      if (!state.phaseData.landingAttempted) {
        actions.push({
          command: 'EXECUTE_DESCENT',
          label: 'Execute Landing',
          description: `Commit fuel for powered descent (${DESCENT_MIN_FUEL}–${DESCENT_MAX_FUEL} FU)`,
          enabled: state.resources[ResourceType.Propulsion] >= DESCENT_MIN_FUEL,
          disabledReason: state.resources[ResourceType.Propulsion] < DESCENT_MIN_FUEL
            ? 'Not enough fuel for descent burn'
            : undefined,
        });
      } else {
        actions.push({
          command: 'PROCEED',
          label: 'Begin Surface Operations',
          description: 'Proceed to lunar surface operations',
          enabled: true,
        });
      }
      break;
    }

    case Phase.SurfaceOps: {
      actions.push({
        command: 'SET_CONSUMPTION',
        label: 'Set Consumption Level',
        description: 'Adjust life support consumption',
        enabled: true,
      });

      const hasEvaCapableCrew = state.crew.some(
        c => c.isAlive && (c.healthStatus === HealthStatus.Healthy || c.healthStatus === HealthStatus.Stressed)
      );

      actions.push({
        command: 'SELECT_SURFACE_ACTIVITY',
        label: 'EVA: Ice Extraction',
        description: `Extract water ice (costs ${EVA_ICE_PARTS_COST} PU, yields SD)`,
        enabled: hasEvaCapableCrew && state.resources[ResourceType.SpareParts] >= EVA_ICE_PARTS_COST,
        disabledReason: !hasEvaCapableCrew
          ? 'No crew capable of EVA'
          : state.resources[ResourceType.SpareParts] < EVA_ICE_PARTS_COST
            ? 'Not enough spare parts'
            : undefined,
      });
      actions.push({
        command: 'SELECT_SURFACE_ACTIVITY',
        label: 'EVA: Equipment Repair',
        description: `Repair equipment (costs ${EVA_REPAIR_PARTS_COST} PU, yields SR/PU)`,
        enabled: hasEvaCapableCrew && state.resources[ResourceType.SpareParts] >= EVA_REPAIR_PARTS_COST,
        disabledReason: !hasEvaCapableCrew
          ? 'No crew capable of EVA'
          : state.resources[ResourceType.SpareParts] < EVA_REPAIR_PARTS_COST
            ? 'Not enough spare parts'
            : undefined,
      });
      actions.push({
        command: 'SELECT_SURFACE_ACTIVITY',
        label: 'EVA: Science Mission',
        description: `Conduct science (+${EVA_SCIENCE_BASE_SCORE} score, costs ${EVA_MIN_SPARE_PARTS} PU)`,
        enabled: hasEvaCapableCrew && state.resources[ResourceType.SpareParts] >= EVA_MIN_SPARE_PARTS,
        disabledReason: !hasEvaCapableCrew
          ? 'No crew capable of EVA'
          : state.resources[ResourceType.SpareParts] < EVA_MIN_SPARE_PARTS
            ? 'Not enough spare parts'
            : undefined,
      });
      actions.push({
        command: 'SELECT_SURFACE_ACTIVITY',
        label: 'Shelter in Habitat',
        description: 'Rest safely — no risk, no extra consumption',
        enabled: true,
      });

      // Medical treatment
      const treatable = state.crew.filter(
        c => c.isAlive && (c.healthStatus === HealthStatus.Ill || c.healthStatus === HealthStatus.Critical || c.healthStatus === HealthStatus.Stressed)
      );
      if (treatable.length > 0 && state.resources[ResourceType.Medical] > 0) {
        actions.push({
          command: 'SELECT_SURFACE_ACTIVITY',
          label: 'Medical Treatment',
          description: 'Treat an ill or injured crew member (1 MU)',
          enabled: true,
        });
      }

      break;
    }

    case Phase.Colony:
      // No actions in colony phase — it's scoring
      break;
  }

  // Save/Load always available (unless Ironman)
  const mods = DIFFICULTY_MODIFIERS[state.difficulty];
  if (mods.saveLoadAllowed) {
    actions.push({
      command: 'SAVE_GAME',
      label: 'Save Game',
      description: 'Save current progress',
      enabled: true,
    });
    actions.push({
      command: 'LOAD_GAME',
      label: 'Load Game',
      description: 'Load a saved game',
      enabled: true,
    });
  }

  return actions;
}

// --- Main Engine ---
export function createEngine(): GameEngine {
  function makeResult(
    state: GameState,
    narrative: NarrativeEntry[],
    extraActions?: GameAction[]
  ): GameResult {
    const result: GameResult = {
      state,
      narrative,
      availableActions: extraActions ?? getAvailableActions(state),
    };

    if (state.phase === Phase.Colony && !state.isGameOver) {
      const { breakdown, rating } = calculateScore(state);
      result.scoreBreakdown = breakdown;
      result.scoreRating = rating;
      state.score = breakdown.total;
      state.victoryTier = determineVictoryTier(state);
    }

    return result;
  }

  return {
    createGame(config: GameConfig): GameResult {
      const state = createInitialState(config);
      const mods = DIFFICULTY_MODIFIERS[config.difficulty];
      const narrative: NarrativeEntry[] = [
        narr(
          `Welcome, Commander ${config.commanderName}. You have been selected to lead humanity's first permanent lunar colony. ` +
          `Your budget: ${mods.availableBudget} CR. Difficulty: ${config.difficulty}. ` +
          `Allocate wisely — every credit counts.`,
          'STORY',
          0
        ),
        narr(
          `Your crew: ${state.crew.map(c => `${c.name} (${c.role})`).join(', ')}`,
          'SYSTEM',
          0
        ),
      ];

      state.narrativeLog = [...narrative];
      return makeResult(state, narrative);
    },

    executeCommand(state: GameState, command: GameCommand): GameResult {
      let s: GameState = {
        ...state,
        resources: { ...state.resources },
        crew: state.crew.map(c => ({ ...c })),
        phaseData: { ...state.phaseData },
        narrativeLog: [...state.narrativeLog],
      };
      const narrative: NarrativeEntry[] = [];
      const rng = createRng(s.rngSeed + s.turn * 1000 + s.totalTurns);

      switch (command.type) {
        // ====== ALLOCATE_RESOURCES ======
        case 'ALLOCATE_RESOURCES': {
          const mods = DIFFICULTY_MODIFIERS[s.difficulty];
          const alloc = command.resources;

          // Calculate total cost
          let totalCost = 0;
          for (const [rt, amount] of Object.entries(alloc)) {
            if (rt === ResourceType.Budget) continue;
            const cost = RESOURCE_COSTS[rt as ResourceType];
            totalCost += amount * cost.costPerUnit;
          }

          if (totalCost > mods.availableBudget) {
            narrative.push(narr(
              `Budget exceeded! Total cost: ${totalCost} CR, available: ${mods.availableBudget} CR. Allocation rejected.`,
              'WARNING',
              s.turn
            ));
            break;
          }

          // Validate per-resource constraints
          for (const [rt, amount] of Object.entries(alloc)) {
            if (rt === ResourceType.Budget) continue;
            const cost = RESOURCE_COSTS[rt as ResourceType];
            const spend = amount * cost.costPerUnit;
            if (spend < cost.minPurchase && amount > 0) {
              narrative.push(narr(
                `${cost.unitLabel}: minimum purchase is ${cost.minPurchase} CR (${cost.minPurchase / cost.costPerUnit} units)`,
                'WARNING',
                s.turn
              ));
              break;
            }
            if (spend > cost.maxPurchase) {
              narrative.push(narr(
                `${cost.unitLabel}: maximum purchase is ${cost.maxPurchase} CR`,
                'WARNING',
                s.turn
              ));
              break;
            }
          }

          // Apply allocation
          s.resources = { ...alloc };
          s.resources[ResourceType.Budget] = mods.availableBudget - totalCost;

          narrative.push(narr(
            `Resources allocated. ${s.resources[ResourceType.Budget]} CR held in reserve for Gateway resupply.`,
            'SYSTEM',
            s.turn
          ));
          break;
        }

        // ====== START_MISSION ======
        case 'START_MISSION': {
          if (s.resources[ResourceType.Propulsion] <= 0) {
            narrative.push(narr('Cannot start mission without propulsion allocated!', 'WARNING', s.turn));
            break;
          }
          narrative.push(narr(
            'All systems checked. Mission Control gives the final GO. The dream of Lunar Colony 3000 begins now.',
            'STORY',
            s.turn
          ));
          s = advancePhase(s);
          // Extract new narratives from state
          break;
        }

        // ====== SET_CONSUMPTION ======
        case 'SET_CONSUMPTION': {
          s.consumptionLevel = command.level;
          const labels: Record<ConsumptionLevel, string> = {
            [ConsumptionLevel.Rationing]: 'Rationing — the crew tightens their belts. O₂ recyclers at minimum.',
            [ConsumptionLevel.Standard]: 'Standard consumption — adequate food, water, and air.',
            [ConsumptionLevel.Generous]: 'Generous — full meals, comfortable temperature. The crew appreciates it.',
          };
          narrative.push(narr(labels[command.level], 'STATUS', s.turn));
          break;
        }

        // ====== SELECT_LAUNCH_PROFILE ======
        case 'SELECT_LAUNCH_PROFILE': {
          const profile = command.profile;
          const params = LAUNCH_PROFILES[profile];

          if (s.resources[ResourceType.Propulsion] < params.fuelCost) {
            narrative.push(narr(
              `Not enough fuel for ${profile} launch. Need ${params.fuelCost} FU, have ${s.resources[ResourceType.Propulsion]} FU.`,
              'WARNING', s.turn
            ));
            break;
          }

          s.resources[ResourceType.Propulsion] -= params.fuelCost;
          s.phaseData.launchProfile = profile;

          narrative.push(narr(
            'T-minus 10... 9... 8... Main engine start. You feel the rumble of 8.8 million pounds of thrust as the SLS clears the tower.',
            'STORY',
            s.turn
          ));

          // Check for complications
          if (rng.chance(params.complicationChance)) {
            s.phaseData.launchComplicationOccurred = true;
            const roll = rng.nextInt(1, 100);
            if (roll <= 30) {
              s.resources[ResourceType.SpareParts] = Math.max(0, s.resources[ResourceType.SpareParts] - 2);
              narrative.push(narr(
                'Engine vibration detected! Engineering uses spare parts for emergency stabilization. -2 PU.',
                'WARNING', s.turn
              ));
            } else if (roll <= 55) {
              s.resources[ResourceType.Propulsion] = Math.max(0, s.resources[ResourceType.Propulsion] - 5);
              narrative.push(narr(
                'Launch held for weather. Delayed window costs extra fuel. -5 FU.',
                'WARNING', s.turn
              ));
            } else if (roll <= 75) {
              s.resources[ResourceType.Propulsion] = Math.max(0, s.resources[ResourceType.Propulsion] - 10);
              narrative.push(narr(
                'Partial thrust on booster 2! Compensating with remaining engines. -10 FU.',
                'WARNING', s.turn
              ));
            } else if (roll <= 90) {
              s.resources[ResourceType.Shielding] = Math.max(0, s.resources[ResourceType.Shielding] - 1);
              narrative.push(narr(
                'Minor debris strike during ascent. Shielding absorbs the impact. -1 SR.',
                'WARNING', s.turn
              ));
            } else {
              s.resources[ResourceType.SpareParts] = Math.max(0, s.resources[ResourceType.SpareParts] - 3);
              s.resources[ResourceType.Shielding] = Math.max(0, s.resources[ResourceType.Shielding] - 1);
              const aliveCrew = s.crew.filter(c => c.isAlive);
              if (aliveCrew.length > 0) {
                const target = aliveCrew[rng.nextInt(0, aliveCrew.length - 1)];
                const idx = s.crew.findIndex(c => c.id === target.id);
                if (s.crew[idx].healthStatus === HealthStatus.Healthy) {
                  s.crew[idx].healthStatus = HealthStatus.Stressed;
                  s.crew[idx].turnsInState = 0;
                }
              }
              narrative.push(narr(
                'System malfunction! Multiple warnings fire simultaneously. Emergency repairs drain parts and shielding. -3 PU, -1 SR. A crew member is shaken.',
                'WARNING', s.turn
              ));
            }
          } else {
            narrative.push(narr(
              'Ascent nominal. All systems green. The crew watches Earth shrink through the observation window.',
              'STATUS', s.turn
            ));
          }
          break;
        }

        // ====== PROCEED ======
        case 'PROCEED': {
          switch (s.phase) {
            case Phase.Launch: {
              if (!s.phaseData.launchProfile) {
                narrative.push(narr('Select a launch profile before proceeding.', 'WARNING', s.turn));
                break;
              }
              // Process turn then advance phase
              const turnResult = processTurn(s, rng);
              s = turnResult.state;
              narrative.push(...turnResult.narrative);
              if (!s.isGameOver && canAdvancePhase(s)) {
                s = advancePhase(s);
              }
              break;
            }

            case Phase.LunarTransit: {
              const turnResult = processTurn(s, rng);
              s = turnResult.state;
              narrative.push(...turnResult.narrative);
              if (!s.isGameOver && canAdvancePhase(s)) {
                s = advancePhase(s);
              }
              break;
            }

            case Phase.Gateway: {
              // Bypass gateway - mark as visited and proceed
              if (!s.phaseData.gatewayVisited) {
                s.phaseData.gatewayVisited = true;
                narrative.push(narr(
                  'Bypassing Gateway Station. No time for resupply — pressing on to landing site selection.',
                  'STATUS', s.turn
                ));
              }
              break;
            }

            case Phase.Descent: {
              if (s.phaseData.landingAttempted && canAdvancePhase(s)) {
                s = advancePhase(s);
              }
              break;
            }

            case Phase.SurfaceOps: {
              // End surface ops early
              if (canAdvancePhase(s)) {
                s = advancePhase(s);
              }
              break;
            }

            default:
              narrative.push(narr('Nothing to proceed to at this time.', 'SYSTEM', s.turn));
          }
          break;
        }

        // ====== STOP_AT_GATEWAY ======
        case 'STOP_AT_GATEWAY': {
          // Deduct docking fuel
          const dockFuel = 5;
          s.resources[ResourceType.Propulsion] = Math.max(0, s.resources[ResourceType.Propulsion] - dockFuel);
          s.phaseData.gatewayVisited = true;

          // Process a turn for docking
          const turnResult = processTurn(s, rng);
          s = turnResult.state;
          narrative.push(...turnResult.narrative);

          narrative.push(narr(
            'Docking clamps engage. Welcome aboard Lunar Gateway Station. -5 FU. Resupply options available.',
            'STORY', s.turn
          ));
          break;
        }

        // ====== GATEWAY_RESUPPLY ======
        case 'GATEWAY_RESUPPLY': {
          const purchases = command.purchases;
          const mods = DIFFICULTY_MODIFIERS[s.difficulty];
          const priceMultiplier = mods.gatewayPriceMultiplier;
          let totalCost = 0;

          // Calculate costs
          const items: { rt: ResourceType; amount: number; cost: number }[] = [];
          for (const [rt, amount] of Object.entries(purchases)) {
            if (!amount || amount <= 0) continue;
            if (rt === ResourceType.Propulsion) {
              narrative.push(narr('Propulsion fuel is not available at Gateway Station.', 'WARNING', s.turn));
              continue;
            }
            if (rt === ResourceType.Budget) continue;

            const baseCost = RESOURCE_COSTS[rt as ResourceType].costPerUnit;
            const unitCost = Math.ceil(baseCost * priceMultiplier);
            const lineCost = amount * unitCost;
            totalCost += lineCost;
            items.push({ rt: rt as ResourceType, amount, cost: lineCost });
          }

          if (totalCost > s.resources[ResourceType.Budget]) {
            narrative.push(narr(
              `Not enough credits. Total: ${totalCost} CR, available: ${s.resources[ResourceType.Budget]} CR.`,
              'WARNING', s.turn
            ));
            break;
          }

          // Apply purchases
          for (const item of items) {
            s.resources[item.rt] += item.amount;
          }
          s.resources[ResourceType.Budget] -= totalCost;
          s.phaseData.gatewayResupplied = true;

          narrative.push(narr(
            `Resupply complete. Spent ${totalCost} CR at Gateway. Remaining budget: ${s.resources[ResourceType.Budget]} CR.`,
            'STATUS', s.turn
          ));
          break;
        }

        // ====== GATEWAY_MEDICAL ======
        case 'GATEWAY_MEDICAL': {
          const crewId = command.crewId;
          const member = s.crew.find(c => c.id === crewId);
          if (!member || !member.isAlive) {
            narrative.push(narr('Invalid crew member for medical treatment.', 'WARNING', s.turn));
            break;
          }
          if (s.resources[ResourceType.Budget] < GATEWAY_MEDICAL_COST) {
            narrative.push(narr(`Not enough credits for Gateway medical. Need ${GATEWAY_MEDICAL_COST} CR.`, 'WARNING', s.turn));
            break;
          }

          s.resources[ResourceType.Budget] -= GATEWAY_MEDICAL_COST;
          const idx = s.crew.findIndex(c => c.id === crewId);
          s.crew[idx].healthStatus = HealthStatus.Stressed;
          s.crew[idx].turnsInState = 0;

          narrative.push(narr(
            `${member.name} receives Gateway medical treatment. Condition improved to Stressed. -${GATEWAY_MEDICAL_COST} CR.`,
            'STATUS', s.turn
          ));
          break;
        }

        // ====== SELECT_LANDING_SITE ======
        case 'SELECT_LANDING_SITE': {
          const site = LANDING_SITES.find(s => s.id === command.siteId);
          if (!site) {
            narrative.push(narr(`Unknown landing site: ${command.siteId}`, 'WARNING', s.turn));
            break;
          }
          s.selectedLandingSite = site;
          s.phaseData.gatewayVisited = true; // Ensure phase can advance

          narrative.push(narr(
            `Landing site selected: ${site.name}. ${site.description}`,
            'STORY', s.turn
          ));

          // Advance to descent phase
          s = advancePhase(s);
          break;
        }

        // ====== EXECUTE_DESCENT ======
        case 'EXECUTE_DESCENT': {
          const fuelSpent = Math.min(
            Math.max(DESCENT_MIN_FUEL, command.fuelUnits),
            Math.min(DESCENT_MAX_FUEL, s.resources[ResourceType.Propulsion])
          );

          if (s.resources[ResourceType.Propulsion] < DESCENT_MIN_FUEL) {
            narrative.push(narr(
              `Not enough fuel for descent. Need at least ${DESCENT_MIN_FUEL} FU.`,
              'WARNING', s.turn
            ));
            break;
          }

          s.resources[ResourceType.Propulsion] -= fuelSpent;
          s.phaseData.landingAttempted = true;

          // Calculate landing score
          const terrainBonus = s.selectedLandingSite
            ? (s.selectedLandingSite.terrainDifficulty - 3) * 5
            : 0;
          const diffMods = DIFFICULTY_MODIFIERS[s.difficulty];
          const randomFactor = rng.nextInt(-10, 10);
          const landingScore = Math.floor(
            (fuelSpent / 60) * 50 +
            s.resources[ResourceType.SpareParts] * 2 +
            terrainBonus +
            diffMods.landingScoreBonus +
            randomFactor
          );

          s.phaseData.landingScore = landingScore;

          narrative.push(narr(
            `Descent burn initiated. ${fuelSpent} FU committed. Landing score: ${landingScore}.`,
            'STORY', s.turn
          ));

          // Apply landing outcome
          if (landingScore < LANDING_CRASH_THRESHOLD) {
            // Catastrophic crash
            s.isGameOver = true;
            s.gameOverReason = 'Catastrophic crash landing. All crew killed.';
            for (const member of s.crew) {
              member.healthStatus = HealthStatus.Dead;
              member.isAlive = false;
              member.health = 0;
            }
            narrative.push(narr(
              'CAPCOM: "That landing was... suboptimal." The lander impacts at 45 m/s. There are no survivors.',
              'DEATH', s.turn
            ));
          } else if (landingScore < 20) {
            // Crash landing
            s.resources[ResourceType.SpareParts] = Math.max(0, s.resources[ResourceType.SpareParts] - 8);
            s.resources[ResourceType.Shielding] = Math.max(0, s.resources[ResourceType.Shielding] - 4);
            s.resources[ResourceType.LifeSupport] = Math.max(0, s.resources[ResourceType.LifeSupport] - 5);
            for (const member of s.crew) {
              if (member.isAlive) {
                member.healthStatus = HealthStatus.Critical;
                member.turnsInState = 0;
              }
            }
            narrative.push(narr(
              'Crash landing! The lander hits hard. Everything rattles. Warning lights everywhere. All crew critical. -8 PU, -4 SR, -5 SD.',
              'WARNING', s.turn
            ));
          } else if (landingScore < 40) {
            // Rough landing
            s.resources[ResourceType.SpareParts] = Math.max(0, s.resources[ResourceType.SpareParts] - 5);
            s.resources[ResourceType.Shielding] = Math.max(0, s.resources[ResourceType.Shielding] - 2);
            s.resources[ResourceType.LifeSupport] = Math.max(0, s.resources[ResourceType.LifeSupport] - 3);
            let illCount = 0;
            for (const member of s.crew) {
              if (member.isAlive && illCount < 2) {
                member.healthStatus = HealthStatus.Ill;
                member.turnsInState = 0;
                illCount++;
              }
            }
            narrative.push(narr(
              'Rough landing. The lander slams down at an angle. Two crew members injured. -5 PU, -2 SR, -3 SD.',
              'WARNING', s.turn
            ));
          } else if (landingScore < 60) {
            // Hard landing
            s.resources[ResourceType.SpareParts] = Math.max(0, s.resources[ResourceType.SpareParts] - 3);
            s.resources[ResourceType.Shielding] = Math.max(0, s.resources[ResourceType.Shielding] - 1);
            const alive = s.crew.filter(c => c.isAlive);
            if (alive.length > 0) {
              const target = alive[rng.nextInt(0, alive.length - 1)];
              const idx = s.crew.findIndex(c => c.id === target.id);
              s.crew[idx].healthStatus = HealthStatus.Stressed;
              s.crew[idx].turnsInState = 0;
            }
            narrative.push(narr(
              'Hard landing. The touchdown jars the crew. Minor structural damage. -3 PU, -1 SR. One crew member shaken.',
              'STATUS', s.turn
            ));
          } else if (landingScore < 80) {
            // Nominal landing
            s.resources[ResourceType.SpareParts] = Math.max(0, s.resources[ResourceType.SpareParts] - 1);
            narrative.push(narr(
              'Nominal landing. The lander touches down with a gentle thud. Minor wear on landing gear. -1 PU.',
              'STATUS', s.turn
            ));
          } else {
            // Perfect landing
            narrative.push(narr(
              '"The Eagle has landed." A textbook touchdown. The crew cheers. +50 bonus score.',
              'STORY', s.turn
            ));
          }

          // Process turn after descent
          if (!s.isGameOver) {
            const turnResult = processTurn(s, rng);
            s = turnResult.state;
            narrative.push(...turnResult.narrative);
          }

          // Auto-advance to surface ops if landing succeeded
          if (!s.isGameOver && canAdvancePhase(s)) {
            s = advancePhase(s);
          }
          break;
        }

        // ====== ABORT_LANDING ======
        case 'ABORT_LANDING': {
          if (s.phaseData.landingAbortUsed) {
            narrative.push(narr('Landing abort already used. Cannot abort again.', 'WARNING', s.turn));
            break;
          }
          if (s.resources[ResourceType.Propulsion] < LANDING_ABORT_FUEL_COST) {
            narrative.push(narr(
              `Not enough fuel for abort. Need ${LANDING_ABORT_FUEL_COST} FU.`,
              'WARNING', s.turn
            ));
            break;
          }

          s.resources[ResourceType.Propulsion] -= LANDING_ABORT_FUEL_COST;
          s.phaseData.landingAbortUsed = true;
          s.phaseData.landingAttempted = false;
          s.phase = Phase.Gateway;
          s.phaseData.gatewayVisited = true;
          s.phaseData.gatewayResupplied = false;

          narrative.push(narr(
            'ABORT! ABORT! Main engine reignites for emergency ascent. Returning to Gateway. -40 FU. Two extra turns consumed.',
            'WARNING', s.turn
          ));
          s.totalTurns += 2;
          break;
        }

        // ====== SELECT_SURFACE_ACTIVITY ======
        case 'SELECT_SURFACE_ACTIVITY': {
          const activity = command.activity;

          switch (activity) {
            case SurfaceActivity.Shelter: {
              narrative.push(narr(
                'The crew shelters in the habitat. A quiet turn — rest and recovery.',
                'STATUS', s.turn
              ));
              // Shelter can help stressed crew recover
              for (const member of s.crew) {
                if (member.isAlive && member.healthStatus === HealthStatus.Stressed) {
                  member.turnsInState++;
                  if (member.turnsInState >= 2) {
                    member.healthStatus = HealthStatus.Healthy;
                    member.turnsInState = 0;
                    narrative.push(narr(
                      `${member.name} has recovered from stress through rest.`,
                      'STATUS', s.turn
                    ));
                  }
                }
              }
              // Process turn
              const shelterTurn = processTurn(s, rng);
              s = shelterTurn.state;
              narrative.push(...shelterTurn.narrative);
              break;
            }

            case SurfaceActivity.MedicalTreatment: {
              const targetId = command.targetCrewId;
              const target = targetId ? s.crew.find(c => c.id === targetId) : s.crew.find(
                c => c.isAlive && (c.healthStatus === HealthStatus.Critical || c.healthStatus === HealthStatus.Ill || c.healthStatus === HealthStatus.Stressed)
              );

              if (!target) {
                narrative.push(narr('No crew member needs medical treatment.', 'SYSTEM', s.turn));
                break;
              }

              if (s.resources[ResourceType.Medical] <= 0) {
                narrative.push(narr('No medical supplies available!', 'WARNING', s.turn));
                break;
              }

              const idx = s.crew.findIndex(c => c.id === target.id);
              if (target.healthStatus === HealthStatus.Critical) {
                if (s.resources[ResourceType.Medical] >= 2) {
                  s.resources[ResourceType.Medical] -= 2;
                  s.crew[idx].healthStatus = HealthStatus.Ill;
                  s.crew[idx].turnsInState = 0;
                  narrative.push(narr(
                    `${target.name} receives intensive medical treatment. Condition improved to Ill. -2 MU.`,
                    'STATUS', s.turn
                  ));
                } else {
                  narrative.push(narr(
                    `Critical treatment requires 2 MU. Only ${s.resources[ResourceType.Medical]} available.`,
                    'WARNING', s.turn
                  ));
                }
              } else if (target.healthStatus === HealthStatus.Ill) {
                s.resources[ResourceType.Medical] -= 1;
                s.crew[idx].healthStatus = HealthStatus.Stressed;
                s.crew[idx].turnsInState = 0;
                narrative.push(narr(
                  `${target.name} receives medical treatment. Condition improved to Stressed. -1 MU.`,
                  'STATUS', s.turn
                ));
              } else if (target.healthStatus === HealthStatus.Stressed) {
                s.resources[ResourceType.Medical] -= 1;
                s.crew[idx].healthStatus = HealthStatus.Healthy;
                s.crew[idx].turnsInState = 0;
                narrative.push(narr(
                  `${target.name} receives treatment and recovers to full health. -1 MU.`,
                  'STATUS', s.turn
                ));
              }

              // Process turn
              const medTurn = processTurn(s, rng);
              s = medTurn.state;
              narrative.push(...medTurn.narrative);
              break;
            }

            case SurfaceActivity.EvaIceExtraction:
            case SurfaceActivity.EvaEquipmentRepair:
            case SurfaceActivity.EvaScienceMission: {
              // EVA initiated — awaiting skill result
              const evaType = activity === SurfaceActivity.EvaIceExtraction ? 'Ice Extraction'
                : activity === SurfaceActivity.EvaEquipmentRepair ? 'Equipment Repair'
                : 'Science Mission';

              narrative.push(narr(
                `EVA: ${evaType} initiated. Crew suiting up for extravehicular activity.`,
                'STORY', s.turn
              ));

              // Store pending activity for EVA_SKILL_RESULT
              // We store the activity type in a way the engine can reference it
              s.currentEvent = {
                id: `eva-pending-${activity}`,
                name: `EVA: ${evaType}`,
                description: `Awaiting EVA skill challenge result for ${evaType}`,
                probability: 0,
                category: 'MECHANICAL' as any,
                severity: 'MINOR' as any,
                phases: [Phase.SurfaceOps],
                effects: [],
              };
              break;
            }
          }

          // Check if surface ops should end
          if (!s.isGameOver && s.phase === Phase.SurfaceOps && canAdvancePhase(s)) {
            s = advancePhase(s);
          }
          break;
        }

        // ====== EVA_SKILL_RESULT ======
        case 'EVA_SKILL_RESULT': {
          const outcome = command.outcome;
          const pendingEva = s.currentEvent;
          s.currentEvent = null;

          if (!pendingEva || !pendingEva.id.startsWith('eva-pending-')) {
            narrative.push(narr('No EVA in progress.', 'WARNING', s.turn));
            break;
          }

          const activityType = pendingEva.id.replace('eva-pending-', '') as SurfaceActivity;

          // Determine yield multiplier and parts cost
          let yieldMult = 1.0;
          let partsCost = 1;
          switch (outcome) {
            case EvaOutcome.Textbook:
              yieldMult = 1.0; partsCost = 1;
              narrative.push(narr('Textbook EVA! Everything goes perfectly.', 'STATUS', s.turn));
              break;
            case EvaOutcome.Successful:
              yieldMult = 0.75; partsCost = 1;
              narrative.push(narr('Successful EVA. Mission objectives achieved.', 'STATUS', s.turn));
              break;
            case EvaOutcome.Difficult:
              yieldMult = 0.5; partsCost = 2;
              narrative.push(narr('Completed with difficulty. Extra parts consumed.', 'STATUS', s.turn));
              break;
            case EvaOutcome.Fumble:
              yieldMult = 0.25; partsCost = 2;
              narrative.push(narr('Equipment fumble! Minimal yield, extra parts wasted.', 'WARNING', s.turn));
              break;
            case EvaOutcome.Aborted:
              yieldMult = 0; partsCost = 1;
              narrative.push(narr('EVA aborted. Parts wasted, nothing gained.', 'WARNING', s.turn));
              break;
          }

          // Deduct parts
          s.resources[ResourceType.SpareParts] = Math.max(0, s.resources[ResourceType.SpareParts] - partsCost);

          // Apply EVA yield
          switch (activityType) {
            case SurfaceActivity.EvaIceExtraction: {
              const iceBonus = s.selectedLandingSite ? (s.selectedLandingSite.iceAccess - 3) : 0;
              const iceYield = Math.floor((EVA_ICE_BASE_YIELD + iceBonus) * yieldMult);
              s.resources[ResourceType.LifeSupport] += iceYield;
              if (iceYield > 0) {
                narrative.push(narr(
                  `Ice extraction yields ${iceYield} SD of water. Life support replenished.`,
                  'STATUS', s.turn
                ));
              }
              break;
            }
            case SurfaceActivity.EvaEquipmentRepair: {
              const srYield = Math.floor(EVA_REPAIR_YIELD_SR * yieldMult);
              s.resources[ResourceType.Shielding] += srYield;
              if (srYield > 0) {
                narrative.push(narr(
                  `Equipment repair yields +${srYield} SR. Systems reinforced.`,
                  'STATUS', s.turn
                ));
              }
              break;
            }
            case SurfaceActivity.EvaScienceMission: {
              const sunlightMod = s.selectedLandingSite ? (s.selectedLandingSite.sunlight - 3) * 30 : 0;
              const sciScore = Math.floor((EVA_SCIENCE_BASE_SCORE + sunlightMod) * yieldMult);
              s.score += sciScore;
              s.phaseData.scienceEvasCompleted++;
              if (sciScore > 0) {
                narrative.push(narr(
                  `Science mission yields +${sciScore} score points. Valuable data collected.`,
                  'STATUS', s.turn
                ));
              }
              break;
            }
          }

          s.phaseData.evasCompleted++;

          // EVA risk roll
          const mods = DIFFICULTY_MODIFIERS[s.difficulty];
          const evaRiskRoll = rng.nextInt(1, 100);
          const accidentThreshold = Math.floor(30 * mods.evaAccidentMultiplier);

          if (evaRiskRoll > (100 - accidentThreshold)) {
            const aliveCrew = s.crew.filter(c => c.isAlive);
            if (aliveCrew.length > 0) {
              const targetIdx = rng.nextInt(0, aliveCrew.length - 1);
              const target = aliveCrew[targetIdx];
              const crewIdx = s.crew.findIndex(c => c.id === target.id);

              if (evaRiskRoll >= 99) {
                // Fatal accident (1%)
                s.crew[crewIdx].healthStatus = HealthStatus.Dead;
                s.crew[crewIdx].isAlive = false;
                s.crew[crewIdx].health = 0;
                narrative.push(narr(
                  `EMERGENCY: ${target.name} suffers a fatal suit failure during EVA. The crew is devastated.`,
                  'DEATH', s.turn
                ));
              } else if (evaRiskRoll >= 97) {
                // Critical suit failure
                s.crew[crewIdx].healthStatus = HealthStatus.Critical;
                s.crew[crewIdx].turnsInState = 0;
                narrative.push(narr(
                  `${target.name} suffers a critical suit failure! Requires immediate medical attention.`,
                  'WARNING', s.turn
                ));
              } else if (evaRiskRoll >= 94) {
                // Serious injury
                s.crew[crewIdx].healthStatus = HealthStatus.Ill;
                s.crew[crewIdx].turnsInState = 0;
                narrative.push(narr(
                  `${target.name} sustains a serious injury during EVA. Medical treatment required.`,
                  'WARNING', s.turn
                ));
              } else if (evaRiskRoll >= 89) {
                // Minor injury
                if (s.crew[crewIdx].healthStatus === HealthStatus.Healthy) {
                  s.crew[crewIdx].healthStatus = HealthStatus.Stressed;
                  s.crew[crewIdx].turnsInState = 0;
                }
                narrative.push(narr(
                  `${target.name} suffers a minor injury during EVA. Needs rest.`,
                  'STATUS', s.turn
                ));
              } else if (evaRiskRoll >= 81) {
                // Regolith in joints
                s.resources[ResourceType.SpareParts] = Math.max(0, s.resources[ResourceType.SpareParts] - 1);
                narrative.push(narr(
                  'Lunar regolith has infiltrated suit joints. Extra parts needed for cleanup. -1 PU.',
                  'STATUS', s.turn
                ));
              } else {
                // Suit pressure warning
                narrative.push(narr(
                  'Suit pressure warning during EVA. Activity cut short — reduced yield.',
                  'WARNING', s.turn
                ));
              }
            }
          }

          // Process turn after EVA
          const evaTurn = processTurn(s, rng);
          s = evaTurn.state;
          narrative.push(...evaTurn.narrative);

          // Check if surface ops should end
          if (!s.isGameOver && s.phase === Phase.SurfaceOps && canAdvancePhase(s)) {
            s = advancePhase(s);
          }
          break;
        }

        // ====== EVENT_CHOICE ======
        case 'EVENT_CHOICE': {
          const event = s.currentEvent;
          if (!event) {
            narrative.push(narr('No event pending.', 'WARNING', s.turn));
            break;
          }
          if (event.id !== command.eventId) {
            narrative.push(narr('Event mismatch.', 'WARNING', s.turn));
            break;
          }

          const result = applyEventEffects(s, event, command.choiceId, rng);
          s = result.state;
          narrative.push(...result.narrative);
          s.currentEvent = null;
          break;
        }

        // ====== SAVE_GAME ======
        case 'SAVE_GAME': {
          const mods = DIFFICULTY_MODIFIERS[s.difficulty];
          if (!mods.saveLoadAllowed) {
            narrative.push(narr('Ironman mode: saving is disabled.', 'WARNING', s.turn));
            break;
          }
          narrative.push(narr('Game saved successfully.', 'SYSTEM', s.turn));
          break;
        }

        // ====== LOAD_GAME ======
        case 'LOAD_GAME': {
          const mods = DIFFICULTY_MODIFIERS[s.difficulty];
          if (!mods.saveLoadAllowed) {
            narrative.push(narr('Ironman mode: loading is disabled.', 'WARNING', s.turn));
            break;
          }
          try {
            s = loadSaveData(command.saveData);
            narrative.push(narr('Game loaded successfully.', 'SYSTEM', s.turn));
          } catch (err) {
            narrative.push(narr(`Failed to load game: ${err instanceof Error ? err.message : 'unknown error'}`, 'WARNING', s.turn));
          }
          break;
        }

        // ====== ALLOCATE_COURSE_CORRECTION ======
        case 'ALLOCATE_COURSE_CORRECTION': {
          const fuel = command.fuelUnits;
          if (fuel > s.resources[ResourceType.Propulsion]) {
            narrative.push(narr(
              `Not enough fuel. Have ${s.resources[ResourceType.Propulsion]} FU, trying to spend ${fuel} FU.`,
              'WARNING', s.turn
            ));
            break;
          }

          s.resources[ResourceType.Propulsion] -= fuel;

          // Calculate trajectory correction
          const baseCost = 15; // base correction cost
          const correctionFactor = fuel / baseCost * 10;
          const randomDrift = rng.nextInt(-3, 3);
          s.phaseData.trajectoryError = Math.max(0, s.phaseData.trajectoryError - correctionFactor + randomDrift);

          narrative.push(narr(
            `Course correction burn: ${fuel} FU. Trajectory error: ${s.phaseData.trajectoryError.toFixed(1)}.`,
            'STATUS', s.turn
          ));
          break;
        }

        // ====== SELECT_CREW ======
        case 'SELECT_CREW': {
          s.crew = command.crew.map(c => ({ ...c }));
          narrative.push(narr(
            `Crew roster updated: ${s.crew.map(c => `${c.name} (${c.role})`).join(', ')}`,
            'SYSTEM', s.turn
          ));
          break;
        }

        // ====== SET_DIFFICULTY ======
        case 'SET_DIFFICULTY': {
          s.difficulty = command.difficulty;
          narrative.push(narr(`Difficulty set to ${command.difficulty}.`, 'SYSTEM', s.turn));
          break;
        }

        default: {
          narrative.push(narr(`Unknown command type: ${(command as any).type}`, 'WARNING', s.turn));
        }
      }

      // Update narrative log
      s.narrativeLog = [...s.narrativeLog, ...narrative];

      return makeResult(s, narrative);
    },

    getAvailableActions(state: GameState): GameAction[] {
      return getAvailableActions(state);
    },

    saveGame(state: GameState): SaveData {
      return createSaveData(state);
    },

    loadGame(data: SaveData): GameState {
      return loadSaveData(data);
    },
  };
}
