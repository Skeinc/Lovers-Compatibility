import { useNavigate } from "react-router-dom";

import { useSessionActions } from "@/entities/session";
import { Button } from "@/shared/ui/button";

export function NewCoupleButton() {
  const { dispatch } = useSessionActions();
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      onClick={() => {
        dispatch({ type: "reset" });
        void navigate("/", { replace: true });
      }}
    >
      Начать новую пару
    </Button>
  );
}
