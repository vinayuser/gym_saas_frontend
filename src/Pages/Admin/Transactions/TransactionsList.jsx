import { useCallback, useEffect, useState } from 'react';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AppModal from '../../../components/fitsphere/AppModal';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import { formatDate, formatDateTime } from '../../../helpers/formatUtils';

const STATUS_FILTERS = ['ALL', 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'];

const STATUS_LABELS = {
  COMPLETED: 'Completed',
  PENDING: 'Pending',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

const statusClass = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-primary-container/20 text-primary-container border-primary-container/30';
    case 'PENDING':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'FAILED':
      return 'bg-error-container/20 text-error border-error-container/30';
    case 'REFUNDED':
      return 'bg-white/10 text-secondary border-white/10';
    default:
      return 'bg-white/5 text-secondary border-white/10';
  }
};

const formatInr = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const shortId = (id) => (id ? `${id.slice(0, 8)}…` : '—');

const TransactionDetail = ({ tx, onClose }) => (
  <AppModal open={Boolean(tx)} onClose={onClose} size="lg" scrollable panelClassName="!p-6">
    {tx && (
      <>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold">Transaction details</h2>
            <p className="mt-1 font-mono text-xs text-secondary">{tx.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-secondary hover:bg-white/10"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <span className="text-secondary">Amount</span>
            <span className="font-display text-2xl font-bold text-primary-container">
              {formatInr(tx.amount)}
            </span>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
              <dt className="text-secondary">Status</dt>
              <dd>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${statusClass(tx.status)}`}
                >
                  {STATUS_LABELS[tx.status] || tx.status}
                </span>
              </dd>
            </div>
            <Row label="Paid at" value={tx.paidAt ? formatDateTime(tx.paidAt) : '—'} />
            <Row label="Created" value={formatDateTime(tx.createdAt)} />
            <Row label="Provider" value={tx.provider || '—'} />
            <Row label="Payment ID" value={tx.razorpayPaymentId || tx.providerRef || '—'} mono />
            <Row label="Order ID" value={tx.razorpayOrderId || '—'} mono />
            <Row label="Currency" value={tx.currency} />
            <Row label="Subscription" value={tx.subscriptionStatus || '—'} />
          </dl>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">
              Tenant &amp; owner
            </p>
            <p className="mt-2 font-medium">{tx.tenant?.name || '—'}</p>
            <p className="text-xs text-secondary">{tx.tenant?.email}</p>
            {tx.owner && (
              <p className="mt-2 text-sm">
                {tx.owner.name}{' '}
                <span className="text-secondary">({tx.owner.email})</span>
              </p>
            )}
          </div>

          {tx.plan && (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">Plan</p>
              <p className="mt-2 font-medium text-primary-container">{tx.plan.name}</p>
              <p className="text-xs text-secondary">{tx.plan.type}</p>
            </div>
          )}

          {tx.invite && (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">
                Invite onboarding
              </p>
              <p className="mt-2 text-sm">{tx.invite.email}</p>
              {tx.invite.businessName && (
                <p className="text-xs text-secondary">{tx.invite.businessName}</p>
              )}
              <p className="mt-2 text-xs text-secondary">
                Accepted {tx.invite.acceptedAt ? formatDateTime(tx.invite.acceptedAt) : '—'}
              </p>
            </div>
          )}
        </div>
      </>
    )}
  </AppModal>
);

const Row = ({ label, value, mono = false }) => (
  <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
    <dt className="text-secondary">{label}</dt>
    <dd className={`text-right ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
  </div>
);

const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [selected, setSelected] = useState(null);
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
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await getRequest(ENDPOINTS.TRANSACTIONS.LIST, { params });
      setTransactions(res.data?.transactions || []);
      setSummary(res.data?.summary || null);
      setPagination(res.data?.pagination || { total: 0, page, limit, totalPages: 1 });
    } catch {
      setTransactions([]);
      setSummary(null);
      setPagination({ total: 0, page: 1, limit, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page]);

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

  return (
    <AdminPageShell
      showSearch
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search tenant, owner, payment ID, plan..."
    >
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Payment Transactions</h1>
          <p className="mt-1 text-secondary/70">
            Monthly payments from gyms when they join.
          </p>
        </div>

        {summary && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard className="p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">
                Total revenue
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-primary-container">
                {formatInr(summary.totalRevenue)}
              </p>
            </GlassCard>
            <GlassCard className="p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">
                Completed
              </p>
              <p className="mt-2 font-display text-3xl font-bold">{summary.completedCount}</p>
            </GlassCard>
            <GlassCard className="p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">
                Pending
              </p>
              <p className="mt-2 font-display text-3xl font-bold">{summary.pendingCount}</p>
            </GlassCard>
            <GlassCard className="p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">
                Failed / Refunded
              </p>
              <p className="mt-2 font-display text-3xl font-bold">
                {(summary.failedCount || 0) + (summary.refundedCount || 0)}
              </p>
            </GlassCard>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                statusFilter === s ? 'bg-white/10 text-on-surface' : 'text-secondary hover:bg-white/5'
              }`}
            >
              {s === 'ALL' ? 'All' : STATUS_LABELS[s] || s}
            </button>
          ))}
        </div>

        <GlassCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-widest text-secondary/60">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Tenant</th>
                  <th className="px-6 py-3">Owner</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Provider</th>
                  <th className="px-6 py-3">Payment ref</th>
                  <th className="px-6 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-secondary">
                      Loading…
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-secondary">
                      No transactions yet. Payments appear here after gym owners complete invite
                      checkout.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <p className="font-medium">{formatDate(tx.paidAt || tx.createdAt)}</p>
                        <p className="text-xs text-secondary">
                          {tx.paidAt ? formatDateTime(tx.paidAt).split(', ')[1] : '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{tx.tenant?.name || '—'}</p>
                        <p className="text-xs text-secondary">{tx.tenant?.slug || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{tx.owner?.name || '—'}</p>
                        <p className="text-xs text-secondary">{tx.owner?.email || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-primary-container">{tx.plan?.name || '—'}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary-container">
                        {formatInr(tx.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${statusClass(tx.status)}`}
                        >
                          {STATUS_LABELS[tx.status] || tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 capitalize text-secondary">{tx.provider || '—'}</td>
                      <td className="px-6 py-4 font-mono text-xs text-secondary">
                        {shortId(tx.razorpayPaymentId || tx.providerRef)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelected(tx)}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/5"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-6 py-3">
            <p className="text-xs font-semibold text-secondary">
              {total === 0 ? 'No transactions' : `Showing ${start} to ${end} of ${total.toLocaleString()} transactions`}
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

      {selected && <TransactionDetail tx={selected} onClose={() => setSelected(null)} />}
    </AdminPageShell>
  );
};

export default TransactionsList;
