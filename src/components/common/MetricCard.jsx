import SurfaceCard from "./SurfaceCard";

function MetricCard({ label, value, note, compact = false }) {
  return (
    <SurfaceCard className={`flex h-full flex-col justify-between ${compact ? "min-h-[84px] gap-1 !p-3 md:!p-3.5" : "min-h-[148px] gap-2"}`}>
      <p className={compact ? "text-[10px] font-semibold uppercase tracking-[0.18em] text-muted" : "ui-eyebrow"}>{label}</p>
      <p className={compact ? "text-base font-semibold leading-snug text-ink md:text-lg" : "text-lg font-semibold text-ink"}>
        {value}
      </p>
      <p className={compact ? "text-xs leading-5 text-muted md:text-[13px]" : "text-sm leading-6 text-muted"}>{note}</p>
    </SurfaceCard>
  );
}

export default MetricCard;
