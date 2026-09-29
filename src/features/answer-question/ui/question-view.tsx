import { decodeWho, encodeWho, toggleMulti, type AnswerValue, type Question } from "@/entities/question";
import { ChoiceButton } from "@/shared/ui/choice-button";
import { TextArea } from "@/shared/ui/field";

export function QuestionView({
  question,
  value,
  selfName,
  partnerName,
  onChange,
}: {
  question: Question;
  value: AnswerValue | undefined;
  selfName: string;
  partnerName: string;
  onChange: (value: AnswerValue) => void;
}) {
  if (question.kind === "text" || question.kind === "text-predict") {
    return (
      <TextArea
        aria-label={question.title}
        enterKeyHint="done"
        placeholder={question.placeholder}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (question.kind === "who-likely") {
    const selected = decodeWho(value);
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          {selfName} отмечает себя, {partnerName} или что это поровну.
        </p>
        {(question.scenarios ?? []).map((scenario) => {
          const choice = selected.get(scenario.id);
          return (
            <fieldset key={scenario.id} className="rounded-2xl border border-border bg-card p-4">
              <legend className="px-1 text-base text-foreground">{scenario.prompt}</legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <ChoiceButton
                  selected={choice === "self"}
                  onClick={() => {
                    const next = new Map(selected);
                    next.set(scenario.id, "self");
                    onChange(encodeWho(next));
                  }}
                >
                  Я
                </ChoiceButton>
                <ChoiceButton
                  selected={choice === "partner"}
                  onClick={() => {
                    const next = new Map(selected);
                    next.set(scenario.id, "partner");
                    onChange(encodeWho(next));
                  }}
                >
                  Партнёр
                </ChoiceButton>
                <ChoiceButton
                  selected={choice === "even"}
                  onClick={() => {
                    const next = new Map(selected);
                    next.set(scenario.id, "even");
                    onChange(encodeWho(next));
                  }}
                >
                  Поровну
                </ChoiceButton>
              </div>
            </fieldset>
          );
        })}
      </div>
    );
  }

  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const max = question.maxSelections;
  return (
    <div className="flex flex-col gap-3" role="group" aria-label={question.title}>
      {max !== undefined ? (
        <p className="text-sm text-muted">
          Выбрано {selected.length} из {max}
        </p>
      ) : null}
      {(question.options ?? []).map((option) => (
        <ChoiceButton
          key={option.id}
          selected={selected.includes(option.id)}
          onClick={() => {
            if (question.kind === "multi" || question.kind === "multi-predict") {
              onChange(toggleMulti(selected, option.id, option.exclusive === true, max));
              return;
            }
            onChange(option.id);
          }}
        >
          {option.label}
        </ChoiceButton>
      ))}
    </div>
  );
}
