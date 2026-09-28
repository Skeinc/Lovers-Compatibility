import type { Achievement } from "./types";

export interface AchievementSignals {
  player1Percent: number;
  player2Percent: number;
  preferenceMatches: number;
  moneyMatches: number;
  whoAgreements: number;
  threeWordsSimilarity: number;
  total: number;
}

export function buildAchievements(signals: AchievementSignals): Achievement[] {
  const averagePrediction = (signals.player1Percent + signals.player2Percent) / 2;
  const earned: Achievement[] = [];

  if (signals.player1Percent >= 75 && signals.player2Percent >= 75) {
    earned.push({
      icon: "🔮",
      title: "Читатели мыслей",
      description: "Оба довольно точно угадывают выборы друг друга.",
    });
  }
  if (signals.player1Percent === 100 || signals.player2Percent === 100) {
    earned.push({
      icon: "📖",
      title: "Открытая книга",
      description: "Один из вас угадал ответы партнёра без промаха.",
    });
  }
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
  if (signals.preferenceMatches <= 1 && averagePrediction >= 70) {
    earned.push({
      icon: "👁",
      title: "Разные, но внимательные",
      description: "Вкусы расходятся, но вы всё равно неплохо считываете друг друга.",
    });
  }
  if (signals.preferenceMatches >= 2 && averagePrediction < 50) {
    earned.push({
      icon: "🪞",
      title: "Синхрон без телепатии",
      description: "Живёте похоже, а угадывать ответы друг друга пока сложнее.",
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
