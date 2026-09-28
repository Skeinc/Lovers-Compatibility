export function ProgressBar({ value, label }: { value: number; label: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div>
      <p className="mb-2 text-sm text-muted">{label}</p>
      <div
        className="h-1 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={Math.round(width)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
