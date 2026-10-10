import GlassCard from './GlassCard';
import Icon from './Icon';
import ListPagination from './ListPagination';

export const tableRowNumber = (page, limit, index) => (page - 1) * limit + index + 1;

export const TABLE_CLASS = 'w-full text-left text-sm';
export const THEAD_ROW =
  'border-b border-white/5 bg-white/[0.02] text-[11px] uppercase tracking-wider text-secondary/60';
export const TH = 'px-3 py-2.5';
export const TD = 'px-3 py-2.5 align-middle';

export const TableSearch = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative min-w-[200px] flex-1">
    <Icon
      name="search"
      size={18}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
    />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/10 bg-surface-container-lowest py-2 pl-10 pr-3 text-sm focus:border-primary-fixed focus:outline-none"
    />
  </div>
);

export const TableSelect = ({ value, onChange, children, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`rounded-lg border border-white/10 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary-fixed focus:outline-none ${className}`}
  >
    {children}
  </select>
);

const TableShell = ({
  title,
  search,
  onSearch,
  searchPlaceholder = 'Search...',
  filters,
  actions,
  children,
  page,
  total,
  limit = 10,
  loading = false,
  onPage,
  noun = 'items',
}) => (
  <GlassCard className="overflow-hidden bg-surface-container p-0" hover={false}>
    <div className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3">
      {title ? <h1 className="font-display text-base font-bold">{title}</h1> : null}
      {onSearch ? (
        <TableSearch value={search} onChange={onSearch} placeholder={searchPlaceholder} />
      ) : (
        <div className="min-w-0 flex-1" />
      )}
      {filters}
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
    <div className="overflow-x-auto">{children}</div>
    {onPage ? (
      <ListPagination
        page={page}
        total={total}
        limit={limit}
        loading={loading}
        onPage={onPage}
        noun={noun}
      />
    ) : null}
  </GlassCard>
);

export default TableShell;
