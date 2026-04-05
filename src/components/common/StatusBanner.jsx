function StatusBanner({ tone = "info", children }) {
  if (!children) {
    return null;
  }

  const toneClasses = {
    info: "border-line bg-white text-ink",
    success: "border-success/20 bg-success/10 text-success",
    danger: "border-danger/20 bg-danger/10 text-danger"
  };

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClasses[tone]}`}>{children}</div>;
}

export default StatusBanner;
