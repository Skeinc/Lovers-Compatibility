import { createContext, useContext } from "react";

import type { Phase, QuizSession, SessionAction } from "./types";

export interface SessionContextValue {
  session: QuizSession;
  storageAvailable: boolean;
  resumePhase: Phase | null;
  acceptResume: () => Phase;
  declineResume: () => void;
  dispatch: (action: SessionAction) => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSessionContext(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Сессия не подключена");
  return value;
}
