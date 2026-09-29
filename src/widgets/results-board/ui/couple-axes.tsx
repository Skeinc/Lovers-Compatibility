import type { AxisPosition, CoupleAxis } from "@/shared/api";

const MARK: Record<AxisPosition, string> = {
  player1: "8%",
  "lean-player1": "29%",
  even: "50%",
  "lean-player2": "71%",
  player2: "92%",
};

const AXIS_TITLE: Record<CoupleAxis["id"], string> = {
  "green-flag": "Green flag",
  "red-flag": "Red flag",
  leader: "Кто главный",
  "mind-reader": "Лучше читает партнёра",
  initiator: "Инициатор",
  "stability-adventure": "Стабильность ↔ приключения",
  money: "Деньги",
  future: "Кто задаёт образ будущего",
};

function AxisRow({ axis, player1, player2 }: { axis: CoupleAxis; player1: string; player2: string }) {
  return (
    <article className="rounded-3xl border border-border bg-card px-4 py-5">
      <p className="text-center font-serif text-2xl leading-tight">{AXIS_TITLE[axis.id]}</p>
      <div className="mt-4 flex justify-between gap-3 text-xs tracking-[0.14em] uppercase">
        <span className="text-accent">{player1}</span>
        <span style={{ color: "#f4efe8" }}>{player2}</span>
      </div>
      <div className="relative mt-3 h-3">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
        <span className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35" />
        <span className="absolute top-1/2 right-0 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/35" />
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_rgba(214,180,138,0.7)]"
          style={{ left: MARK[axis.position] }}
        />
      </div>
      <p className="mt-3 text-center text-sm text-muted">{axis.label}</p>
    </article>
  );
}

export function CoupleAxes({ axes, player1, player2 }: { axes: CoupleAxis[]; player1: string; player2: string }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="text-center">
        <h2 className="font-serif text-3xl">Кто здесь кто?</h2>
        <p className="mt-2 text-sm text-muted">Не наука. Просто посмотрим, куда вас тянет.</p>
      </div>
      {axes.map((axis) => (
        <AxisRow key={axis.id} axis={axis} player1={player1} player2={player2} />
      ))}
    </section>
  );
}
