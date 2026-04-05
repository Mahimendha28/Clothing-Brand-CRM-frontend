import SurfaceCard from "./SurfaceCard";

function MetricCard({ label, value, note }) {
  return (
    <SurfaceCard className="space-y-3">
      <p className="ui-eyebrow">{label}</p>
      <p className="text-3xl font-semibold text-ink">{value}</p>
      <p className="text-sm leading-6 text-muted">{note}</p>
    </SurfaceCard>
  );
}

export default MetricCard;
