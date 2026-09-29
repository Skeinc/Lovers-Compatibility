import type { PlayerAnswer } from "@/entities/question/@x/compatibility";

export const PREDICTION_QUESTION_IDS = [
  "perfect-weekend",
  "surprise-money",
  "after-conflict",
  "green-flag",
  "red-flag",
  "household-fight",
  "relocation",
  "earnings-future",
  "family-future",
  "never-forgive",
] as const;

export type DiscussionTopic = "family" | "relocation" | "earnings" | "values" | "red-flag" | "household-fight";

export type ValueOverlap = 0 | 1 | 2 | 3;

export interface CompatibilityScore {
  total: number;
}

export interface GuessMoment {
  questionId: string;
  title: string;
  guesser: string;
  expected: string;
  chooser: string;
  chosen: string;
}

export interface ReadingSide {
  guesser: string;
  target: string;
  hits: number;
  total: number;
}

export interface RoleScene {
  id: string;
  title: string;
  outcome: "player1" | "player2" | "split" | "even";
  label: string;
}

export interface ThemeMark {
  id: "relationship" | "money" | "home" | "spontaneity" | "career" | "future";
  label: string;
  agreement: number;
  similar: boolean;
}

export interface NamedChoice {
  title: string;
  player1: string;
  player2: string;
  same: boolean;
}

export interface EvaluationInput {
  player1Name: string;
  player2Name: string;
  player1: PlayerAnswer[];
  player2: PlayerAnswer[];
}

export interface Evaluation {
  scoring: CompatibilityScore;
  reading: {
    player1: ReadingSide;
    player2: ReadingSide;
    bestHit: GuessMoment | null;
    worstMiss: GuessMoment | null;
  };
  helm: {
    player1: number;
    player2: number;
    line: string;
    scenes: RoleScene[];
  };
  traffic: {
    green: string[];
    interesting: string[];
    spicy: GuessMoment | null;
  };
  themes: ThemeMark[];
  values: {
    overlap: ValueOverlap;
    shared: string[];
    player1: string[];
    player2: string[];
  };
  discussionTopic: DiscussionTopic;
  choices: NamedChoice[];
  money: { surprise: NamedChoice; earnings: NamedChoice };
  futureFamily: NamedChoice;
  sentences: { player1: string; player2: string };
}
