const STOP_WORDS = new Set([
  "и",
  "в",
  "во",
  "не",
  "что",
  "он",
  "на",
  "я",
  "с",
  "со",
  "как",
  "а",
  "то",
  "все",
  "она",
  "так",
  "его",
  "но",
  "да",
  "ты",
  "к",
  "у",
  "же",
  "вы",
  "за",
  "бы",
  "по",
  "только",
  "ее",
  "её",
  "мне",
  "было",
  "вот",
  "от",
  "меня",
  "еще",
  "ещё",
  "нет",
  "о",
  "из",
  "ему",
  "теперь",
  "когда",
  "даже",
  "ну",
  "ли",
  "если",
  "уже",
  "или",
  "ни",
  "быть",
  "был",
  "него",
  "до",
  "вас",
  "опять",
  "уж",
  "вам",
  "ведь",
  "там",
  "потом",
  "себя",
  "ей",
  "может",
  "они",
  "тут",
  "где",
  "есть",
  "надо",
  "для",
  "мы",
  "тебя",
  "их",
  "чем",
  "была",
  "сам",
  "без",
  "чего",
  "раз",
  "тоже",
  "себе",
  "под",
  "будет",
  "тогда",
  "кто",
  "этот",
  "того",
  "этого",
  "какой",
  "совсем",
  "здесь",
  "этом",
  "мой",
  "тем",
  "чтобы",
  "сейчас",
  "были",
  "куда",
  "зачем",
  "можно",
  "при",
  "два",
  "об",
  "после",
  "над",
  "больше",
  "тот",
  "через",
  "эти",
  "нас",
  "про",
  "них",
  "три",
  "эту",
  "моя",
  "этой",
  "перед",
  "иногда",
  "лучше",
  "чуть",
  "том",
  "такой",
  "им",
  "всегда",
  "конечно",
  "между",
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): string[] {
  return text.split(" ").filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function jaccard(left: string[], right: string[]): number {
  const a = new Set(left);
  const b = new Set(right);
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  if (union === 0) return 0;
  return intersection / union;
}

function bigrams(text: string): Map<string, number> {
  const compact = text.replaceAll(" ", "");
  const counts = new Map<string, number>();
  if (compact.length < 2) return counts;
  for (let index = 0; index < compact.length - 1; index += 1) {
    const pair = compact.slice(index, index + 2);
    counts.set(pair, (counts.get(pair) ?? 0) + 1);
  }
  return counts;
}

function cosine(left: Map<string, number>, right: Map<string, number>): number {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (const value of left.values()) leftNorm += value * value;
  for (const value of right.values()) rightNorm += value * value;
  const keys = new Set([...left.keys(), ...right.keys()]);
  for (const key of keys) {
    dot += (left.get(key) ?? 0) * (right.get(key) ?? 0);
  }
  if (leftNorm === 0 || rightNorm === 0) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

export function textSimilarity(left: string, right: string): number {
  const a = normalize(left);
  const b = normalize(right);
  if (a.length < 2 || b.length < 2) return 0;
  const overlap = jaccard(tokens(a), tokens(b));
  const shape = cosine(bigrams(a), bigrams(b));
  return (overlap + shape) / 2;
}
