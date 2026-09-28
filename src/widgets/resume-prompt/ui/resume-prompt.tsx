import { useNavigate } from "react-router-dom";

import { phaseToPath, useSessionActions } from "@/entities/session";
import { Button } from "@/shared/ui/button";

export function ResumePrompt() {
  const { resumePhase, acceptResume, declineResume } = useSessionActions();
  const navigate = useNavigate();
  if (!resumePhase) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-5 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-title"
    >
      <div className="w-full max-w-[420px] rounded-[28px] border border-border bg-[#16141a] p-6">
        <h2 id="resume-title" className="font-serif text-4xl">
          Продолжить тест?
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          На этом телефоне осталась незавершённая пара. Ответы никуда не отправлялись.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={() => {
              const phase = acceptResume();
              void navigate(phaseToPath(phase), { replace: true });
            }}
          >
            Продолжить
          </Button>
          <Button variant="ghost" onClick={declineResume}>
            Начать заново
          </Button>
        </div>
      </div>
    </div>
  );
}
