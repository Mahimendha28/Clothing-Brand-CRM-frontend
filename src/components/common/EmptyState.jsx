function EmptyState({ title, description }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-line bg-canvas px-5 py-10 text-center">
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}

export default EmptyState;
