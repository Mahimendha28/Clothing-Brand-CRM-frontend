import { Search } from "lucide-react";

function CustomerTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search",
  filters = [],
  totalItems = 0,
  visibleItems = 0,
  itemLabel = "records"
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-soft bg-page/70 p-3 md:gap-3.5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 lg:max-w-[420px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-line bg-page px-2 py-1 text-[11px] font-medium text-secondary">
              Search
            </span>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="ui-input !rounded-[12px] !bg-white !py-2.5 !pl-10 !pr-20 !text-[13px]"
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
            {filters.map((filter) => (
              <label key={filter.key} className="min-w-0 md:min-w-[170px]">
                <span className="sr-only">{filter.label}</span>
                <select
                  value={filter.value}
                  onChange={(event) => filter.onChange(event.target.value)}
                  className="ui-input !rounded-[12px] !bg-white !px-3.5 !py-2.5 !text-[13px]"
                >
                  {filter.options.map((option) => (
                    <option key={`${filter.key}-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>

        <div className="shrink-0 rounded-[12px] border border-line bg-white px-3.5 py-2.5 text-[13px] text-secondary">
          Showing <span className="font-semibold text-ink">{visibleItems}</span> of{" "}
          <span className="font-semibold text-ink">{totalItems}</span> {itemLabel}
        </div>
      </div>
    </div>
  );
}

export default CustomerTableToolbar;
