import { QuizFlow } from "@/widgets/quiz-flow";
import { usePlayerQuiz, useSessionActions } from "@/entities/session";
import { Button } from "@/shared/ui/button";
import { Screen } from "@/shared/ui/confirm-dialog";
import { EmojiMark } from "@/shared/ui/emoji-mark";
import { StickyBar } from "@/shared/ui/sticky-bar";

export function PlayerPage() {
  const quiz = usePlayerQuiz();
  const { dispatch } = useSessionActions();
  if (!quiz) return null;
  const intro = quiz.phase === "player1-intro" || quiz.phase === "player2-intro";
  if (!intro) return <QuizFlow />;

  const first = quiz.player === "player1";
  return (
    <div className="flex flex-1 flex-col">
      <Screen centered>
        <EmojiMark symbol={first ? "👀" : "🤫"} />
        <p className="mt-6 text-sm tracking-[0.18em] text-accent uppercase">{first ? quiz.selfName : "Второй заход"}</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight">
          {first ? "Сейчас отвечаешь ты." : "Теперь твоя очередь."}
        </h1>
        <p className="mt-4 max-w-sm text-lg leading-relaxed text-muted">
          {first
            ? "Партнёр увидит только итоговый результат. Не подглядывай."
            : "Отвечай честно. Партнёр уже ответил и пока ничего тебе не расскажет."}
        </p>
      </Screen>
      <StickyBar>
        <Button onClick={() => dispatch({ type: "begin-quiz" })}>Я готов(а)</Button>
      </StickyBar>
    </div>
  );
}
