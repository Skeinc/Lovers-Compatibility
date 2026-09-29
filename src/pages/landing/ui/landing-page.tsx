import { useNavigate } from "react-router-dom";

import { NewCoupleButton } from "@/features/reset-session";
import { phaseToPath, usePhase, useSessionActions } from "@/entities/session";
import { Button } from "@/shared/ui/button";
import { Screen } from "@/shared/ui/confirm-dialog";
import { EmojiMark } from "@/shared/ui/emoji-mark";

export function LandingPage() {
  const phase = usePhase();
  const { dispatch } = useSessionActions();
  const navigate = useNavigate();

  if (phase !== "landing") {
    return (
      <Screen centered>
        <EmojiMark symbol="⏳" />
        <p className="mt-6 text-sm tracking-[0.18em] text-accent uppercase">Сессия на этом телефоне</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight">Тест уже начат</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Можно вернуться к текущей паре или стереть ответы и начать заново.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3">
          <Button onClick={() => void navigate(phaseToPath(phase))}>Продолжить тест</Button>
          <NewCoupleButton />
        </div>
      </Screen>
    );
  }

  return (
    <Screen centered>
      <EmojiMark symbol="💌" />
      <p className="mt-6 text-sm tracking-[0.22em] text-accent uppercase">Для двоих, один телефон</p>
      <h1 className="mt-4 max-w-[16ch] font-serif text-5xl leading-[1.05] tracking-tight">LOVERS COMPATIBILITY</h1>
      <p className="mt-5 max-w-sm text-xl leading-snug text-foreground">
        Насколько хорошо вы действительно знаете друг друга?
      </p>
      <p className="mt-4 max-w-sm text-base leading-relaxed text-muted">
        10–15 минут, один телефон и несколько неудобно точных вопросов.
      </p>
      <div className="mt-10 w-full">
        <Button
          onClick={() => {
            dispatch({ type: "start" });
            void navigate("/setup");
          }}
        >
          Начать тест
        </Button>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-muted">Развлекательный тест. Не научная диагностика отношений.</p>
    </Screen>
  );
}
