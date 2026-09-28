import { useNavigate } from "react-router-dom";

import { useSessionActions } from "@/entities/session";
import { Button } from "@/shared/ui/button";

export function RetryButton() {
  const { dispatch } = useSessionActions();
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      onClick={() => {
        dispatch({ type: "retry-analysis" });
        void navigate("/analyzing");
      }}
    >
      Попробовать AI-анализ ещё раз
    </Button>
  );
}
