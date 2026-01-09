
import { Trip, BudgetTier, DayPlan } from "../types";
import { BUDGET_TIERS } from "../constants";

export function recalculateTripCosts(trip: Trip, newTier: BudgetTier): Trip {
  const oldConfig = BUDGET_TIERS[trip.budgetTier];
  const newConfig = BUDGET_TIERS[newTier];

  const updatedDays = trip.days.map((day) => {
    // We "reverse" the old multipliers to get base costs, then apply new ones
    // This is a simplified simulation of recalculating live data
    const baseHotel = day.cost.hotel / oldConfig.hotel_multiplier;
    const baseFood = day.cost.food / oldConfig.food_multiplier;
    const baseTransport = day.cost.transport / oldConfig.transport_multiplier;
    const baseActivities = day.cost.activities / oldConfig.activities_multiplier;

    return {
      ...day,
      cost: {
        hotel: Math.round(baseHotel * newConfig.hotel_multiplier),
        food: Math.round(baseFood * newConfig.food_multiplier),
        transport: Math.round(baseTransport * newConfig.transport_multiplier),
        activities: Math.round(baseActivities * newConfig.activities_multiplier),
      }
    };
  });

  // Fixed reduce call: moved the initial value 0 outside the callback function scope
  const totalCost = updatedDays.reduce((acc, day) => 
    acc + day.cost.hotel + day.cost.food + day.cost.transport + day.cost.activities
  , 0);

  return {
    ...trip,
    budgetTier: newTier,
    days: updatedDays,
    totalCost
  };
}

export function calculateTotalCost(days: DayPlan[]): number {
  // Fixed reduce call: removed extra arguments and ensured the initial value is correctly positioned
  return days.reduce((acc, day) => 
    acc + day.cost.hotel + day.cost.food + day.cost.transport + day.cost.activities
  , 0);
}
