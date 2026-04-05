function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.7A3 3 0 0 0 13.3 13.4" />
      <path d="M9.9 5.1A11.5 11.5 0 0 1 12 5c6.4 0 10 7 10 7a19.2 19.2 0 0 1-4.2 4.9" />
      <path d="M6.2 6.3A19.3 19.3 0 0 0 2 12s3.6 7 10 7c1.7 0 3.2-.5 4.5-1.2" />
    </svg>
  );
}

function PasswordToggleButton({ visible, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={visible ? "Hide password" : "Show password"}
      title={visible ? "Hide password" : "Show password"}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/80 bg-panel text-muted transition hover:border-gold/40 hover:text-ink ${className}`.trim()}
    >
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}

export default PasswordToggleButton;
