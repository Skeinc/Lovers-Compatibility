export function toAccusative(name: string): string {
  const trimmed = name.trim();
  if (!/^[\p{Script=Cyrillic}][\p{Script=Cyrillic}\s-]*$/u.test(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  if (lower.endsWith("а")) return `${trimmed.slice(0, -1)}у`;
  if (lower.endsWith("я")) return `${trimmed.slice(0, -1)}ю`;
  if (lower.endsWith("й")) return `${trimmed.slice(0, -1)}я`;
  if (lower.endsWith("ь")) return `${trimmed.slice(0, -1)}я`;
  return `${trimmed}а`;
}
