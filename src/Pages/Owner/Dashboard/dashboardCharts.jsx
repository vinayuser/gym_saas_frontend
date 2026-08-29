const formatLeadStatus = (status) =>
  String(status || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const BarChart = ({ items, valueKey = 'count', labelKey = 'label', accent = false, formatValue }) => {
  const max = Math.max(...items.map((i) => Number(i[valueKey]) || 0), 1);

  return (
    <div className="flex h-56 items-end justify-between gap-2 sm:gap-3">
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0;
        const height = `${Math.max((value / max) * 100, value > 0 ? 8 : 4)}%`;
        const display = formatValue ? formatValue(value) : value;

        return (
          <div key={item[labelKey]} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-[10px] font-semibold text-secondary sm:text-xs">{display}</span>
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t-md transition-all ${
                  accent ? 'bg-primary-fixed' : 'bg-primary-fixed/70'
                }`}
                style={{ height }}
                title={`${item[labelKey]}: ${display}`}
              />
            </div>
            <span className="truncate text-[10px] text-secondary sm:text-xs">{item[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
};

export { BarChart, formatLeadStatus };
