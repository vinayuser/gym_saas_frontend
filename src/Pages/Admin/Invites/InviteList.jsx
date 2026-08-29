import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, patchRequest } from '../../../config/dataApi';
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

const InviteList = () => {
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const res = await getRequest(ENDPOINTS.INVITES.LIST, { params });
      setInvites(res.data?.invites || []);
    } catch {
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  const getInviteLink = (token) => `${window.location.origin}/setup/${token}`;

  const handleCopyLink = (invite) => {
    navigator.clipboard.writeText(getInviteLink(invite.token));
    toast.success('Invite link copied');
  };

  const handleMarkSent = async (id) => {
    try {
      await patchRequest(ENDPOINTS.INVITES.MARK_SENT(id));
      toast.success('Marked as sent');
      load();
    } catch {
      /* handled in api */
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Revoke this invite? The link will stop working.')) return;
    try {
      await patchRequest(ENDPOINTS.INVITES.REVOKE(id));
      toast.success('Invite revoked');
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
      searchPlaceholder="Search by email, name, or plan..."
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
              onClick={() => setStatusFilter(s)}
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
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-widest text-secondary/60">
                  <th className="px-6 py-3">Invitee</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Expires</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                      Loading…
                    </td>
                  </tr>
                ) : invites.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                      No invites yet.{' '}
                      <Link to="/admin/invites/new" className="text-primary-container hover:underline">
                        Create your first invite
                      </Link>
                    </td>
                  </tr>
                ) : (
                  invites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-white/[0.02]">
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
                      <td className="px-6 py-4 text-secondary">{formatDate(invite.expiresAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="Copy setup link"
                            onClick={() => handleCopyLink(invite)}
                            className="rounded p-2 text-secondary hover:bg-white/10 hover:text-on-surface"
                          >
                            <Icon name="link" size={18} />
                          </button>
                          {invite.status === 'PENDING' && (
                            <button
                              type="button"
                              title="Mark as sent"
                              onClick={() => handleMarkSent(invite.id)}
                              className="rounded p-2 text-secondary hover:bg-white/10"
                            >
                              <Icon name="send" size={18} />
                            </button>
                          )}
                          {invite.status !== 'ACCEPTED' && invite.status !== 'REVOKED' && (
                            <button
                              type="button"
                              title="Revoke"
                              onClick={() => handleRevoke(invite.id)}
                              className="rounded p-2 text-error hover:bg-error/10"
                            >
                              <Icon name="block" size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </AdminPageShell>
  );
};

export default InviteList;
