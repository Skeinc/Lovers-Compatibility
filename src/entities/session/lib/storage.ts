import { parseJson } from "@/shared/lib/json";

import { quizSessionSchema } from "../model/schema";
import type { QuizSession } from "../model/types";

export const SESSION_KEY = "lovers-compatibility.session.v2";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function memory(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function loadSession(now = Date.now()): QuizSession | null {
  const storage = memory();
  if (!storage) return null;
  try {
    const raw = storage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = quizSessionSchema.parse(parseJson(raw));
    if (parsed.phase === "landing") return null;
    const updated = Date.parse(parsed.updatedAt);
    if (Number.isNaN(updated) || now - updated > SESSION_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: QuizSession): boolean {
  const storage = memory();
  if (!storage) return false;
  try {
    storage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function clearSession(): void {
  const storage = memory();
  if (!storage) return;
  try {
    storage.removeItem(SESSION_KEY);
  } catch {
    return;
  }
}
