export type QuestionKind =
  "choice" | "choice-predict" | "multi" | "multi-predict" | "text" | "text-predict" | "who-likely";

export type QuestionCategory = "preferences" | "values" | "dynamics" | "text" | "narrative";

export type Substep = "predict" | "actual";

export type AnswerValue = string | string[];

export interface QuestionOption {
  id: string;
  label: string;
  exclusive?: boolean;
}

export interface WhoScenario {
  id: string;
  prompt: string;
}

export type WhoChoice = "self" | "partner" | "even";

export interface Question {
  id: string;
  kind: QuestionKind;
  category: QuestionCategory;
  title: string;
  description?: string;
  placeholder?: string;
  predictPrompt?: string;
  actualPrompt?: string;
  maxSelections?: number;
  options?: QuestionOption[];
  scenarios?: WhoScenario[];
}

export interface PlayerAnswer {
  questionId: string;
  answer: AnswerValue;
  prediction?: AnswerValue;
}
