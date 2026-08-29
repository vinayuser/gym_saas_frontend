import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import { BarChart, formatLeadStatus } from './dashboardCharts';

const SummaryTile = ({ label, value, icon }) => (
  <GlassCard className="rounded-xl p-5">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide text-secondary">{label}</span>
      <Icon name={icon} size={20} className="text-primary-container" />
    </div>
    <p className="mt-3 font-display text-3xl font-bold">{value}</p>
  </GlassCard>
);

const DashboardAnalytics = ({ data }) => {
  const summary = data?.summary || {};
  const memberTrend = data?.memberTrend || [];
  const weekdayAttendance = data?.weekdayAttendance || [];
  const revenueTrend = data?.revenueTrend || [];
  const leadsByStatus = data?.leadsByStatus || [];
  const planMix = data?.planMix || [];
  const maxPlan = Math.max(...planMix.map((p) => p.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Analytics</h1>
        <p className="mt-1 text-secondary/70">
          Member growth, attendance patterns, revenue trends, and lead pipeline for your gym.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Active members" value={summary.activeMembers ?? 0} icon="group" />
        <SummaryTile label="New (30 days)" value={summary.newMembers30d ?? 0} icon="person_add" />
        <SummaryTile label="Check-ins (30d)" value={summary.totalCheckIns30d ?? 0} icon="qr_code_scanner" />
        <SummaryTile label="Avg daily check-ins" value={summary.avgDailyCheckIns ?? 0} icon="insights" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="rounded-xl p-6">
          <h3 className="font-display text-xl font-semibold">New members</h3>
          <p className="mt-1 text-sm text-secondary">Sign-ups over the last 6 months</p>
          <div className="mt-8">
            <BarChart items={memberTrend} accent />
          </div>
        </GlassCard>

        <GlassCard className="rounded-xl p-6">
          <h3 className="font-display text-xl font-semibold">Revenue trend</h3>
          <p className="mt-1 text-sm text-secondary">Membership, store, and invoice income</p>
          <div className="mt-8">
            <BarChart
              items={revenueTrend}
              valueKey="amount"
              formatValue={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            />
          </div>
        </GlassCard>

        <GlassCard className="rounded-xl p-6">
          <h3 className="font-display text-xl font-semibold">Check-ins by weekday</h3>
          <p className="mt-1 text-sm text-secondary">Last 30 days — busiest days of the week</p>
          <div className="mt-8">
            <BarChart items={weekdayAttendance} />
          </div>
        </GlassCard>

        <GlassCard className="rounded-xl p-6">
          <h3 className="font-display text-xl font-semibold">Lead pipeline</h3>
          <p className="mt-1 text-sm text-secondary">Enquiries grouped by status</p>
          <div className="mt-6 space-y-4">
            {leadsByStatus.length === 0 ? (
              <p className="text-sm text-secondary">No leads recorded yet.</p>
            ) : (
              leadsByStatus.map((lead) => (
                <div key={lead.status}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span>{formatLeadStatus(lead.status)}</span>
                    <span className="font-semibold">{lead.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-primary-fixed/80"
                      style={{
                        width: `${Math.max((lead.count / Math.max(summary.totalLeads, 1)) * 100, 6)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="rounded-xl p-6">
        <h3 className="font-display text-xl font-semibold">Active plan mix</h3>
        <p className="mt-1 text-sm text-secondary">Share of members on each membership plan</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planMix.length === 0 ? (
            <p className="text-sm text-secondary">No active memberships yet.</p>
          ) : (
            planMix.map((plan) => (
              <div
                key={plan.plan}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{plan.plan}</span>
                  <span className="text-sm font-semibold text-primary-container">{plan.count}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-primary-fixed"
                    style={{ width: `${Math.max((plan.count / maxPlan) * 100, 8)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default DashboardAnalytics;
