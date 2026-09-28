import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { ResumePrompt } from "@/widgets/resume-prompt";
import { useSessionActions } from "@/entities/session";

import { SessionProvider } from "./providers";
import { AppRoutes } from "./router/router";

function StorageNote() {
  const { storageAvailable } = useSessionActions();
  if (storageAvailable) return null;
  return <p className="pt-4 text-sm text-muted">Прогресс не сохранится на этом устройстве.</p>;
}

function Shell() {
  return (
    <div className="min-h-dvh bg-glow text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5">
        <StorageNote />
        <ResumePrompt />
        <AppRoutes />
      </div>
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}

export function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </SessionProvider>
  );
}
