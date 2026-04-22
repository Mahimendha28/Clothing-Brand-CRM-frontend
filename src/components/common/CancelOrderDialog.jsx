import Button from "./Button";

function CancelOrderDialog({
  order,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
  loading = false
}) {
  if (!order) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-soft bg-canvas p-6 shadow-float">
        <p className="ui-eyebrow">Cancel Order</p>
        <h2 className="mt-3 font-display text-3xl text-ink">Cancel {order.order_number}?</h2>
        <p className="mt-3 text-sm leading-7 text-secondary">
          This action will stop fulfillment for this order. You can optionally add a reason to keep your order history clear.
        </p>

        <div className="mt-6 space-y-3">
          <label className="ui-label">Reason</label>
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            rows="4"
            className="ui-input min-h-[132px] resize-none"
            placeholder="Tell us why you want to cancel this order"
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="!rounded-[12px] !px-4 !py-2.5 !text-sm !font-medium !normal-case !tracking-[0.02em]"
          >
            Keep Order
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onConfirm}
            disabled={loading}
            className="!rounded-[12px] !px-4 !py-2.5 !text-sm !font-medium !normal-case !tracking-[0.02em]"
          >
            {loading ? "Cancelling..." : "Confirm Cancel"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CancelOrderDialog;
