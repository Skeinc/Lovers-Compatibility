import { evaluateCompatibility, type Evaluation, type GuessMoment } from "@/entities/compatibility";
import { NewCoupleButton } from "@/features/reset-session";
import { RetryButton } from "@/features/retry-analysis";
import { ShareButton } from "@/features/share-result";
import type { ComparisonView } from "@/entities/session";

function SectionTitle({ children }: { children: string }) {
  return <h2 className="font-serif text-3xl">{children}</h2>;
}

function Meter({ value, total }: { value: number; total: number }) {
  const width = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
      <div className="h-full rounded-full bg-accent" style={{ width: `${width}%` }} />
    </div>
  );
}

function MomentCard({ eyebrow, moment }: { eyebrow: string; moment: GuessMoment }) {
  return (
    <article className="rounded-3xl border border-border bg-card p-5">
      <p className="text-sm tracking-[0.16em] text-accent uppercase">{eyebrow}</p>
      <p className="mt-3 text-base leading-relaxed">
        {moment.guesser} думал: «{moment.expected}».
      </p>
      <p className="mt-2 text-base leading-relaxed text-muted">
        {moment.chooser} выбрал: «{moment.chosen}».
      </p>
    </article>
  );
}

function ChoicePair({
  title,
  leftName,
  rightName,
  left,
  right,
}: {
  title: string;
  leftName: string;
  rightName: string;
  left: string;
  right: string;
}) {
  return (
    <article className="rounded-3xl border border-border bg-card p-5">
      <h3 className="text-lg">{title}</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm text-accent">{leftName}</p>
          <p className="mt-1 text-base leading-relaxed">{left || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-accent">{rightName}</p>
          <p className="mt-1 text-base leading-relaxed">{right || "—"}</p>
        </div>
      </div>
    </article>
  );
}

export function ResultsBoard({ view }: { view: ComparisonView }) {
  const report = view.report;
  if (!report) return null;
  const { couple } = view;
  const evaluation: Evaluation = evaluateCompatibility({
    player1Name: couple.player1.name,
    player2Name: couple.player2.name,
    player1: view.player1Answers,
    player2: view.player2Answers,
  });
  const fallbackNote =
    view.fallbackReason === "missing-config"
      ? "AI пока не подключён. Цифры и карточки ниже посчитаны на телефоне."
      : view.reportSource === "fallback"
        ? "AI сейчас задумался слишком надолго. Цифры на месте, текст собран из ваших ответов."
        : null;
  const similar = evaluation.themes.filter((theme) => theme.similar);
  const different = evaluation.themes.filter((theme) => !theme.similar);
  const { reading } = evaluation;

  return (
    <div className="results-rise flex flex-col gap-8 py-6">
      <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0_0_40px_rgba(214,180,138,0.08)]">
        <p className="text-xs tracking-[0.2em] text-accent uppercase">Lovers Compatibility</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight">
          {couple.player1.name} × {couple.player2.name}
        </h1>
        <p className="mt-6 font-serif text-5xl">{evaluation.scoring.total}%</p>
        <p className="mt-2 text-base text-foreground/90">совпадение по вашим ответам</p>
        <p className="mt-2 text-sm text-muted">Игровая метрика на основе ваших ответов.</p>
        <p className="mt-6 text-sm tracking-[0.16em] text-accent uppercase">Роль пары</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight">{report.roleName}</h2>
        <p className="mt-4 text-base leading-relaxed text-foreground/90">{report.insight}</p>
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
        <SectionTitle>Насколько вы угадываете ответы друг друга</SectionTitle>
        <article className="rounded-3xl border border-border bg-card p-5">
          <p className="text-base">
            {reading.player1.guesser} → {reading.player1.target}
          </p>
          <p className="mt-1 font-serif text-3xl">
            {reading.player1.hits}/{reading.player1.total}
          </p>
          <Meter value={reading.player1.hits} total={reading.player1.total} />
          <p className="mt-5 text-base">
            {reading.player2.guesser} → {reading.player2.target}
          </p>
          <p className="mt-1 font-serif text-3xl">
            {reading.player2.hits}/{reading.player2.total}
          </p>
          <Meter value={reading.player2.hits} total={reading.player2.total} />
        </article>
        {reading.bestHit ? <MomentCard eyebrow="Самое точное попадание" moment={reading.bestHit} /> : null}
        {reading.worstMiss ? <MomentCard eyebrow="Самый заметный промах" moment={reading.worstMiss} /> : null}
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Ваша пара по версии теста</SectionTitle>
        <p className="text-sm text-muted">Игровая интерпретация ответов, а не психологическая оценка.</p>
        <article className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm tracking-[0.16em] text-accent uppercase">Green</p>
          <p className="mt-2 text-sm text-muted">Что вы особенно цените друг в друге</p>
          <ul className="mt-3 flex flex-col gap-2">
            {evaluation.traffic.green.map((item) => (
              <li key={item} className="text-base">
                {item}
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm tracking-[0.16em] text-accent uppercase">Interesting</p>
          <p className="mt-2 text-sm text-muted">Где ваши представления расходятся</p>
          {evaluation.traffic.interesting.length === 0 ? (
            <p className="mt-3 text-base">В деньгах, переезде, семье и ценностях ответы легли рядом.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {evaluation.traffic.interesting.map((item) => (
                <li key={item} className="text-base">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </article>
        {evaluation.traffic.spicy ? (
          <article className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm tracking-[0.16em] text-accent uppercase">Spicy</p>
            <p className="mt-2 text-sm text-muted">
              {evaluation.traffic.spicy.expected === evaluation.traffic.spicy.chosen
                ? "На чём сошлись"
                : "Самое неожиданное расхождение"}
            </p>
            <p className="mt-3 text-base leading-relaxed">
              {evaluation.traffic.spicy.guesser} думал: «{evaluation.traffic.spicy.expected}».
            </p>
            <p className="mt-2 text-base leading-relaxed text-muted">
              {evaluation.traffic.spicy.chooser} выбрал: «{evaluation.traffic.spicy.chosen}».
            </p>
          </article>
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Кто оказывается за штурвалом</SectionTitle>
        <p className="text-base leading-relaxed">{evaluation.helm.line}</p>
        {evaluation.helm.scenes.map((scene) => (
          <article
            key={scene.id}
            className="flex items-baseline justify-between gap-4 rounded-3xl border border-border bg-card p-5"
          >
            <h3 className="text-base">{scene.title}</h3>
            <p className="shrink-0 font-serif text-2xl">{scene.label}</p>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Деньги</SectionTitle>
        <p className="text-sm text-muted">Это не прогноз доходов. Это то, как вы представляете себя и партнёра.</p>
        <ChoicePair
          title="100 000 ₽"
          leftName={couple.player1.name}
          rightName={couple.player2.name}
          left={evaluation.money.surprise.player1}
          right={evaluation.money.surprise.player2}
        />
        <ChoicePair
          title="Кто будет зарабатывать больше через 10 лет"
          leftName={couple.player1.name}
          rightName={couple.player2.name}
          left={evaluation.money.earnings.player1}
          right={evaluation.money.earnings.player2}
        />
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Через 10 лет</SectionTitle>
        <ChoicePair
          title="Семья"
          leftName={couple.player1.name}
          rightName={couple.player2.name}
          left={evaluation.futureFamily.player1}
          right={evaluation.futureFamily.player2}
        />
        <article className="rounded-3xl border border-border bg-card p-5">
          <h3 className="text-lg">Три ценности</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ValueColumn
              name={couple.player1.name}
              items={evaluation.values.player1}
              shared={evaluation.values.shared}
            />
            <ValueColumn
              name={couple.player2.name}
              items={evaluation.values.player2}
              shared={evaluation.values.shared}
            />
          </div>
        </article>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Карта расхождений</SectionTitle>
        <ThemeGroup title="Похожи" themes={similar} />
        <ThemeGroup title="По-разному" themes={different} />
      </section>

      <section className="rounded-[28px] border border-border bg-card p-6">
        <p className="text-sm tracking-[0.16em] text-accent uppercase">Главный парадокс</p>
        <p className="mt-3 text-lg leading-relaxed">{report.paradox}</p>
      </section>

      <section className="rounded-[28px] border border-accent/40 bg-[#1a1612] p-6">
        <p className="text-sm tracking-[0.16em] text-accent uppercase">Вопрос, который стоит обсудить</p>
        <p className="mt-3 text-lg leading-relaxed">{report.discussQuestion}</p>
      </section>

      <section className="rounded-[28px] border border-border bg-card p-6">
        <p className="text-sm tracking-[0.16em] text-accent uppercase">Если собрать ответы в одну сцену</p>
        <p className="mt-3 text-lg leading-relaxed whitespace-pre-line">{report.finalScene}</p>
      </section>

      <div className="flex flex-col gap-3 pb-8">
        <ShareButton
          player1={couple.player1.name}
          player2={couple.player2.name}
          total={evaluation.scoring.total}
          roleName={report.roleName}
          insight={report.insight}
        />
        <NewCoupleButton />
      </div>
    </div>
  );
}

function ValueColumn({ name, items, shared }: { name: string; items: string[]; shared: string[] }) {
  const sharedSet = new Set(shared);
  return (
    <div>
      <p className="text-sm text-accent">{name}</p>
      <ul className="mt-2 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className={sharedSet.has(item) ? "text-base text-foreground" : "text-base text-muted"}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ThemeGroup({ title, themes }: { title: string; themes: Evaluation["themes"] }) {
  return (
    <article className="rounded-3xl border border-border bg-card p-5">
      <h3 className="font-serif text-2xl">{title}</h3>
      {themes.length === 0 ? (
        <p className="mt-3 text-base text-muted">Здесь пусто.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {themes.map((theme) => (
            <li key={theme.id} className="text-base">
              {theme.label}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
