import Button from "./Button";

function CursorPagination({
  cursor = 0,
  pageSize = 10,
  totalItems = 0,
  onPrevious,
  onNext
}) {
  if (totalItems <= pageSize) {
    return null;
  }

  const start = totalItems === 0 ? 0 : cursor + 1;
  const end = Math.min(cursor + pageSize, totalItems);
  const hasPrevious = cursor > 0;
  const hasNext = cursor + pageSize < totalItems;

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-secondary">
        Showing <span className="font-semibold text-ink">{start}</span> to{" "}
        <span className="font-semibold text-ink">{end}</span> of{" "}
        <span className="font-semibold text-ink">{totalItems}</span>
      </p>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="ui-compact-button disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onNext}
          disabled={!hasNext}
          className="ui-compact-button disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default CursorPagination;
