
export enum BudgetTier {
  BUDGET = 'budget',
  MID_RANGE = 'mid_range',
  LUXURY = 'luxury'
}

export interface CostBreakdown {
  hotel: number;
  food: number;
  transport: number;
  activities: number;
}

export interface DayPlan {
  day: number;
  date: string;
  places: string[];
  description: string;
  cost: CostBreakdown;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  numPeople: number;
  budgetTier: BudgetTier;
  interests: string[];
  days: DayPlan[];
  totalCost: number;
  createdAt?: string;
}

export interface BudgetConfig {
  hotel_multiplier: number;
  food_multiplier: number;
  transport_multiplier: number;
  activities_multiplier: number;
}

export interface ResearcherOutput {
  suggestedPlaces: { name: string; baseCost: number; description: string }[];
  suggestedHotels: { name: string; baseCostPerNight: number; description: string }[];
  transportOptions: { type: string; baseCostPerDay: number }[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'support_agent';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ExploreData {
  recommended: string[];
  trending: string[];
  recentlyViewed: string[];
}
