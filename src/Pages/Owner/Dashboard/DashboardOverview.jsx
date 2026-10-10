import { Link } from 'react-router-dom';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import { TABLE_CLASS, TD, TH, THEAD_ROW, tableRowNumber } from '../../../components/fitsphere/TableShell';
import { formatCurrency, formatDate } from '../../../helpers/formatUtils';
import { AttendanceAreaChart, MembersLineChart, PlanPieChart, RevenueBarChart } from './dashboardCharts';

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

const DashboardOverview = ({ data, heatmapPeriod, onHeatmapPeriodChange }) => {
  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const attendance = charts.attendance || data?.heatmap || [];
  const revenue = charts.revenue || [];
  const members = charts.members || [];
  const plans = charts.plans || [];
  const expirationItems = data?.expirations || [];
  const expirationTotal = stats.expiringCount ?? expirationItems.length;
  const transactions = data?.transactions || [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active members"
          value={(stats.activeMembers ?? 0).toLocaleString()}
          sub={`${stats.memberGrowthPct >= 0 ? '+' : ''}${stats.memberGrowthPct ?? 0}% vs last month`}
          icon="group"
        />
        <StatCard
          label="Today's check-ins"
          value={(stats.todayCheckIns ?? 0).toLocaleString()}
          sub={`${stats.currentlyInside ?? 0} inside now`}
          icon="qr_code_scanner"
        />
        <StatCard
          label="Revenue this month"
          value={formatCurrency(stats.monthlyRevenue ?? 0)}
          sub={`${formatCurrency(stats.membershipRevenue ?? 0)} membership`}
          icon="payments"
        />
        <StatCard
          label="Needs attention"
          value={(stats.expiringCount ?? 0) + (stats.openLeads ?? 0)}
          sub={`${stats.expiringCount ?? 0} expiring · ${stats.openLeads ?? 0} open leads`}
          icon="priority_high"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <GlassCard className="p-4 lg:col-span-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Attendance</h3>
              <p className="text-xs text-secondary">
                {heatmapPeriod === 'week' ? 'Check-ins over the last 7 days' : 'Check-ins today by hour'}
              </p>
            </div>
            <div className="flex rounded-lg bg-white/5 p-0.5">
              {['day', 'week'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onHeatmapPeriodChange(p)}
                  className={`rounded px-3 py-1 text-xs font-semibold capitalize ${
                    heatmapPeriod === p ? 'bg-primary-fixed text-on-primary-fixed' : 'text-secondary hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {attendance.length === 0 ? (
            <p className="py-12 text-center text-sm text-secondary">No check-ins in this range yet.</p>
          ) : (
            <AttendanceAreaChart data={attendance} />
          )}
        </GlassCard>

        <GlassCard className="flex flex-col p-4 lg:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Expiring soon</h3>
            {expirationTotal > 0 ? (
              <span className="rounded bg-error-container/80 px-2 py-0.5 text-[10px] font-semibold text-error">
                {expirationTotal} in 14 days
              </span>
            ) : null}
          </div>
          <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto">
            {expirationItems.length === 0 ? (
              <p className="py-6 text-sm text-secondary">No memberships expiring in the next 14 days.</p>
            ) : (
              expirationItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/owner/members/${item.id}/edit`}
                  className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {item.firstName} {item.lastName}
                    </p>
                    <p className="text-xs text-secondary">{item.planName || item.expiresIn}</p>
                  </div>
                  <span className="text-xs text-secondary">{item.expiresIn}</span>
                </Link>
              ))
            )}
          </div>
          <Link to="/owner/members" className="mt-3 text-center text-xs font-semibold text-primary-fixed hover:underline">
            View members
          </Link>
        </GlassCard>

        <GlassCard className="p-4 lg:col-span-8">
          <h3 className="text-sm font-semibold">Revenue (6 months)</h3>
          <p className="mb-3 text-xs text-secondary">Membership, store, and invoice income</p>
          {revenue.length === 0 ? (
            <p className="py-12 text-center text-sm text-secondary">No revenue recorded yet.</p>
          ) : (
            <RevenueBarChart data={revenue} />
          )}
        </GlassCard>

        <GlassCard className="p-4 lg:col-span-4">
          <h3 className="text-sm font-semibold">Plan mix</h3>
          <p className="mb-2 text-xs text-secondary">Active memberships by plan</p>
          <PlanPieChart data={plans} />
        </GlassCard>

        <GlassCard className="p-4 lg:col-span-4">
          <h3 className="text-sm font-semibold">New members</h3>
          <p className="mb-2 text-xs text-secondary">Sign-ups over the last 6 months</p>
          {members.length === 0 ? (
            <p className="py-12 text-center text-sm text-secondary">No new members yet.</p>
          ) : (
            <MembersLineChart data={members} />
          )}
        </GlassCard>

        <GlassCard className="overflow-hidden p-0 lg:col-span-8">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <h3 className="text-sm font-semibold">Recent payments</h3>
            <Link to="/owner/finances/payments" className="text-xs font-semibold text-primary-fixed hover:underline">
              View ledger
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className={`${TABLE_CLASS} min-w-[640px]`}>
              <thead>
                <tr className={THEAD_ROW}>
                  <th className={`w-12 ${TH}`}>#</th>
                  <th className={TH}>Ref</th>
                  <th className={TH}>Member</th>
                  <th className={TH}>Plan</th>
                  <th className={TH}>Date</th>
                  <th className={TH}>Amount</th>
                  <th className={TH}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`${TD} py-8 text-center text-secondary`}>
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx, i) => (
                    <tr key={`${tx.id}-${i}`} className="hover:bg-white/[0.02]">
                      <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                        {tableRowNumber(1, transactions.length, i)}
                      </td>
                      <td className={`${TD} font-medium`}>{tx.id}</td>
                      <td className={TD}>{tx.member}</td>
                      <td className={`${TD} text-secondary`}>{tx.plan}</td>
                      <td className={`${TD} text-secondary`}>{formatDate(tx.date)}</td>
                      <td className={`${TD} font-medium`}>{formatCurrency(tx.amount)}</td>
                      <td className={TD}>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
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
  );
};

export default DashboardOverview;
