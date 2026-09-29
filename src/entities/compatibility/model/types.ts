import type { PlayerAnswer } from "@/entities/question/@x/compatibility";

export interface ScoreBreakdown {
  commonPreferences: number;
  values: number;
  relationshipDynamics: number;
  textSimilarity: number;
}

export interface CompatibilityScore {
  total: number;
  label: string;
  breakdown: ScoreBreakdown;
}

export interface Achievement {
  title: string;
  description: string;
  icon: string;
}

export interface LikelyItem {
  title: string;
  person: string;
  explanation: string;
}

export interface EvaluationInput {
  player1Name: string;
  player2Name: string;
  player1: PlayerAnswer[];
  player2: PlayerAnswer[];
}

export interface Evaluation {
  scoring: CompatibilityScore;
  achievements: Achievement[];
  likelyTo: LikelyItem[];
  preferenceMatches: number;
  moneyMatches: number;
  whoAgreements: number;
  threeWordsSimilarity: number;
}
