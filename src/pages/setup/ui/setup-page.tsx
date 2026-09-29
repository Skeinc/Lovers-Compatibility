import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  ageSchema,
  coupleProfileSchema,
  DURATION_OPTIONS,
  GOAL_OPTIONS,
  HOW_MET_LABELS,
  personNameSchema,
  type CoupleDraft,
  type CoupleProfile,
} from "@/entities/couple";
import { useCoupleDraft } from "@/entities/session";
import { BackButton } from "@/shared/ui/back-button";
import { Button } from "@/shared/ui/button";
import { ChoiceButton } from "@/shared/ui/choice-button";
import { FieldLabel, TextArea, TextInput } from "@/shared/ui/field";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { StickyBar } from "@/shared/ui/sticky-bar";

const STEPS = ["Имена", "Срок", "Знакомство", "Цели"] as const;

function focusNextOnEnter(event: KeyboardEvent<HTMLInputElement>, nextId: string) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  document.getElementById(nextId)?.focus();
}

function blurOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  event.currentTarget.blur();
}

function firstIssue(error: { issues: Array<{ message: string }> }): string {
  return error.issues[0]?.message ?? "Проверьте поле";
}

function personError(name: string, age: string): string | null {
  const parsedName = personNameSchema.safeParse(name);
  if (!parsedName.success) return firstIssue(parsedName.error);
  const parsedAge = ageSchema.safeParse(Number(age));
  if (!parsedAge.success) return firstIssue(parsedAge.error);
  return null;
}

function buildCouple(draft: CoupleDraft): CoupleProfile {
  const couple: CoupleProfile = {
    player1: { name: draft.player1Name.trim(), age: Number(draft.player1Age) },
    player2: { name: draft.player2Name.trim(), age: Number(draft.player2Age) },
    relationshipDuration: draft.relationshipDuration === "" ? "lt-3m" : draft.relationshipDuration,
    howMet: draft.howMet === "" ? "friends" : draft.howMet,
    goals: draft.goals,
  };
  if (draft.relationshipDuration === "custom") {
    couple.customDuration = {
      years: Number(draft.customYears || "0"),
      months: Number(draft.customMonths || "0"),
    };
  }
  const details = draft.howMetDetails.trim();
  if (details) couple.howMetDetails = details;
  const other = draft.goalsOther.trim();
  if (other) couple.goalsOther = other;
  return couple;
}

export function SetupPage() {
  const { draft, setupStep, dispatch } = useCoupleDraft();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const step = Math.min(setupStep, 4);

  function update(next: CoupleDraft, nextStep = step) {
    dispatch({ type: "set-draft", draft: next, setupStep: nextStep });
  }

  function validate(current: number): string | null {
    if (current === 0) return personError(draft.player1Name, draft.player1Age);
    if (current === 1) return personError(draft.player2Name, draft.player2Age);
    if (current === 2) {
      if (draft.relationshipDuration === "") return "Выберите, сколько вы вместе";
      if (draft.relationshipDuration === "custom") {
        const years = Number(draft.customYears || "0");
        const months = Number(draft.customMonths || "0");
        if (!Number.isInteger(years) || !Number.isInteger(months) || years < 0 || months < 0 || months > 11) {
          return "Годы — целое число, месяцы от 0 до 11";
        }
        if (years === 0 && months === 0) return "Укажите годы или месяцы";
      }
    }
    if (current === 3 && draft.howMet === "") return "Выберите, как вы познакомились";
    if (current === 4) {
      if (draft.goals.length === 0) return "Выберите хотя бы одно";
      if (draft.goals.includes("other") && draft.goalsOther.trim().length < 2) return "Коротко напишите, что именно";
    }
    return null;
  }

  function next() {
    const message = validate(step);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    if (step < 4) {
      setDirection("forward");
      update(draft, step + 1);
      return;
    }
    const parsed = coupleProfileSchema.safeParse(buildCouple(draft));
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }
    dispatch({ type: "finish-setup", couple: parsed.data });
    void navigate("/player/1");
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-x-clip py-6">
        <ProgressBar value={((step + 1) / 5) * 100} label={`Шаг ${step + 1} из 5`} />
        <div key={step} className={`flex flex-col gap-6 ${direction === "back" ? "step-back" : "step-forward"}`}>
          {step === 0 ? (
            <PersonStep
              kicker="Партнёр 1"
              title="С кого начнём?"
              name={draft.player1Name}
              age={draft.player1Age}
              onName={(player1Name) => update({ ...draft, player1Name })}
              onAge={(player1Age) => update({ ...draft, player1Age })}
            />
          ) : null}
          {step === 1 ? (
            <PersonStep
              kicker="Партнёр 2"
              title="И второй человек"
              name={draft.player2Name}
              age={draft.player2Age}
              onName={(player2Name) => update({ ...draft, player2Name })}
              onAge={(player2Age) => update({ ...draft, player2Age })}
            />
          ) : null}
          {step === 2 ? (
            <section>
              <p className="text-sm tracking-[0.16em] text-accent uppercase">Отношения</p>
              <h1 className="mt-3 font-serif text-4xl">Как давно вы вместе?</h1>
              <div className="mt-5 flex flex-col gap-3">
                {DURATION_OPTIONS.map((option) => (
                  <ChoiceButton
                    key={option.id}
                    selected={draft.relationshipDuration === option.id}
                    onClick={() => update({ ...draft, relationshipDuration: option.id })}
                  >
                    {option.label}
                  </ChoiceButton>
                ))}
              </div>
              {draft.relationshipDuration === "custom" ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel htmlFor="years">Лет</FieldLabel>
                    <TextInput
                      id="years"
                      inputMode="numeric"
                      enterKeyHint="next"
                      value={draft.customYears}
                      onChange={(event) => update({ ...draft, customYears: event.target.value })}
                      onKeyDown={(event) => focusNextOnEnter(event, "months")}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="months">Месяцев</FieldLabel>
                    <TextInput
                      id="months"
                      inputMode="numeric"
                      enterKeyHint="done"
                      value={draft.customMonths}
                      onChange={(event) => update({ ...draft, customMonths: event.target.value })}
                      onKeyDown={blurOnEnter}
                    />
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
          {step === 3 ? (
            <section>
              <p className="text-sm tracking-[0.16em] text-accent uppercase">История</p>
              <h1 className="mt-3 font-serif text-4xl">Как вы познакомились?</h1>
              <div className="mt-5 flex flex-col gap-3">
                {HOW_MET_LABELS.map((option) => (
                  <ChoiceButton
                    key={option.id}
                    selected={draft.howMet === option.id}
                    onClick={() => update({ ...draft, howMet: option.id })}
                  >
                    {option.label}
                  </ChoiceButton>
                ))}
              </div>
              <div className="mt-4">
                <FieldLabel htmlFor="met">Ваша версия в одном предложении</FieldLabel>
                <TextArea
                  id="met"
                  placeholder="Необязательно"
                  value={draft.howMetDetails}
                  onChange={(event) => update({ ...draft, howMetDetails: event.target.value })}
                />
              </div>
            </section>
          ) : null}
          {step === 4 ? (
            <section>
              <p className="text-sm tracking-[0.16em] text-accent uppercase">Сейчас</p>
              <h1 className="mt-3 font-serif text-4xl">Что вам сейчас важнее всего как паре?</h1>
              <p className="mt-3 text-base text-muted">
                Можно несколько. На процент это почти не влияет — пригодится разбору.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                {GOAL_OPTIONS.map((option) => (
                  <ChoiceButton
                    key={option.id}
                    selected={draft.goals.includes(option.id)}
                    onClick={() => {
                      const goals = draft.goals.includes(option.id)
                        ? draft.goals.filter((goal) => goal !== option.id)
                        : [...draft.goals, option.id];
                      update({ ...draft, goals });
                    }}
                  >
                    {option.label}
                  </ChoiceButton>
                ))}
              </div>
              {draft.goals.includes("other") ? (
                <div className="mt-4">
                  <FieldLabel htmlFor="goal-other">Что именно</FieldLabel>
                  <TextInput
                    id="goal-other"
                    value={draft.goalsOther}
                    onChange={(event) => update({ ...draft, goalsOther: event.target.value })}
                  />
                </div>
              ) : null}
            </section>
          ) : null}
          {error ? (
            <p className="text-sm text-[#e7c2b0]" role="alert">
              {error}
            </p>
          ) : null}
          <p className="sr-only">{STEPS[Math.min(step, 3)]}</p>
        </div>
      </div>
      <StickyBar>
        <div className="flex gap-3">
          {step > 0 ? (
            <BackButton
              onClick={() => {
                setError(null);
                setDirection("back");
                update(draft, step - 1);
              }}
            />
          ) : null}
          <Button className="w-auto min-w-0 flex-1" onClick={next}>
            {step === 4 ? "К первому игроку" : "Дальше"}
          </Button>
        </div>
      </StickyBar>
    </div>
  );
}

function PersonStep({
  kicker,
  title,
  name,
  age,
  onName,
  onAge,
}: {
  kicker: string;
  title: string;
  name: string;
  age: string;
  onName: (value: string) => void;
  onAge: (value: string) => void;
}) {
  const nameId = `${kicker}-name`;
  const ageId = `${kicker}-age`;
  return (
    <section>
      <p className="text-sm tracking-[0.16em] text-accent uppercase">{kicker}</p>
      <h1 className="mt-3 font-serif text-4xl">{title}</h1>
      <div className="mt-5">
        <FieldLabel htmlFor={nameId}>Имя</FieldLabel>
        <TextInput
          id={nameId}
          autoComplete="given-name"
          enterKeyHint="next"
          value={name}
          onChange={(event) => onName(event.target.value)}
          onKeyDown={(event) => focusNextOnEnter(event, ageId)}
        />
      </div>
      <div className="mt-4">
        <FieldLabel htmlFor={ageId}>Возраст</FieldLabel>
        <TextInput
          id={ageId}
          inputMode="numeric"
          enterKeyHint="done"
          autoComplete="off"
          value={age}
          onChange={(event) => onAge(event.target.value.replace(/[^\d]/g, "").slice(0, 2))}
          onKeyDown={blurOnEnter}
        />
      </div>
    </section>
  );
}
