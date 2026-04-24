import Button from "./Button";

function ConfirmDialog({
  open = false,
  title = "Confirm action",
  description = "Are you sure you want to continue?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onClose
}) {
  if (!open) {
    return null;
  }

  const confirmVariant = tone === "danger" ? "danger" : "primary";

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-primary/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[24px] border border-soft bg-canvas p-6 shadow-float">
        <p className="ui-eyebrow">Please Confirm</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-secondary">{description}</p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={confirmVariant} onClick={onConfirm} disabled={loading}>
            {loading ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
