import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FinishDialog } from "@/features/complete-player";
import { QuestionView } from "@/features/answer-question";
import { isValueFilled, QUESTIONS, substepsFor, type AnswerValue } from "@/entities/question";
import { usePlayerQuiz, useSessionActions } from "@/entities/session";
import { BackButton } from "@/shared/ui/back-button";
import { Button } from "@/shared/ui/button";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { StickyBar } from "@/shared/ui/sticky-bar";

function promptLine(template: string | undefined, fallback: string, partnerName: string): string {
  return (template ?? fallback).replaceAll("{partner}", partnerName);
}

export function QuizFlow() {
  const quiz = usePlayerQuiz();
  const { dispatch } = useSessionActions();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const question = quiz ? QUESTIONS[quiz.questionIndex] : undefined;
  const saved = question ? quiz?.answers.find((item) => item.questionId === question.id) : undefined;
  const stored = quiz?.substep === "predict" ? saved?.prediction : saved?.answer;
  const stepKey = `${quiz?.phase ?? "none"}:${quiz?.questionIndex ?? 0}:${quiz?.substep ?? "actual"}:${question?.id ?? ""}`;
  const [step, setStep] = useState(stepKey);
  const [draft, setDraft] = useState<AnswerValue | undefined>(stored);
  if (step !== stepKey) {
    setStep(stepKey);
    setDraft(stored);
  }

  if (!quiz || !question || (quiz.phase !== "player1" && quiz.phase !== "player2")) return null;

  const steps = substepsFor(question.kind);
  const stepIndex = Math.max(0, steps.indexOf(quiz.substep));
  const isFinal = quiz.questionIndex === QUESTIONS.length - 1 && stepIndex === steps.length - 1;
  const filled = isValueFilled(question, draft);
  const progress = ((quiz.questionIndex + (stepIndex + 1) / steps.length) / QUESTIONS.length) * 100;
  const predicting = quiz.substep === "predict";
  const title = predicting
    ? promptLine(question.predictPrompt, `Как думаешь, что ответит {partner}?`, quiz.partnerName)
    : question.kind === "choice-predict" || question.kind === "multi-predict"
      ? promptLine(question.actualPrompt, "А что выберешь ты?", quiz.partnerName)
      : question.title;

  function persist(value: AnswerValue) {
    setDraft(value);
    dispatch({ type: "save-value", value });
  }

  function continueQuiz() {
    if (!filled || draft === undefined) return;
    dispatch({ type: "save-value", value: draft });
    if (isFinal) {
      setConfirmOpen(true);
      return;
    }
    dispatch({ type: "advance" });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-x-clip py-6">
        <ProgressBar value={progress} label={`Вопрос ${quiz.questionIndex + 1} из ${QUESTIONS.length}`} />
        <div key={stepKey} className={`flex flex-col gap-6 ${direction === "back" ? "step-back" : "step-forward"}`}>
          <div>
            <p className="text-sm tracking-[0.16em] text-accent uppercase">
              <span aria-hidden="true">{predicting ? "👀 " : "✍️ "}</span>
              {predicting ? "Про партнёра" : "Про тебя"}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-balance">{title}</h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              {title === question.title ? question.description : question.title}
            </p>
            {title !== question.title && question.description ? (
              <p className="mt-2 text-sm leading-relaxed text-muted">{question.description}</p>
            ) : null}
          </div>
          <QuestionView
            question={question}
            value={draft}
            selfName={quiz.selfName}
            partnerName={quiz.partnerName}
            onChange={persist}
          />
        </div>
      </div>
      <StickyBar>
        <div className="flex gap-3">
          <BackButton
            onClick={() => {
              setDirection("back");
              dispatch({ type: "back" });
            }}
          />
          <Button
            className="w-auto min-w-0 flex-1"
            disabled={!filled}
            onClick={() => {
              setDirection("forward");
              continueQuiz();
            }}
          >
            {isFinal ? "Завершить" : "Дальше"}
          </Button>
        </div>
      </StickyBar>
      <FinishDialog
        open={confirmOpen}
        player={quiz.player}
        onOpenChange={setConfirmOpen}
        onConfirm={() => {
          setConfirmOpen(false);
          dispatch({ type: "finish-player" });
          void navigate(quiz.player === "player1" ? "/handoff" : "/analyzing");
        }}
      />
    </div>
  );
}
