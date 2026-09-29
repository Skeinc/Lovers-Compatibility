import type { Achievement } from "./types";

export interface AchievementSignals {
  preferenceMatches: number;
  moneyMatches: number;
  whoAgreements: number;
  threeWordsSimilarity: number;
  total: number;
}

export function buildAchievements(signals: AchievementSignals): Achievement[] {
  const earned: Achievement[] = [];

  if (signals.preferenceMatches === 3) {
    earned.push({
      icon: "🧠",
      title: "Один ритм",
      description: "Выходной, свидание и потерянный город у вас совпали.",
    });
  }
  if (signals.moneyMatches === 2) {
    earned.push({
      icon: "🎯",
      title: "Общий кошелёк",
      description: "И внезапные деньги, и лишние рабочие часы вы видите одинаково.",
    });
  }
  if (signals.whoAgreements >= 5) {
    earned.push({
      icon: "🧩",
      title: "Один сценарий",
      description: "Почти во всех бытовых сценах вы указали на одного и того же человека.",
    });
  }
  if (signals.threeWordsSimilarity >= 0.5) {
    earned.push({
      icon: "✉️",
      title: "Одни слова",
      description: "Три слова об отношениях у вас заметно перекликаются.",
    });
  }
  if (signals.total >= 80) {
    earned.push({
      icon: "✨",
      title: "Редкая химия",
      description: "По ответам этого теста вы часто попадаете в одну точку.",
    });
  }

  return earned.slice(0, 5);
}
