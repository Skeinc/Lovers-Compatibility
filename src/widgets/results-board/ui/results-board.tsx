import { NewCoupleButton } from "@/features/reset-session";
import { RetryButton } from "@/features/retry-analysis";
import { ShareButton } from "@/features/share-result";
import type { ComparisonView } from "@/entities/session";

function SectionTitle({ emoji, children }: { emoji: string; children: string }) {
  return (
    <h2 className="font-serif text-3xl">
      <span className="mr-2" aria-hidden="true">
        {emoji}
      </span>
      {children}
    </h2>
  );
}

export function ResultsBoard({ view }: { view: ComparisonView }) {
  const report = view.report;
  if (!report) return null;
  const { couple, scoring } = view;
  const fallbackNote =
    view.fallbackReason === "missing-config"
      ? "AI пока не подключён. Но мы всё равно кое-что поняли."
      : view.reportSource === "fallback"
        ? "AI сейчас задумался слишком надолго. Но мы всё равно кое-что поняли."
        : null;

  return (
    <div className="results-rise flex flex-col gap-8 py-6">
      <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0_0_40px_rgba(214,180,138,0.08)]">
        <p className="text-xs tracking-[0.2em] text-accent uppercase">Lovers Compatibility</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight">
          {couple.player1.name} × {couple.player2.name}
        </h1>
        <p className="mt-6 text-sm tracking-[0.16em] text-accent uppercase">Архетип</p>
        <h2 className="mt-3 font-serif text-4xl leading-tight">{report.archetype.name}</h2>
        <p className="mt-3 text-base leading-relaxed text-muted">{report.archetype.description}</p>
        <p className="mt-4 text-base leading-relaxed text-foreground/90">{report.summary}</p>
        {scoring.total >= 75 ? (
          <p className="mt-6 font-serif text-3xl">
            {scoring.total}% <span className="text-xl text-muted">· {scoring.label}</span>
          </p>
        ) : null}
      </section>

      {fallbackNote ? (
        <section className="rounded-3xl border border-border bg-white/5 p-5">
          <p className="text-base leading-relaxed">{fallbackNote}</p>
          <div className="mt-4">
            <RetryButton />
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <SectionTitle emoji="💛">Что вас объединяет</SectionTitle>
        {report.strengths.map((card) => (
          <article key={card.title} className="rounded-3xl border border-border bg-card p-5">
            <h3 className="text-lg">{card.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-muted">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle emoji="⚡">Где вы расходитесь</SectionTitle>
        {report.differences.map((card) => (
          <article key={card.title} className="rounded-3xl border border-border bg-card p-5">
            <h3 className="text-lg">{card.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-muted">{card.description}</p>
          </article>
        ))}
      </section>

      {report.surprisingAnswers.length > 0 ? (
        <section className="flex flex-col gap-3">
          <SectionTitle emoji="🎁">Неожиданное</SectionTitle>
          {report.surprisingAnswers.map((card) => (
            <article key={card.title} className="rounded-3xl border border-border bg-card p-5">
              <h3 className="text-lg">{card.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted">{card.description}</p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <SectionTitle emoji="🎯">Кто скорее</SectionTitle>
        {report.likelyTo.length === 0 ? (
          <p className="text-base leading-relaxed text-muted">
            По этим ответам нельзя уверенно определить, кто скорее.
          </p>
        ) : (
          report.likelyTo.map((item) => (
            <article key={item.title} className="rounded-3xl border border-border bg-card p-5">
              <h3 className="text-base">{item.title}</h3>
              <p className="mt-2 font-serif text-3xl">{item.person}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.explanation}</p>
            </article>
          ))
        )}
      </section>

      <section className="rounded-[28px] border border-accent/40 bg-[#1a1612] p-6">
        <p className="text-sm tracking-[0.16em] text-accent uppercase">
          <span aria-hidden="true">🔥 </span>Лёгкий roast
        </p>
        <p className="mt-3 text-lg leading-relaxed">{report.roast}</p>
      </section>

      <section className="rounded-[28px] border border-border bg-card p-6">
        <p className="text-sm tracking-[0.16em] text-accent uppercase">
          <span aria-hidden="true">🤍 </span>Тёплое
        </p>
        <p className="mt-3 text-lg leading-relaxed">{report.positiveObservation}</p>
      </section>

      {report.achievements.length > 0 ? (
        <section className="flex flex-col gap-3">
          <SectionTitle emoji="🏆">Достижения</SectionTitle>
          {report.achievements.map((item) => (
            <article key={item.title} className="flex gap-4 rounded-3xl border border-border bg-card p-5">
              <span className="text-2xl" aria-hidden="true">
                {item.icon}
              </span>
              <div>
                <h3 className="text-lg">{item.title}</h3>
                <p className="mt-1 text-base leading-relaxed text-muted">{item.description}</p>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <section className="py-4 text-center">
        <p className="font-serif text-4xl leading-tight text-balance">{report.finalVerdict}</p>
      </section>

      <div className="flex flex-col gap-3 pb-8">
        <ShareButton
          player1={couple.player1.name}
          player2={couple.player2.name}
          total={scoring.total}
          label={scoring.label}
          archetype={report.archetype.name}
          verdict={report.finalVerdict}
        />
        <NewCoupleButton />
      </div>
    </div>
  );
}
