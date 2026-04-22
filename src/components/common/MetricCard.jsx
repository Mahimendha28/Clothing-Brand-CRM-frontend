import SurfaceCard from "./SurfaceCard";

function MetricCard({ label, value, note, compact = false }) {
  return (
    <SurfaceCard className={`flex flex-col justify-between ${compact ? "min-h-[112px] space-y-2 !p-4" : "min-h-[172px] space-y-3"}`}>
      <p className="ui-eyebrow">{label}</p>
      <p className={compact ? "text-[1.55rem] font-semibold leading-none text-ink" : "text-3xl font-semibold text-ink"}>
        {value}
      </p>
      <p className={compact ? "text-[13px] text-muted" : "text-sm leading-6 text-muted"}>{note}</p>
    </SurfaceCard>
  );
}

export default MetricCard;
