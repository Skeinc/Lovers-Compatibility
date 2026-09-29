import { useRef } from "react";
import {
  Bar,
  BarChart,
  Rectangle,
  ResponsiveContainer,
  XAxis,
  YAxis,
  type BarShapeProps,
  type YAxisTickContentProps,
} from "recharts";

import {
  evaluateCompatibility,
  PREDICTION_QUESTION_IDS,
  type Evaluation,
  type GuessMoment,
} from "@/entities/compatibility";
import { getQuestion } from "@/entities/question";
import { buildDecade, buildMirror, buildValuesReading, buildXray } from "@/entities/report";
import { NewCoupleButton } from "@/features/reset-session";
import { RetryButton } from "@/features/retry-analysis";
import { ShareButton } from "@/features/share-result";
import type { ComparisonView } from "@/entities/session";

const ROLE_GLOSS: Record<string, string> = {
  инициатор: "Чаще предлагает следующий шаг.",
  стабилизатор: "Держит ритм, когда шаг уже сделан.",
  дальновидный: "Смотрит дальше одного ближайшего решения.",
  "два двигателя": "Инициативу держите вдвоём.",
};

function describeRole(role: string, notes: string[] | undefined, index: number): string {
  const fromReport = notes?.[index]?.trim();
  if (fromReport) return fromReport;
  return ROLE_GLOSS[role.trim().toLocaleLowerCase("ru")] ?? "Эта роль собрана из нескольких ответов сразу.";
}
const ACCENT = "#d6b48a";
const CREAM = "#f4efe8";
const EVEN = "#7f97b0";
const MUTED = "#a39b94";
const DIM = "rgba(244, 239, 232, 0.35)";

function inScenes(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const word = mod10 === 1 && mod100 !== 11 ? "сцене" : "сценах";
  return `${count} ${word}`;
}

function helmRest(disputes: number, even: number): string {
  if (disputes === 0 && even === 0) return "";
  if (disputes === 0) return " В остальных сценах вы сказали «поровну».";
  if (even === 0) return ` В ${inScenes(disputes)} вы назвали разных людей.`;
  return ` В ${inScenes(even)} вы сказали «поровну», в ${inScenes(disputes)} назвали разных людей.`;
}

function SectionTitle({ children, center = false }: { children: string; center?: boolean }) {
  return <h2 className={`font-serif text-3xl ${center ? "text-center" : ""}`}>{children}</h2>;
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
      <p className="mt-3 text-sm leading-relaxed text-muted">{moment.title}</p>
      <p className="mt-3 text-base leading-relaxed">
        {moment.guesser} думал: «{moment.expected}».
      </p>
      <p className="mt-2 text-base leading-relaxed text-muted">
        {moment.chooser} выбрал: «{moment.chosen}».
      </p>
    </article>
  );
}

function MoneyPair({
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
  const same = left !== "" && left === right;
  return (
    <article className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg leading-snug">{title}</h3>
        {same ? <p className="shrink-0 text-sm text-accent">совпало</p> : null}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {[
          { name: leftName, value: left },
          { name: rightName, value: right },
        ].map((row) => (
          <div key={row.name} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <p className="text-sm text-accent">{row.name}</p>
            <p className="mt-1 text-lg leading-snug">{row.value || "—"}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function guessDots(guesser: string, reading: Evaluation["reading"]) {
  const hits = new Set(reading.hits.filter((item) => item.guesser === guesser).map((item) => item.questionId));
  return PREDICTION_QUESTION_IDS.map((id) => ({ id, hit: hits.has(id) }));
}

function ReadColumn({
  name,
  hits,
  total,
  dots,
}: {
  name: string;
  hits: number;
  total: number;
  dots: { id: string; hit: boolean }[];
}) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-sm tracking-[0.14em] text-muted uppercase">{name}</p>
      <p className="mt-2 font-serif text-5xl">{hits}</p>
      <p className="text-sm text-muted">из {total}</p>
      <Meter value={hits} total={total} />
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {dots.map((dot) => (
          <span
            key={dot.id}
            className={`h-2.5 w-2.5 rounded-full ${dot.hit ? "bg-[#9dcead]" : "bg-[#e0b15a]"}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

function SceneLabel({ outcome, label }: { outcome: "player1" | "player2" | "split" | "even"; label: string }) {
  const color = outcome === "player1" ? ACCENT : outcome === "player2" ? CREAM : outcome === "even" ? EVEN : undefined;
  return (
    <p className="shrink-0 font-serif text-2xl" style={color ? { color } : undefined}>
      {label}
    </p>
  );
}

function SteerTrack({
  name,
  points,
  fill,
  nameColor = fill,
}: {
  name: string;
  points: number;
  fill: string;
  nameColor?: string;
}) {
  return (
    <div className="min-w-0 flex-1 text-center">
      <p className="text-sm tracking-[0.14em] uppercase" style={{ color: nameColor }}>
        {name}
      </p>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${(points / 8) * 100}%`, background: fill }} />
      </div>
      <p className="mt-3 font-serif text-4xl">{points}</p>
    </div>
  );
}

function DomainAxis({ domains }: { domains: { id: string; label: string; score: number; reason?: string }[] }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between text-xs tracking-[0.16em] text-muted uppercase">
        <span>Похожи</span>
        <span>Разные</span>
      </div>
      {domains.map((domain) => (
        <div key={domain.id}>
          <p className="text-sm">{domain.label}</p>
          <div className="relative mt-2 h-3">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_rgba(214,180,138,0.7)]"
              style={{ left: `clamp(0px, calc(${(1 - domain.score) * 100}% - 6px), calc(100% - 12px))` }}
            />
          </div>
          {domain.reason ? <p className="mt-2 text-sm leading-relaxed text-muted">{domain.reason}</p> : null}
        </div>
      ))}
    </div>
  );
}

function valueBarShape(sharedFill: string, soloFill: string) {
  return function ValueBar(props: BarShapeProps) {
    const shared = props.payload?.shared === true;
    return (
      <Rectangle
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        radius={6}
        fill={shared ? sharedFill : soloFill}
      />
    );
  };
}

const player1ValueBar = valueBarShape(ACCENT, "rgba(214, 180, 138, 0.4)");
const player2ValueBar = valueBarShape(CREAM, DIM);

function ValuesChart({ evaluation, player1, player2 }: { evaluation: Evaluation; player1: string; player2: string }) {
  const options = getQuestion("future-values")?.options ?? [];
  const data = options.map((option) => {
    const left = evaluation.values.player1Ids.includes(option.id) ? 1 : 0;
    const right = evaluation.values.player2Ids.includes(option.id) ? 1 : 0;
    return { label: option.label, player1: left, player2: right, shared: left === 1 && right === 1 };
  });
  const sharedLabels = new Set(data.filter((row) => row.shared).map((row) => row.label));
  return (
    <div className="mt-2 h-[340px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 4, bottom: 0 }}
          barGap={3}
          barCategoryGap={14}
        >
          <XAxis type="number" domain={[0, 1]} hide />
          <YAxis
            type="category"
            dataKey="label"
            width={108}
            axisLine={false}
            tickLine={false}
            tick={(props: YAxisTickContentProps) => {
              const label = String(props.payload.value ?? "");
              const shared = sharedLabels.has(label);
              return (
                <text
                  x={Number(props.x)}
                  y={Number(props.y)}
                  dy={4}
                  textAnchor="end"
                  fill={shared ? CREAM : MUTED}
                  fontSize={12}
                  fontWeight={shared ? 600 : 400}
                >
                  {label}
                </text>
              );
            }}
          />
          <Bar
            dataKey="player1"
            name={player1}
            barSize={7}
            shape={player1ValueBar}
            background={{ fill: "rgba(214, 180, 138, 0.12)", radius: 6 }}
          />
          <Bar
            dataKey="player2"
            name={player2}
            barSize={7}
            shape={player2ValueBar}
            background={{ fill: "rgba(244, 239, 232, 0.08)", radius: 6 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ResultsBoard({ view }: { view: ComparisonView }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const report = view.report;
  if (!report) return null;
  const { couple } = view;
  const evaluation = evaluateCompatibility({
    player1Name: couple.player1.name,
    player2Name: couple.player2.name,
    player1: view.player1Answers,
    player2: view.player2Answers,
  });
  const fallbackNote =
    view.reportSource === "fallback" ? "Текст связей собран на телефоне. Графики посчитаны по вашим ответам." : null;
  const { reading, helm } = evaluation;
  const mirror = report.mirror ?? buildMirror(evaluation, couple.player1.name, couple.player2.name);
  const settled = helm.scenes.filter((scene) => scene.outcome !== "split");
  const disputed = helm.scenes.filter((scene) => scene.outcome === "split");
  const xray = report.xray ?? buildXray(evaluation, couple.player1.name, couple.player2.name);
  const axis = evaluation.domains.map((domain) => {
    const item = xray.find((entry) => entry.id === domain.id);
    return { id: domain.id, label: domain.label, score: item?.score ?? domain.score, reason: item?.reason };
  });
  const sameWave = axis.every((domain) => domain.score >= 0.5);
  const roles = report.roleName
    .split(/\s*\+\s*/)
    .map((role) => role.trim())
    .filter((role) => role !== "");
  const roleNames =
    roles.length > 1 ? [couple.player1.name, couple.player2.name] : [`${couple.player1.name} × ${couple.player2.name}`];
  const player1Dots = guessDots(couple.player1.name, reading);
  const player2Dots = guessDots(couple.player2.name, reading);

  return (
    <div className="results-rise flex min-w-0 flex-col gap-8 overflow-x-hidden py-6">
      <div ref={sheetRef} className="flex flex-col gap-8 bg-[#0c0b0f]">
        <section className="text-center">
          <p className="text-xs tracking-[0.22em] text-accent uppercase">Lovers Compatibility</p>
          <h1 className="mt-4 font-serif text-4xl tracking-wide uppercase">
            {couple.player1.name} × {couple.player2.name}
          </h1>
          <article className="mt-6 rounded-[28px] border border-border bg-card px-6 py-10 shadow-[0_0_40px_rgba(214,180,138,0.08)]">
            <p className="font-serif text-4xl leading-tight tracking-wide uppercase">{report.verdict}</p>
            <p className="mt-5 text-base leading-relaxed text-foreground/90">{report.insight}</p>
          </article>
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
          <SectionTitle center>Как вы читаете друг друга</SectionTitle>
          <article className="rounded-3xl border border-border bg-card p-5">
            <div className="grid grid-cols-2 gap-4">
              <ReadColumn
                name={couple.player1.name}
                hits={reading.player1.hits}
                total={reading.player1.total}
                dots={player1Dots}
              />
              <ReadColumn
                name={couple.player2.name}
                hits={reading.player2.hits}
                total={reading.player2.total}
                dots={player2Dots}
              />
            </div>
            <p className="mt-4 text-center text-sm text-muted">Зелёная точка — попадание, жёлтая — промах.</p>
          </article>
          {reading.worstMiss ? <MomentCard eyebrow="Самая неожиданная ошибка" moment={reading.worstMiss} /> : null}
          {reading.bestHit ? <MomentCard eyebrow="Самое точное попадание" moment={reading.bestHit} /> : null}
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle center>Ваши роли</SectionTitle>
          <div className={`grid gap-3 ${roles.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {roles.map((role, index) => (
              <article key={`${role}-${index}`} className="rounded-3xl border border-border bg-card p-5 text-center">
                <p className="text-sm tracking-[0.14em] text-accent uppercase">{roleNames[index] ?? roleNames[0]}</p>
                <p className="mt-3 font-serif text-3xl leading-tight">{role}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{describeRole(role, report.roleNotes, index)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle>Как вы видите друг друга</SectionTitle>
          <article className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5">
            <div className="rounded-2xl border border-[#9dcead]/40 bg-[#9dcead]/10 p-4">
              <p className="text-xs tracking-[0.16em] text-[#9dcead] uppercase">Green</p>
              <p className="mt-2 text-base leading-relaxed">{mirror.green}</p>
            </div>
            <div className="rounded-2xl border border-[#e7a39c]/45 bg-[#e7a39c]/10 p-4">
              <p className="text-xs tracking-[0.16em] text-[#e7a39c] uppercase">Red</p>
              <p className="mt-2 text-base leading-relaxed">{mirror.red}</p>
            </div>
          </article>
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle center>Штурвал</SectionTitle>
          <article className="rounded-3xl border border-border bg-card p-5">
            <div className="flex gap-6">
              <SteerTrack name={couple.player1.name} points={helm.player1} fill={ACCENT} />
              <SteerTrack
                name={couple.player2.name}
                points={helm.player2}
                fill="rgba(244,239,232,0.72)"
                nameColor={CREAM}
              />
            </div>
            <p className="mt-4 text-center font-serif text-2xl">{helm.headline}</p>
            <p className="mt-2 text-center text-sm leading-relaxed text-muted">
              Сколько из 8 сцен вы оба отдали этому человеку.
              {helmRest(helm.disputes, helm.scenes.filter((scene) => scene.outcome === "even").length)}
            </p>
          </article>
          {settled.map((scene) => (
            <article
              key={scene.id}
              className="flex items-baseline justify-between gap-4 rounded-3xl border border-border bg-card p-5"
            >
              <h3 className="text-base">{scene.title}</h3>
              <SceneLabel outcome={scene.outcome} label={scene.label} />
            </article>
          ))}
          {disputed.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h3 className="font-serif text-2xl">Где вы назвали разных людей</h3>
              {disputed.map((scene) => (
                <article
                  key={scene.id}
                  className="flex items-baseline justify-between gap-4 rounded-3xl border border-border bg-card p-5"
                >
                  <h3 className="text-base">{scene.title}</h3>
                  <SceneLabel outcome={scene.outcome} label={scene.label} />
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle>Деньги</SectionTitle>
          <MoneyPair
            title="100 000 ₽"
            leftName={couple.player1.name}
            rightName={couple.player2.name}
            left={evaluation.money.surprise.player1}
            right={evaluation.money.surprise.player2}
          />
          <MoneyPair
            title="Кто будет зарабатывать больше через 10 лет"
            leftName={couple.player1.name}
            rightName={couple.player2.name}
            left={evaluation.money.earnings.player1}
            right={evaluation.money.earnings.player2}
          />
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle>Через 10 лет</SectionTitle>
          <article className="rounded-3xl border border-border bg-card p-5">
            <p className="text-base leading-relaxed">
              {report.decade ?? buildDecade(evaluation, couple.player1.name, couple.player2.name)}
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg">Три ценности</h3>
              <p className="text-sm text-accent">общие {evaluation.values.overlap} / 3</p>
            </div>
            <div className="mt-3 flex gap-4 text-sm text-muted">
              <p>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />
                {couple.player1.name}
              </p>
              <p>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-foreground" />
                {couple.player2.name}
              </p>
            </div>
            <ValuesChart evaluation={evaluation} player1={couple.player1.name} player2={couple.player2.name} />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {report.valuesReading ?? buildValuesReading(evaluation, couple.player1.name, couple.player2.name)}
            </p>
          </article>
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle center>Ваш рентген</SectionTitle>
          <article className="rounded-3xl border border-border bg-card p-5">
            {sameWave ? <p className="mb-4 text-center text-base">Почти везде на одной волне</p> : null}
            <DomainAxis domains={axis} />
          </article>
        </section>

        <section className="rounded-[28px] border border-border bg-card px-6 py-8 text-center">
          <p className="text-xs tracking-[0.18em] text-accent uppercase">Главный парадокс</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight">{report.paradox.title}</h2>
          <p className="mt-4 text-lg leading-relaxed">{report.paradox.description}</p>
        </section>

        <section className="rounded-[28px] border border-accent/40 bg-[#1a1612] p-6">
          <p className="text-sm tracking-[0.16em] text-accent uppercase">Вопрос на эту тему</p>
          <p className="mt-3 text-lg leading-relaxed">{report.discussQuestion}</p>
        </section>

        <section className="rounded-[28px] border border-border bg-card p-6">
          <p className="text-sm tracking-[0.16em] text-accent uppercase">Если ваша пара — это сцена</p>
          <p className="mt-4 text-lg leading-relaxed whitespace-pre-line">{report.finalScene}</p>
        </section>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        <ShareButton player1={couple.player1.name} player2={couple.player2.name} getSheet={() => sheetRef.current} />
        <NewCoupleButton />
      </div>
    </div>
  );
}
