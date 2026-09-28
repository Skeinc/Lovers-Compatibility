export const RELATIONSHIP_DURATIONS = ["lt-3m", "3-6m", "6-12m", "1-2y", "2-5y", "5-10y", "gt-10y", "custom"] as const;

export type RelationshipDuration = (typeof RELATIONSHIP_DURATIONS)[number];

export const HOW_MET_OPTIONS = ["friends", "study-work", "dating-app", "internet", "chance", "other"] as const;

export type HowMet = (typeof HOW_MET_OPTIONS)[number];

export const COUPLE_GOALS = [
  "travel",
  "time-together",
  "career",
  "housing",
  "family",
  "earn-more",
  "move",
  "shared-project",
  "easy-life",
  "other",
] as const;

export type CoupleGoal = (typeof COUPLE_GOALS)[number];

export interface PersonProfile {
  name: string;
  age: number;
}

export interface CustomDuration {
  years: number;
  months: number;
}

export interface CoupleProfile {
  player1: PersonProfile;
  player2: PersonProfile;
  relationshipDuration: RelationshipDuration;
  customDuration?: CustomDuration;
  howMet: HowMet;
  howMetDetails?: string;
  goals: CoupleGoal[];
  goalsOther?: string;
}

export interface CoupleDraft {
  player1Name: string;
  player1Age: string;
  player2Name: string;
  player2Age: string;
  relationshipDuration: RelationshipDuration | "";
  customYears: string;
  customMonths: string;
  howMet: HowMet | "";
  howMetDetails: string;
  goals: CoupleGoal[];
  goalsOther: string;
}

export function emptyDraft(): CoupleDraft {
  return {
    player1Name: "",
    player1Age: "",
    player2Name: "",
    player2Age: "",
    relationshipDuration: "",
    customYears: "",
    customMonths: "",
    howMet: "",
    howMetDetails: "",
    goals: [],
    goalsOther: "",
  };
}
