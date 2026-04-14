import type { GameSystem, GameState, Resources } from '../engine/types';
import {
  ResourceType,
  RESOURCE_COSTS,
  GATEWAY_BASE_PRICE_MULTIPLIER,
  DIFFICULTY_MODIFIERS,
} from '../engine/types';

/**
 * Gateway Trading System
 *
 * Manages resupply at the Lunar Gateway station (Phase 4).
 * Items cost 50% more than initial prices (2/3 value per credit),
 * mirroring the Oregon Trail's fort trading mechanic.
 */
export class TradingSystem implements GameSystem {
  readonly name = 'trading';

  initialize(state: GameState): GameState {
    return state;
  }

  processTurn(state: GameState): GameState {
    return state;
  }

  /** Get per-unit prices at the Gateway (base cost × multiplier × difficulty). */
  getGatewayPrices(state: GameState): Record<ResourceType, number> {
    const mods = DIFFICULTY_MODIFIERS[state.difficulty];
    const prices = {} as Record<ResourceType, number>;

    for (const rt of Object.values(ResourceType)) {
      const baseCost = RESOURCE_COSTS[rt].costPerUnit;
      prices[rt] = Math.ceil(
        baseCost * GATEWAY_BASE_PRICE_MULTIPLIER * mods.gatewayPriceMultiplier
      );
    }
    return prices;
  }

  /** Check if the player can afford the requested purchases. */
  canAfford(state: GameState, purchases: Partial<Resources>): boolean {
    const prices = this.getGatewayPrices(state);
    let totalCost = 0;

    for (const [rt, amount] of Object.entries(purchases)) {
      if (!amount || amount <= 0) continue;
      if (rt === ResourceType.Budget) continue;
      totalCost += amount * prices[rt as ResourceType];
    }

    return totalCost <= state.resources[ResourceType.Budget];
  }

  /** Execute a purchase: deduct budget, add resources. */
  executePurchase(state: GameState, purchases: Partial<Resources>): GameState {
    const s = {
      ...state,
      resources: { ...state.resources },
    };
    const prices = this.getGatewayPrices(state);
    let totalCost = 0;

    for (const [rt, amount] of Object.entries(purchases)) {
      if (!amount || amount <= 0) continue;
      if (rt === ResourceType.Budget) continue;
      const cost = amount * prices[rt as ResourceType];
      totalCost += cost;
      s.resources[rt as ResourceType] += amount;
    }

    s.resources[ResourceType.Budget] = Math.max(
      0,
      s.resources[ResourceType.Budget] - totalCost
    );
    return s;
  }
}
