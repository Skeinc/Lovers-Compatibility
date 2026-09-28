import type { CoupleGoal, CoupleProfile, HowMet, RelationshipDuration } from "./types";

export const DURATION_OPTIONS: ReadonlyArray<{ id: RelationshipDuration; label: string }> = [
  { id: "lt-3m", label: "Меньше 3 месяцев" },
  { id: "3-6m", label: "3–6 месяцев" },
  { id: "6-12m", label: "6–12 месяцев" },
  { id: "1-2y", label: "1–2 года" },
  { id: "2-5y", label: "2–5 лет" },
  { id: "5-10y", label: "5–10 лет" },
  { id: "gt-10y", label: "Больше 10 лет" },
  { id: "custom", label: "Указать точно" },
];

export const HOW_MET_LABELS: ReadonlyArray<{ id: HowMet; label: string }> = [
  { id: "friends", label: "Познакомились через друзей" },
  { id: "study-work", label: "Учёба / работа" },
  { id: "dating-app", label: "Приложение для знакомств" },
  { id: "internet", label: "Интернет" },
  { id: "chance", label: "Случайно" },
  { id: "other", label: "Другое" },
];

export const GOAL_OPTIONS: ReadonlyArray<{ id: CoupleGoal; label: string }> = [
  { id: "travel", label: "Путешествовать" },
  { id: "time-together", label: "Больше времени проводить вместе" },
  { id: "career", label: "Построить карьеру" },
  { id: "housing", label: "Купить жильё" },
  { id: "family", label: "Создать семью" },
  { id: "earn-more", label: "Больше зарабатывать" },
  { id: "move", label: "Переехать" },
  { id: "shared-project", label: "Заниматься общим делом" },
  { id: "easy-life", label: "Просто хорошо жить и не напрягаться" },
  { id: "other", label: "Другое" },
];

function plural(value: number, one: string, few: string, many: string): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function durationLabel(profile: CoupleProfile): string {
  if (profile.relationshipDuration !== "custom") {
    return DURATION_OPTIONS.find((item) => item.id === profile.relationshipDuration)?.label ?? "";
  }
  const years = profile.customDuration?.years ?? 0;
  const months = profile.customDuration?.months ?? 0;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${plural(years, "год", "года", "лет")}`);
  if (months > 0) parts.push(`${months} ${plural(months, "месяц", "месяца", "месяцев")}`);
  return parts.join(" ") || "точный срок не указан";
}

export function howMetLabel(profile: CoupleProfile): string {
  return HOW_MET_LABELS.find((item) => item.id === profile.howMet)?.label ?? profile.howMet;
}

export function goalLabels(profile: CoupleProfile): string[] {
  return profile.goals.map((goal) => {
    if (goal === "other" && profile.goalsOther) return profile.goalsOther;
    return GOAL_OPTIONS.find((item) => item.id === goal)?.label ?? goal;
  });
}
