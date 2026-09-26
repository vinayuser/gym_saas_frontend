import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import SupportTicketForm from '../../../components/fitsphere/SupportTicketForm';
import SectionLoader from '../../../components/Loader/SectionLoader';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, patchRequest } from '../../../config/dataApi';
import {
  SUPPORT_CATEGORIES,
  SUPPORT_EMAIL,
  SUPPORT_STATUS_LABELS,
  getSupportCategory,
} from '../../../constants/supportTopics';
import { formatDate } from '../../../helpers/formatUtils';

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const STATUS_CLASS = {
  OPEN: 'bg-amber-500/20 text-amber-300',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-300',
  RESOLVED: 'bg-emerald-500/20 text-emerald-300',
  CLOSED: 'bg-slate-500/20 text-slate-300',
};

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [expandedId, setExpandedId] = useState(null);
  const limit = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await getRequest(ENDPOINTS.SUPPORT.TICKETS, { params });
      setTickets(res.data?.tickets || []);
      setPagination(res.data?.pagination || { total: 0, page, limit, totalPages: 1 });
    } catch {
      setTickets([]);
      setPagination({ total: 0, page: 1, limit, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, debouncedSearch, page]);

  useEffect(() => {
    load();
  }, [load]);

  const total = pagination.total || 0;
  const totalPages = pagination.totalPages || 1;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pageNumbers = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, page, page - 1, page + 1].filter((n) => n >= 1 && n <= totalPages));
    const sorted = Array.from(pages).sort((a, b) => a - b);
    const withEllipsis = [];
    sorted.forEach((n, i) => {
      if (i > 0 && n - sorted[i - 1] > 1) withEllipsis.push('...');
      withEllipsis.push(n);
    });
    return withEllipsis;
  })();

  const handleStatusChange = async (ticketId, status) => {
    try {
      await patchRequest(ENDPOINTS.SUPPORT.UPDATE_STATUS(ticketId), { status });
      toast.success('Ticket status updated');
      load();
    } catch {
      /* handled in api */
    }
  };

  return (
    <AdminPageShell
      showSearch
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search subject, message, email..."
    >
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Support</h1>
          <p className="mt-1 text-secondary/70">
            Gym owner support requests sent to{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary-container hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    statusFilter === status
                      ? 'border-primary-container/50 bg-primary-container/15 text-primary-container'
                      : 'border-white/10 text-secondary hover:bg-white/5'
                  }`}
                >
                  {status === 'ALL' ? 'All statuses' : SUPPORT_STATUS_LABELS[status]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                className="input-cyber rounded-lg border border-white/10 bg-surface-container-lowest px-3 py-2 text-sm"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All categories</option>
                {SUPPORT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <GlassCard className="overflow-hidden">
              <SectionLoader show={loading}>
                {tickets.length === 0 ? (
                  <p className="px-6 py-10 text-sm text-secondary">No support tickets match your filters.</p>
                ) : (
                  <div className="divide-y divide-white/5">
                    {tickets.map((ticket) => {
                      const expanded = expandedId === ticket.id;
                      return (
                        <div key={ticket.id} className="px-6 py-5">
                          <button
                            type="button"
                            className="flex w-full items-start justify-between gap-4 text-left"
                            onClick={() => setExpandedId(expanded ? null : ticket.id)}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    STATUS_CLASS[ticket.status] || 'bg-white/10 text-secondary'
                                  }`}
                                >
                                  {SUPPORT_STATUS_LABELS[ticket.status] || ticket.status}
                                </span>
                                <span className="text-xs text-secondary">
                                  {getSupportCategory(ticket.category)?.label || ticket.category}
                                </span>
                                {ticket.emailSent ? (
                                  <span className="text-xs text-emerald-300">Email sent</span>
                                ) : (
                                  <span className="text-xs text-secondary">Saved only</span>
                                )}
                              </div>
                              <h3 className="mt-2 font-semibold">{ticket.subject}</h3>
                              <p className="mt-1 text-sm text-secondary">
                                {ticket.tenant?.name || 'Platform'} · {ticket.senderName || ticket.user?.name || '—'} ·{' '}
                                {ticket.senderEmail} · {formatDate(ticket.createdAt)}
                              </p>
                            </div>
                            <Icon name={expanded ? 'expand_less' : 'expand_more'} size={22} className="shrink-0 text-secondary" />
                          </button>

                          {expanded && (
                            <div className="mt-4 space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                              <pre className="whitespace-pre-wrap font-sans text-sm text-on-surface">{ticket.message}</pre>
                              <div className="flex flex-wrap items-center gap-3">
                                <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                  Update status
                                </label>
                                <select
                                  className="input-cyber rounded-lg border border-white/10 bg-surface-container-lowest px-3 py-2 text-sm"
                                  value={ticket.status}
                                  onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                >
                                  {Object.entries(SUPPORT_STATUS_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  ))}
                                </select>
                                <a
                                  href={`mailto:${ticket.senderEmail}?subject=${encodeURIComponent(`Re: ${ticket.subject}`)}`}
                                  className="inline-flex items-center gap-1.5 text-sm text-primary-container hover:underline"
                                >
                                  <Icon name="reply" size={16} />
                                  Reply by email
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionLoader>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-3">
                <p className="text-xs font-semibold text-secondary">
                  {total === 0 ? 'No tickets' : `Showing ${start} to ${end} of ${total.toLocaleString()} tickets`}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                        onClick={() => setPage(n)}
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
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded p-1 text-secondary transition-colors hover:bg-white/10 disabled:opacity-30"
                  >
                    <Icon name="chevron_right" size={22} />
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>

          <div>
            <SupportTicketForm compact onSubmitted={() => load()} />
            <GlassCard className="mt-6 p-5">
              <Icon name="info" size={22} className="mb-2 text-primary-container" />
              <p className="text-sm text-secondary">
                Owner submissions create a ticket and email{' '}
                <strong className="text-on-surface">{SUPPORT_EMAIL}</strong> when SMTP is configured.
                Without SMTP, tickets are still saved here for review.
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
};

export default AdminSupport;
