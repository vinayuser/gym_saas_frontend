import Icon from './Icon';

const pageNumbersFor = (page, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page, page - 1, page + 1].filter((n) => n >= 1 && n <= totalPages));
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const withEllipsis = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) withEllipsis.push('...');
    withEllipsis.push(n);
  });
  return withEllipsis;
};

const ListPagination = ({ page, total = 0, limit = 10, loading = false, onPage, noun = 'items' }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pageNumbers = pageNumbersFor(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-6 py-3">
      <p className="text-xs font-semibold text-secondary">
        {total === 0 ? `No ${noun}` : `Showing ${start} to ${end} of ${total.toLocaleString()} ${noun}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => onPage(Math.max(1, page - 1))}
          className="rounded p-1 text-secondary transition-colors hover:bg-white/10 disabled:opacity-30"
        >
          <Icon name="chevron_left" size={22} />
        </button>
        {pageNumbers.map((n, i) =>
          n === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-secondary">
              ...
            </span>
          ) : (
            <button
              key={n}
              type="button"
              disabled={loading}
              onClick={() => onPage(n)}
              className={`flex h-8 w-8 items-center justify-center rounded text-xs font-bold transition-colors ${
                page === n ? 'bg-neon text-on-primary-fixed' : 'text-secondary hover:bg-white/10'
              }`}
            >
              {n}
            </button>
          )
        )}
        <button
          type="button"
          disabled={page >= totalPages || loading}
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          className="rounded p-1 text-secondary transition-colors hover:bg-white/10 disabled:opacity-30"
        >
          <Icon name="chevron_right" size={22} />
        </button>
      </div>
    </div>
  );
};

export default ListPagination;
