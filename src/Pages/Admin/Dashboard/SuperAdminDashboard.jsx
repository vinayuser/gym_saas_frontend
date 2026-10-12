import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import SectionLoader from '../../../components/Loader/SectionLoader';
import { TABLE_CLASS, TD, TH, THEAD_ROW, tableRowNumber } from '../../../components/fitsphere/TableShell';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import { formatCurrency, formatDate } from '../../../helpers/formatUtils';
import {
  formatLeadStatus,
  MembersLineChart,
  PlanPieChart,
  SimpleBarChart,
} from '../../Owner/Dashboard/dashboardCharts';

const StatCard = ({ label, value, sub, icon }) => (
  <GlassCard className="p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">{label}</p>
        <p className="mt-1 font-display text-2xl font-bold leading-none">{value}</p>
        {sub ? <p className="mt-1.5 text-xs text-secondary">{sub}</p> : null}
      </div>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-fixed/10">
        <Icon name={icon} size={18} className="text-primary-fixed" />
      </div>
    </div>
  </GlassCard>
);

const statusClass = (status) => {
  if (status === 'COMPLETED' || status === 'ACCEPTED' || status === 'ACTIVE') {
    return 'bg-primary-fixed/20 text-primary-fixed';
  }
  if (status === 'OPEN' || status === 'PENDING' || status === 'SENT' || status === 'PAYMENT_PENDING') {
    return 'bg-amber-500/15 text-amber-300';
  }
  if (status === 'IN_PROGRESS') return 'bg-sky-500/15 text-sky-300';
  if (status === 'FAILED' || status === 'REVOKED') return 'bg-error-container/80 text-error';
  return 'bg-secondary-container text-secondary';
};

const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRequest(ENDPOINTS.ADMIN.DASHBOARD)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const revenue = charts.revenue || [];
  const inviteTrend = charts.invites || [];
  const inviteStatus = (charts.inviteStatus || []).map((row) => ({
    name: formatLeadStatus(row.status),
    count: row.count,
  }));
  const tickets = (charts.tickets || []).map((row) => ({
    name: formatLeadStatus(row.status),
    count: row.count,
  }));
  const transactions = data?.transactions || [];
  const pendingInvites = data?.pendingInvites || [];
  const openTickets = data?.tickets || [];

  return (
    <AdminPageShell showSearch={false}>
      <SectionLoader show={loading && !data}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-secondary">Platform activity across invites, gyms, and billing.</p>
            <Link
              to="/admin/invites/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2 text-xs font-bold text-on-primary-container"
            >
              <Icon name="mail" size={16} />
              Send invite
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Businesses"
              value={(stats.tenants ?? 0).toLocaleString()}
              sub={`${stats.gyms ?? 0} gyms · ${stats.publishedGyms ?? 0} published`}
              icon="storefront"
            />
            <StatCard
              label="Pending invites"
              value={(stats.pendingInvites ?? 0).toLocaleString()}
              sub={`${stats.invitesThisMonth ?? 0} sent this month · ${stats.invites ?? 0} total`}
              icon="mark_email_unread"
            />
            <StatCard
              label="Revenue this month"
              value={formatCurrency(stats.monthlyRevenue ?? 0)}
              sub={`${formatCurrency(stats.totalRevenue ?? 0)} all time`}
              icon="payments"
            />
            <StatCard
              label="Needs attention"
              value={(stats.pendingInvites ?? 0) + (stats.openTickets ?? 0)}
              sub={`${stats.openTickets ?? 0} open tickets · ${stats.owners ?? 0} owners`}
              icon="priority_high"
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-12">
            <GlassCard className="p-4 lg:col-span-8">
              <h3 className="text-sm font-semibold">Platform revenue (6 months)</h3>
              <p className="mb-3 text-xs text-secondary">Completed SaaS payments</p>
              {revenue.length === 0 ? (
                <p className="py-12 text-center text-sm text-secondary">No payments recorded yet.</p>
              ) : (
                <SimpleBarChart
                  data={revenue}
                  valueKey="amount"
                  name="Revenue"
                  formatter={(value) => formatCurrency(value)}
                />
              )}
            </GlassCard>

            <GlassCard className="p-4 lg:col-span-4">
              <h3 className="text-sm font-semibold">Invite pipeline</h3>
              <p className="mb-2 text-xs text-secondary">All invites by status</p>
              <div className="h-[220px]">
                <PlanPieChart data={inviteStatus} emptyLabel="No invites yet." />
              </div>
            </GlassCard>

            <GlassCard className="p-4 lg:col-span-4">
              <h3 className="text-sm font-semibold">New invites</h3>
              <p className="mb-2 text-xs text-secondary">Created over the last 6 months</p>
              {inviteTrend.length === 0 ? (
                <p className="py-12 text-center text-sm text-secondary">No invites yet.</p>
              ) : (
                <MembersLineChart data={inviteTrend} name="Invites" />
              )}
            </GlassCard>

            <GlassCard className="flex flex-col p-4 lg:col-span-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Pending invites</h3>
                <Link to="/admin/invites" className="text-xs font-semibold text-primary-fixed hover:underline">
                  View all
                </Link>
              </div>
              <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto">
                {pendingInvites.length === 0 ? (
                  <p className="py-6 text-sm text-secondary">No pending invites.</p>
                ) : (
                  pendingInvites.map((invite) => (
                    <Link
                      key={invite.id}
                      to={`/admin/invites/${invite.id}`}
                      className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-white/5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{invite.name}</p>
                        <p className="truncate text-xs text-secondary">{invite.email}</p>
                      </div>
                      <span className={`ml-2 shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass(invite.status)}`}>
                        {formatLeadStatus(invite.status)}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col p-4 lg:col-span-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Open tickets</h3>
                <Link to="/admin/support" className="text-xs font-semibold text-primary-fixed hover:underline">
                  Inbox
                </Link>
              </div>
              {tickets.length ? (
                <div className="mb-3 h-[220px] max-w-xs">
                  <PlanPieChart data={tickets} emptyLabel="No tickets yet." />
                </div>
              ) : null}
              <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto">
                {openTickets.length === 0 ? (
                  <p className="py-4 text-sm text-secondary">No open tickets.</p>
                ) : (
                  openTickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      to="/admin/support"
                      className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-white/5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{ticket.subject}</p>
                        <p className="truncate text-xs text-secondary">{ticket.sender}</p>
                      </div>
                      <span className={`ml-2 shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass(ticket.status)}`}>
                        {formatLeadStatus(ticket.status)}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </GlassCard>

            <GlassCard className="overflow-hidden p-0 lg:col-span-12">
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <h3 className="text-sm font-semibold">Recent payments</h3>
                <Link to="/admin/transactions" className="text-xs font-semibold text-primary-fixed hover:underline">
                  View ledger
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className={`${TABLE_CLASS} min-w-[640px]`}>
                  <thead>
                    <tr className={THEAD_ROW}>
                      <th className={`w-12 ${TH}`}>#</th>
                      <th className={TH}>Business</th>
                      <th className={TH}>Provider</th>
                      <th className={TH}>Date</th>
                      <th className={TH}>Amount</th>
                      <th className={TH}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={`${TD} py-8 text-center text-secondary`}>
                          No platform payments yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx, i) => (
                        <tr key={`${tx.id}-${i}`} className="hover:bg-white/[0.02]">
                          <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                            {tableRowNumber(1, transactions.length, i)}
                          </td>
                          <td className={`${TD} font-medium`}>{tx.tenant}</td>
                          <td className={`${TD} text-secondary`}>{tx.provider}</td>
                          <td className={`${TD} text-secondary`}>{formatDate(tx.date)}</td>
                          <td className={`${TD} font-medium`}>{formatCurrency(tx.amount)}</td>
                          <td className={TD}>
                            <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass(tx.status)}`}>
                              {formatLeadStatus(tx.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </div>
      </SectionLoader>
    </AdminPageShell>
  );
};

export default SuperAdminDashboard;
