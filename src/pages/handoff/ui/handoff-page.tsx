import { EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useHandoff, useSessionActions } from "@/entities/session";
import { Button } from "@/shared/ui/button";
import { Screen } from "@/shared/ui/confirm-dialog";
import { StickyBar } from "@/shared/ui/sticky-bar";

export function HandoffPage() {
  const handoff = useHandoff();
  const { dispatch } = useSessionActions();
  const navigate = useNavigate();
  if (!handoff) return null;

  return (
    <div className="flex flex-1 flex-col">
      <Screen>
        <EyeOff className="text-accent" aria-hidden="true" />
        <h1 className="mt-6 font-serif text-5xl leading-tight">Готово.</h1>
        <p className="mt-4 text-xl leading-relaxed">Передайте телефон партнёру.</p>
        <p className="mt-3 text-lg text-muted">Не подглядывать.</p>
      </Screen>
      <StickyBar>
        <Button
          onClick={() => {
            dispatch({ type: "confirm-handoff" });
            void navigate("/player/2", { replace: true });
          }}
        >
          Передать телефон
        </Button>
      </StickyBar>
    </div>
  );
}
