import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import AppModal from '../../../components/fitsphere/AppModal';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, patchRequest, putRequest } from '../../../config/dataApi';
import { formatDate, formatCurrency } from '../../../helpers/formatUtils';

const STATUS_FILTERS = ['ALL', 'PENDING', 'SENT', 'PAYMENT_PENDING', 'ACCEPTED', 'REVOKED'];

const STATUS_LABELS = {
  PENDING: 'Pending',
  SENT: 'Email sent',
  PAYMENT_PENDING: 'Awaiting payment',
  ACCEPTED: 'Accepted',
  REVOKED: 'Revoked',
  EXPIRED: 'Expired',
};

const statusClass = (status) => {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-primary-container/20 text-primary-container border-primary-container/30';
    case 'SENT':
    case 'PAYMENT_PENDING':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'PENDING':
      return 'bg-white/10 text-secondary border-white/10';
    case 'REVOKED':
    case 'EXPIRED':
      return 'bg-error-container/20 text-error border-error-container/30';
    default:
      return 'bg-white/5 text-secondary border-white/10';
  }
};

const slugifyAlias = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const InviteList = () => {
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const limit = 10;
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [publishInvite, setPublishInvite] = useState(null);
  const [aliasInput, setAliasInput] = useState('');
  const [publishing, setPublishing] = useState(false);

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
      const res = await getRequest(ENDPOINTS.INVITES.LIST, { params });
      setInvites(res.data?.invites || []);
      setPagination(
        res.data?.pagination || {
          total: 0,
          page,
          limit,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }
      );
    } catch {
      setInvites([]);
      setPagination({
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
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

  const getInviteLink = (token) => `${window.location.origin}/setup/${token}`;

  const handleCopyLink = (invite) => {
    navigator.clipboard.writeText(getInviteLink(invite.token));
    toast.success('Invite link copied');
    setMenuOpenId(null);
  };

  const handleMarkSent = async (id) => {
    setMenuOpenId(null);
    try {
      await patchRequest(ENDPOINTS.INVITES.MARK_SENT(id));
      toast.success('Marked as sent');
      load();
    } catch {
      /* handled in api */
    }
  };

  const handleRevoke = async (id) => {
    setMenuOpenId(null);
    if (!window.confirm('Revoke this invite? The link will stop working.')) return;
    try {
      await patchRequest(ENDPOINTS.INVITES.REVOKE(id));
      toast.success('Invite revoked');
      load();
    } catch {
      /* handled in api */
    }
  };

  const openPublishModal = (invite) => {
    setMenuOpenId(null);
    if (invite.status !== 'ACCEPTED' || !invite.tenantId) {
      toast.info('Publish is available after the invite is accepted and the gym is created');
      return;
    }
    setAliasInput(invite.primaryGym?.appAlias || '');
    setPublishInvite(invite);
  };

  const closePublishModal = () => {
    setPublishInvite(null);
    setAliasInput('');
  };

  const handleConfirmPublish = async (e) => {
    e.preventDefault();
    if (!publishInvite) return;

    const existingAlias = publishInvite.primaryGym?.appAlias;
    if (existingAlias) {
      closePublishModal();
      return;
    }

    const alias = slugifyAlias(aliasInput);
    if (!alias || alias.length < 2) {
      toast.error('Enter a unique app alias');
      return;
    }

    setPublishing(true);
    try {
      await putRequest(ENDPOINTS.INVITES.PUBLISH(publishInvite.id), {
        appAlias: alias,
        appPublished: true,
      });
      toast.success('App published');
      closePublishModal();
      load();
    } catch {
      /* toast from api */
    } finally {
      setPublishing(false);
    }
  };

  const openMenu = (inviteId, event) => {
    event.stopPropagation();
    if (menuOpenId === inviteId) {
      setMenuOpenId(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    setMenuOpenId(inviteId);
  };

  const activeInvite = invites.find((i) => i.id === menuOpenId);
  const aliasLocked = Boolean(publishInvite?.primaryGym?.appAlias);

  return (
    <>
      <AdminPageShell
        showSearch
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by email..."
      >
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">Gym Owner Invites</h1>
              <p className="mt-1 text-secondary/70">
                Send onboarding links with an assigned SaaS plan. Owners pay via Razorpay to activate.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/invites/new')}
              className="cyber-glow flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 text-sm font-bold text-on-primary-container"
            >
              <Icon name="add" size={20} />
              Create Invite
            </button>
          </div>

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
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-widest text-secondary/60">
                    <th className="px-4 py-3 w-14">#</th>
                    <th className="px-6 py-3">Invitee</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">App alias</th>
                    <th className="px-6 py-3">Expires</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-secondary">
                        Loading…
                      </td>
                    </tr>
                  ) : invites.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-secondary">
                        {debouncedSearch ? (
                          <>No invites match “{debouncedSearch}”.</>
                        ) : (
                          <>
                            No invites yet.{' '}
                            <Link to="/admin/invites/new" className="text-primary-container hover:underline">
                              Create your first invite
                            </Link>
                          </>
                        )}
                      </td>
                    </tr>
                  ) : (
                    invites.map((invite, rowIndex) => {
                      const gym = invite.primaryGym;
                      const rowNumber = (page - 1) * limit + rowIndex + 1;
                      return (
                        <tr key={invite.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-4 text-xs font-semibold text-secondary tabular-nums">
                            {rowNumber}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium">{invite.email}</p>
                            <p className="text-xs text-secondary">
                              {invite.inviteeName || '—'}
                              {invite.businessName ? ` · ${invite.businessName}` : ''}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-primary-container">
                              {invite.planName || invite.plan?.name}
                            </p>
                            <p className="text-xs text-secondary">
                              {formatCurrency(Number(invite.plan?.priceMonthly || invite.priceMonthly || 0))}
                              /mo
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${statusClass(invite.status)}`}
                            >
                              {STATUS_LABELS[invite.status] || invite.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-secondary">
                            {gym?.appAlias ? (
                              <>
                                <span className="font-mono text-on-surface">{gym.appAlias}</span>
                                {gym.appPublished ? (
                                  <span className="mt-0.5 block text-[10px] font-semibold uppercase text-primary-container">
                                    Published
                                  </span>
                                ) : null}
                              </>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-6 py-4 text-secondary">{formatDate(invite.expiresAt)}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              title="Actions"
                              onClick={(e) => openMenu(invite.id, e)}
                              className="rounded p-2 text-secondary hover:bg-white/10 hover:text-on-surface"
                            >
                              <Icon name="more_vert" size={20} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-6 py-3">
              <p className="text-xs font-semibold text-secondary">
                {total === 0
                  ? 'No invites'
                  : `Showing ${start} to ${end} of ${total.toLocaleString()} invites`}
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
                        page === n
                          ? 'bg-neon text-on-primary-fixed'
                          : 'text-secondary hover:bg-white/10'
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
      </AdminPageShell>

      {menuOpenId && activeInvite && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpenId(null)}
            aria-label="Close menu"
          />
          <div
            className="fixed z-50 min-w-[180px] overflow-hidden rounded-lg border border-white/10 bg-surface-container shadow-xl"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            {activeInvite.status !== 'ACCEPTED' && (
              <button
                type="button"
                onClick={() => handleCopyLink(activeInvite)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5"
              >
                <Icon name="link" size={16} />
                Copy setup link
              </button>
            )}
            {activeInvite.status === 'ACCEPTED' && (
              <button
                type="button"
                onClick={() => openPublishModal(activeInvite)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5"
              >
                <Icon name="publish" size={16} />
                Publish app
              </button>
            )}
            {activeInvite.status === 'PENDING' && (
              <button
                type="button"
                onClick={() => handleMarkSent(activeInvite.id)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5"
              >
                <Icon name="send" size={16} />
                Mark as sent
              </button>
            )}
            {activeInvite.status !== 'ACCEPTED' && activeInvite.status !== 'REVOKED' && (
              <button
                type="button"
                onClick={() => handleRevoke(activeInvite.id)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-error hover:bg-white/5"
              >
                <Icon name="block" size={16} />
                Revoke
              </button>
            )}
          </div>
        </>
      )}

      {publishInvite && (
        <AppModal open={Boolean(publishInvite)} onClose={closePublishModal} size="md">
          <h2 className="font-display text-xl font-bold">Publish app</h2>
          <p className="mt-1 text-sm leading-relaxed text-secondary">
            Set a unique alias used by the mobile app to load this gym.
            {aliasLocked ? ' Alias cannot be changed once set.' : ''}
          </p>

          <form onSubmit={handleConfirmPublish} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
                App alias
              </label>
              <input
                value={aliasInput}
                onChange={(e) => !aliasLocked && setAliasInput(slugifyAlias(e.target.value))}
                disabled={aliasLocked}
                placeholder="e.g. fitness-gym-app"
                className="input-cyber disabled:cursor-not-allowed disabled:opacity-60"
                required={!aliasLocked}
                autoFocus={!aliasLocked}
              />
              <p className="mt-1.5 text-xs text-secondary/70">
                Resolve via <code className="rounded bg-white/5 px-1">/public/resolve?alias=…</code>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closePublishModal}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-secondary hover:bg-white/5"
              >
                {aliasLocked ? 'Close' : 'Cancel'}
              </button>
              {!aliasLocked && (
                <button
                  type="submit"
                  disabled={publishing}
                  className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container disabled:opacity-50"
                >
                  {publishing ? 'Publishing…' : 'Publish'}
                </button>
              )}
            </div>
          </form>
        </AppModal>
      )}
    </>
  );
};

export default InviteList;
