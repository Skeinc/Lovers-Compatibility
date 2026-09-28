import { NewCoupleButton } from "@/features/reset-session";
import { RetryButton } from "@/features/retry-analysis";
import { ShareButton } from "@/features/share-result";
import { toAccusative } from "@/shared/lib/ru-name";
import type { ComparisonView } from "@/entities/session";

function SectionTitle({ children }: { children: string }) {
  return <h2 className="font-serif text-3xl">{children}</h2>;
}

export function ResultsBoard({ view }: { view: ComparisonView }) {
  const report = view.report;
  if (!report) return null;
  const { couple, scoring, predictions } = view;
  const fallbackNote =
    view.fallbackReason === "missing-config"
      ? "AI пока не подключён. Но мы всё равно кое-что поняли."
      : view.reportSource === "fallback"
        ? "AI сейчас задумался слишком надолго. Но мы всё равно кое-что поняли."
        : null;

  return (
    <div className="flex flex-col gap-8 py-6">
      <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0_0_40px_rgba(214,180,138,0.08)]">
        <p className="text-xs tracking-[0.2em] text-accent uppercase">Lovers Compatibility</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight">
          {couple.player1.name} × {couple.player2.name}
        </h1>
        <p className="mt-4 font-serif text-7xl leading-none">{scoring.total}%</p>
        <p className="mt-3 text-lg">{scoring.label}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Процент — развлекательный показатель, рассчитанный на основе ваших ответов. Это не психологическая оценка и не
          научный тест.
        </p>
      </section>

      {fallbackNote ? (
        <section className="rounded-3xl border border-border bg-white/5 p-5">
          <p className="text-base leading-relaxed">{fallbackNote}</p>
          <div className="mt-4">
            <RetryButton />
          </div>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-accent/30 bg-accent/10 p-6">
        <p className="text-sm tracking-[0.16em] text-accent uppercase">Архетип</p>
        <h2 className="mt-3 font-serif text-4xl leading-tight">{report.archetype.name}</h2>
        <p className="mt-3 text-base leading-relaxed text-muted">{report.archetype.description}</p>
      </section>

      <section>
        <SectionTitle>Коротко о вас</SectionTitle>
        <p className="mt-3 text-base leading-relaxed text-foreground/90">{report.summary}</p>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Что вас объединяет</SectionTitle>
        {report.strengths.map((card) => (
          <article key={card.title} className="rounded-3xl border border-border bg-card p-5">
            <h3 className="text-lg">{card.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-muted">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Где вы расходитесь</SectionTitle>
        {report.differences.map((card) => (
          <article key={card.title} className="rounded-3xl border border-border bg-card p-5">
            <h3 className="text-lg">{card.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-muted">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-border p-6">
        <SectionTitle>Насколько хорошо вы считываете друг друга</SectionTitle>
        <dl className="mt-5 flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <dt>
              {couple.player1.name} → {toAccusative(couple.player2.name)}
            </dt>
            <dd className="font-serif text-3xl">{predictions.player1Percent}%</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt>
              {couple.player2.name} → {toAccusative(couple.player1.name)}
            </dt>
            <dd className="font-serif text-3xl">{predictions.player2Percent}%</dd>
          </div>
        </dl>
        <p className="mt-4 text-base leading-relaxed text-muted">{report.partnerKnowledge.explanation}</p>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Неожиданное</SectionTitle>
        {report.surprisingAnswers.map((card) => (
          <article key={card.title} className="rounded-3xl border border-border bg-card p-5">
            <h3 className="text-lg">{card.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-muted">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Кто скорее</SectionTitle>
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
        <p className="text-sm tracking-[0.16em] text-accent uppercase">Лёгкий roast</p>
        <p className="mt-3 text-lg leading-relaxed">{report.roast}</p>
      </section>

      <section className="rounded-[28px] border border-border bg-card p-6">
        <p className="text-sm tracking-[0.16em] text-accent uppercase">Тёплое</p>
        <p className="mt-3 text-lg leading-relaxed">{report.positiveObservation}</p>
      </section>

      {report.achievements.length > 0 ? (
        <section className="flex flex-col gap-3">
          <SectionTitle>Достижения</SectionTitle>
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
