import { afterEach, describe, expect, it, vi } from "vitest";

import { SESSION_TTL_MS, createSession, loadSession, saveSession } from "@/entities/session";

function installStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  });
}

describe("session storage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("drops a session older than a week and keeps a fresh one", () => {
    installStorage();
    const fresh = { ...createSession("2026-09-20T00:00:00.000Z"), phase: "setup" as const };
    saveSession(fresh);
    const now = Date.parse("2026-09-26T00:00:00.000Z");
    expect(loadSession(now)?.id).toBe(fresh.id);
    expect(loadSession(now + SESSION_TTL_MS + 1000)).toBeNull();
  });

  it("ignores a landing session and broken json", () => {
    installStorage();
    saveSession(createSession());
    expect(loadSession()).toBeNull();
    localStorage.setItem("lovers-compatibility.session.v1", "{");
    expect(loadSession()).toBeNull();
  });
});
