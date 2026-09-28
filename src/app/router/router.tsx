import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { HandoffPage } from "@/pages/handoff";
import { LandingPage } from "@/pages/landing";
import { PlayerPage } from "@/pages/player";
import { SetupPage } from "@/pages/setup";
import { phaseToPath, usePhase, usePlayerLocked, useSessionActions, type Phase } from "@/entities/session";

const AnalyzingPage = lazy(() => import("@/pages/analyzing").then((module) => ({ default: module.AnalyzingPage })));
const ResultsPage = lazy(() => import("@/pages/results").then((module) => ({ default: module.ResultsPage })));

function Gate({ phases, children }: { phases: readonly Phase[]; children: ReactNode }) {
  const phase = usePhase();
  const { resumePhase } = useSessionActions();
  if (resumePhase) return null;
  if (!phases.includes(phase)) return <Navigate to={phaseToPath(phase)} replace />;
  return children;
}

function PlayerOneRoute() {
  const locked = usePlayerLocked();
  const { resumePhase } = useSessionActions();
  if (resumePhase) return null;
  if (locked) return <Navigate to="/player/2" replace />;
  return (
    <Gate phases={["player1-intro", "player1"]}>
      <PlayerPage />
    </Gate>
  );
}

function PlayerTwoGate() {
  const phase = usePhase();
  const locked = usePlayerLocked();
  const { resumePhase } = useSessionActions();
  if (resumePhase) return null;
  if (!locked || (phase !== "player2-intro" && phase !== "player2")) {
    const target = phaseToPath(phase);
    return <Navigate to={target === "/player/2" ? "/" : target} replace />;
  }
  return <PlayerPage />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<p className="py-10 text-muted">Собираем экран…</p>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/setup"
          element={
            <Gate phases={["setup"]}>
              <SetupPage />
            </Gate>
          }
        />
        <Route path="/player/1" element={<PlayerOneRoute />} />
        <Route
          path="/handoff"
          element={
            <Gate phases={["handoff"]}>
              <HandoffPage />
            </Gate>
          }
        />
        <Route path="/player/2" element={<PlayerTwoGate />} />
        <Route
          path="/analyzing"
          element={
            <Gate phases={["analyzing"]}>
              <AnalyzingPage />
            </Gate>
          }
        />
        <Route
          path="/results"
          element={
            <Gate phases={["results"]}>
              <ResultsPage />
            </Gate>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
