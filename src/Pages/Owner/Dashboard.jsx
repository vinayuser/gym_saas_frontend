import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest } from '../../config/dataApi';
import GlassCard from '../../components/fitsphere/GlassCard';
import Icon from '../../components/fitsphere/Icon';
import OwnerPageShell from '../../components/fitsphere/OwnerPageShell';
import PageLoader from '../../components/Loader/PageLoader';
import { formatCurrency, formatDate } from '../../helpers/formatUtils';

const heatmapBarClass = (count, max) => {
  if (!count) return 'bg-white/5';
  const ratio = count / max;
  if (ratio > 0.8) return 'bg-primary-fixed';
  if (ratio > 0.6) return 'bg-primary-fixed/80';
  if (ratio > 0.4) return 'bg-primary-fixed/60';
  if (ratio > 0.2) return 'bg-primary-fixed/40';
  return 'bg-primary-fixed/20';
};

const StatCard = ({ label, value, subText, subIcon, icon }) => (
  <GlassCard className="flex flex-col justify-between rounded-xl p-6">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-widest text-secondary opacity-50">
        {label}
      </span>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed/10">
        <Icon name={icon} className="text-primary-fixed" />
      </div>
    </div>
    <div className="mt-6">
      <h2 className="font-display text-5xl font-bold leading-none tracking-tight">{value}</h2>
      <div className="mt-2 flex items-center gap-1 text-primary-fixed">
        <Icon name={subIcon} size={18} />
        <span className="text-xs font-semibold">{subText}</span>
      </div>
    </div>
  </GlassCard>
);

const ExpirationRow = ({ item }) => (
  <Link
    to={`/owner/members/${item.id}/edit`}
    className="group flex items-center justify-between rounded-lg border-b border-white/5 p-4 transition-colors hover:bg-white/5"
  >
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-xs font-bold">
        {item.firstName?.[0]}
        {item.lastName?.[0]}
      </div>
      <div>
        <p className="text-sm font-bold">
          {item.firstName} {item.lastName}
        </p>
        <p className="text-sm text-secondary opacity-50">{item.expiresIn}</p>
      </div>
    </div>
    <Icon
      name="chevron_right"
      className="text-secondary opacity-0 transition-opacity group-hover:opacity-100"
    />
  </Link>
);

const Dashboard = () => {
  const { currentGym } = useSelector((state) => state.gym);
  const [activeTab, setActiveTab] = useState('Overview');
  const [heatmapPeriod, setHeatmapPeriod] = useState('day');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const tabs = ['Overview', 'Analytics', 'Reports'];

  useEffect(() => {
    if (!currentGym?.id) return;

    let cancelled = false;
    setLoading(true);

    getRequest(ENDPOINTS.GYMS.DASHBOARD(currentGym.id))
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentGym?.id]);

  const stats = data?.stats;
  const heatmap = data?.heatmap || [];
  const maxHeat = Math.max(...heatmap.map((h) => h.count), 1);

  if (!currentGym) {
    return (
      <OwnerPageShell variant="dashboard" showSearch={false}>
        <GlassCard className="p-8 text-center text-secondary">
          Select a gym branch from the header to view your dashboard.
        </GlassCard>
      </OwnerPageShell>
    );
  }

  if (loading && !data) {
    return <PageLoader show message="Loading dashboard..." />;
  }

  const expirationItems = data?.expirations || [];
  const expirationTotal = stats?.expiringCount ?? expirationItems.length;
  const transactions = data?.transactions || [];

  return (
    <>
      <OwnerPageShell
        variant="dashboard"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showSearch={false}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard
              label="Active Members"
              value={(stats?.activeMembers ?? 0).toLocaleString()}
              subText={`${stats?.memberGrowthPct >= 0 ? '+' : ''}${stats?.memberGrowthPct ?? 0}% this month`}
              subIcon="trending_up"
              icon="group"
            />
            <StatCard
              label="Today's Check-ins"
              value={(stats?.todayCheckIns ?? 0).toLocaleString()}
              subText={`${stats?.checkInCapacityPct ?? 0}% of peak capacity`}
              subIcon="history"
              icon="done_all"
            />
            <StatCard
              label="Monthly Revenue"
              value={formatCurrency(stats?.monthlyRevenue ?? 0)}
              subText="This month"
              subIcon="arrow_upward"
              icon="payments"
            />
          </div>

          <div className="grid grid-cols-12 gap-6">
            <GlassCard className="relative col-span-12 overflow-hidden rounded-xl p-6 lg:col-span-8">
              <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold">Attendance Heatmap</h3>
                  <p className="text-sm text-secondary opacity-60">
                    Real-time gym floor occupancy by hour
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
                  {['day', 'week'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setHeatmapPeriod(p)}
                      className={`rounded px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                        heatmapPeriod === p
                          ? 'bg-primary-fixed text-on-primary-fixed'
                          : 'text-secondary hover:bg-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between px-2 text-xs text-secondary opacity-40">
                  <span>6 AM</span>
                  <span>10 AM</span>
                  <span>2 PM</span>
                  <span>6 PM</span>
                  <span>10 PM</span>
                </div>
                <div
                  className="grid h-64 flex-1 gap-1"
                  style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                >
                  {heatmap.map(({ hour, count }) => (
                    <div
                      key={hour}
                      className={`h-full rounded-sm ${heatmapBarClass(count, maxHeat)}`}
                      title={`${hour}:00 — ${count} check-ins`}
                    />
                  ))}
                </div>
              </div>

              <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-primary-fixed/10 blur-[100px]" />
            </GlassCard>

            <GlassCard className="col-span-12 flex flex-col rounded-xl p-6 lg:col-span-4">
              <div className="mb-10 flex items-center justify-between">
                <h3 className="font-display text-2xl font-semibold">Expirations</h3>
                {expirationTotal > 0 && (
                  <span className="rounded bg-error-container px-2 py-0.5 text-xs font-semibold text-error">
                    High Priority
                  </span>
                )}
              </div>

              <div className="custom-scrollbar flex-1 space-y-0 overflow-y-auto pr-2">
                {expirationItems.length === 0 ? (
                  <p className="py-4 text-sm text-secondary">No memberships expiring in the next 14 days.</p>
                ) : (
                  expirationItems.map((item) => <ExpirationRow key={item.id} item={item} />)
                )}
              </div>

              <Link
                to="/owner/members"
                className="mt-6 block w-full rounded-lg border border-white/10 py-3 text-center text-sm font-medium transition-colors hover:bg-white/5"
              >
                View All ({expirationTotal})
              </Link>
            </GlassCard>

            <GlassCard className="col-span-12 overflow-hidden rounded-xl p-0">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 p-6">
                <h3 className="font-display text-2xl font-semibold">Recent Transactions</h3>
                <Link
                  to="/owner/finances/payments"
                  className="flex items-center gap-1 text-sm font-medium text-primary-fixed hover:underline"
                >
                  View ledger
                  <Icon name="arrow_forward" size={18} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02]">
                    <tr>
                      {['Transaction ID', 'Member', 'Plan', 'Date', 'Amount', 'Status'].map((col) => (
                        <th
                          key={col}
                          className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-secondary opacity-50"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-secondary">
                          No transactions yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="transition-colors hover:bg-white/5">
                          <td className="px-6 py-4 text-sm font-medium">{tx.id}</td>
                          <td className="px-6 py-4 text-sm font-medium">{tx.member}</td>
                          <td className="px-6 py-4 text-sm text-secondary">{tx.plan}</td>
                          <td className="px-6 py-4 text-sm text-secondary">{formatDate(tx.date)}</td>
                          <td className="px-6 py-4 text-sm font-medium">{formatCurrency(tx.amount)}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded px-2 py-1 text-xs font-bold uppercase tracking-wider ${
                                tx.status === 'Completed'
                                  ? 'bg-primary-fixed/20 text-primary-fixed'
                                  : 'bg-secondary-container text-secondary'
                              }`}
                            >
                              {tx.status}
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
      </OwnerPageShell>

      <button
        type="button"
        className="neon-glow fixed bottom-10 right-10 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed shadow-2xl transition-transform hover:scale-110 active:scale-95"
        aria-label="Quick action"
      >
        <Icon name="bolt" size={32} />
      </button>
    </>
  );
};

export default Dashboard;
