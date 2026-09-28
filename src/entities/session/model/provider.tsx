import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";

import { clearSession, loadSession, saveSession } from "../lib/storage";
import { createSession } from "./create";
import { SessionContext, type SessionContextValue } from "./context";
import { sessionReducer } from "./reducer";
import type { Phase } from "./types";

export function SessionProvider({ children }: { children: ReactNode }) {
  const [savedOnBoot] = useState(loadSession);
  const pendingRef = useRef(savedOnBoot);
  const persistEnabled = useRef(savedOnBoot === null);
  const [session, dispatch] = useReducer(sessionReducer, undefined, createSession);
  const [resumePhase, setResumePhase] = useState<Phase | null>(savedOnBoot?.phase ?? null);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    if (!persistEnabled.current) return;
    setStorageAvailable(saveSession(session));
  }, [session]);

  const value = useMemo<SessionContextValue>(() => {
    return {
      session,
      storageAvailable,
      resumePhase,
      acceptResume: () => {
        const pending = pendingRef.current;
        if (!pending) return "landing";
        persistEnabled.current = true;
        pendingRef.current = null;
        setResumePhase(null);
        dispatch({ type: "hydrate", session: pending });
        return pending.phase;
      },
      declineResume: () => {
        pendingRef.current = null;
        persistEnabled.current = true;
        setResumePhase(null);
        clearSession();
        dispatch({ type: "reset" });
      },
      dispatch,
    };
  }, [resumePhase, session, storageAvailable]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
