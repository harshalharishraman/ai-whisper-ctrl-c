
import { BudgetTier, BudgetConfig } from './types';

export const BUDGET_TIERS: Record<BudgetTier, BudgetConfig> = {
  [BudgetTier.BUDGET]: {
    hotel_multiplier: 1.0,
    food_multiplier: 1.0,
    transport_multiplier: 1.0,
    activities_multiplier: 1.0,
  },
  [BudgetTier.MID_RANGE]: {
    hotel_multiplier: 1.7,
    food_multiplier: 1.4,
    transport_multiplier: 1.3,
    activities_multiplier: 1.3,
  },
  [BudgetTier.LUXURY]: {
    hotel_multiplier: 3.0,
    food_multiplier: 2.5,
    transport_multiplier: 2.0,
    activities_multiplier: 2.0,
  },
};

export const BASE_DAILY_FOOD_COST = 800; // Average base food cost in local currency units
export const BASE_TRANSPORT_COST = 500;  // Average base local transport cost
