const toneMap = {
  success: "border-success/20 bg-success/10 text-success",
  danger: "border-danger/20 bg-danger/10 text-danger",
  info: "border-accent/20 bg-accent/10 text-accent",
  neutral: "border-line bg-page text-secondary"
};

const resolveTone = (value) => {
  const normalized = String(value || "").toLowerCase();

  if (["active", "paid", "delivered", "confirmed", "featured", "completed", "success", "refunded"].includes(normalized)) {
    return "success";
  }

  if (["inactive", "cancelled", "failed", "rejected", "out_of_stock", "disabled"].includes(normalized)) {
    return "danger";
  }

  if (["placed", "packed", "shipped", "pending", "processing", "new"].includes(normalized)) {
    return "info";
  }

  return "neutral";
};

function StatusPill({ value, tone, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${toneMap[tone || resolveTone(value)]
        } ${className}`.trim()}
    >
      {String(value || "").replace(/_/g, " ")}
    </span>
  );
}

export default StatusPill;
