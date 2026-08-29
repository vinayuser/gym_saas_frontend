import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ invites: 0, pending: 0, owners: 0 });

  useEffect(() => {
    Promise.all([
      getRequest(ENDPOINTS.INVITES.LIST, { params: { limit: 200 } }),
      getRequest(ENDPOINTS.GYM_OWNERS.LIST, { params: { limit: 200 } }),
    ])
      .then(([invRes, ownerRes]) => {
        const invites = invRes.data?.invites || [];
        const pending = invites.filter((i) =>
          ['PENDING', 'SENT', 'PAYMENT_PENDING'].includes(i.status)
        ).length;
        setStats({
          invites: invites.length,
          pending,
          owners: (ownerRes.data?.owners || []).length,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <AdminPageShell showSearch={false}>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Platform Overview</h1>
            <p className="mt-1 text-secondary/70">
              Manage gym owner invites, Razorpay onboarding, and tenants.
            </p>
          </div>
          <Link
            to="/admin/invites/new"
            className="cyber-glow flex items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-3 text-sm font-bold text-on-primary-container"
          >
            <Icon name="mail" size={20} />
            Send Gym Invite
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <GlassCard className="p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">
              Total Invites
            </p>
            <p className="mt-2 font-display text-4xl font-bold text-primary-container">{stats.invites}</p>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">
              Pending / In progress
            </p>
            <p className="mt-2 font-display text-4xl font-bold">{stats.pending}</p>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">
              Gym Owners
            </p>
            <p className="mt-2 font-display text-4xl font-bold">{stats.owners}</p>
          </GlassCard>
        </div>

        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold">Quick actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/admin/invites"
              className="flex items-center gap-3 rounded-lg border border-white/10 p-4 transition hover:bg-white/5"
            >
              <Icon name="list_alt" className="text-primary-container" />
              <span>View all gym invites</span>
            </Link>
            <Link
              to="/admin/gym-owners"
              className="flex items-center gap-3 rounded-lg border border-white/10 p-4 transition hover:bg-white/5"
            >
              <Icon name="groups" className="text-primary-container" />
              <span>Manage gym owners</span>
            </Link>
            <Link
              to="/admin/transactions"
              className="flex items-center gap-3 rounded-lg border border-white/10 p-4 transition hover:bg-white/5"
            >
              <Icon name="payments" className="text-primary-container" />
              <span>View payment transactions</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    </AdminPageShell>
  );
};

export default SuperAdminDashboard;
