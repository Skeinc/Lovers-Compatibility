import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { evaluateCompatibility } from "@/entities/compatibility";
import { useComparison, useSessionActions } from "@/entities/session";
import { runAnalysis } from "@/features/retry-analysis";
import { Screen } from "@/shared/ui/confirm-dialog";
import { EmojiMark } from "@/shared/ui/emoji-mark";

const LINES = [
  { symbol: "🔍", text: "Сравниваем ответы" },
  { symbol: "✨", text: "Ищем, где вы совпали и где разошлись" },
  { symbol: "✨", text: "Ищем неожиданные совпадения" },
  { symbol: "💌", text: "Собираем портрет вашей пары" },
];

const LINE_MS = 1500;

export function AnalyzingPage() {
  const comparison = useComparison();
  const { dispatch } = useSessionActions();
  const navigate = useNavigate();
  const [line, setLine] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const timers = LINES.map((_, index) => window.setTimeout(() => setLine(index), index * LINE_MS));
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!comparison || comparison.report || started.current) return;
    started.current = true;
    const snapshot = comparison;
    const startedAt = Date.now();
    const evaluation = evaluateCompatibility({
      player1Name: snapshot.couple.player1.name,
      player2Name: snapshot.couple.player2.name,
      player1: snapshot.player1Answers,
      player2: snapshot.player2Answers,
    });
    void runAnalysis({
      couple: snapshot.couple,
      player1: snapshot.player1Answers,
      player2: snapshot.player2Answers,
      evaluation,
    }).then(async (outcome) => {
      const wait = LINES.length * LINE_MS - (Date.now() - startedAt);
      if (wait > 0) await new Promise((resolve) => window.setTimeout(resolve, wait));
      dispatch({
        type: "set-report",
        report: outcome.report,
        source: outcome.source,
        fallbackReason: outcome.fallbackReason,
      });
      void navigate("/results", { replace: true });
    });
  }, [comparison, dispatch, navigate]);

  return (
    <Screen centered>
      <div key={line} className="line-fade flex flex-col items-center">
        <EmojiMark symbol={LINES[line]?.symbol ?? "✨"} />
        <p className="mt-6 text-sm tracking-[0.18em] text-accent uppercase">Разбираем ваши ответы</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight" aria-live="polite">
          {LINES[line]?.text}
        </h1>
      </div>
      <p className="mt-4 max-w-sm text-base text-muted">Это займёт несколько секунд. Тест уже сохранён на телефоне.</p>
    </Screen>
  );
}
