import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import { formatLeadStatus, MembersLineChart, PlanPieChart, SimpleBarChart } from './dashboardCharts';
import { formatCurrency } from '../../../helpers/formatUtils';

const SummaryTile = ({ label, value, icon }) => (
  <GlassCard className="p-4">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary">{label}</span>
      <Icon name={icon} size={18} className="text-primary-container" />
    </div>
    <p className="mt-2 font-display text-2xl font-bold leading-none">{value}</p>
  </GlassCard>
);

const DashboardAnalytics = ({ data }) => {
  const summary = data?.summary || {};
  const memberTrend = data?.memberTrend || [];
  const weekdayAttendance = data?.weekdayAttendance || [];
  const revenueTrend = (data?.revenueTrend || []).map((row) => ({
    ...row,
    count: row.amount,
  }));
  const leadsByStatus = data?.leadsByStatus || [];
  const planMix = (data?.planMix || []).map((p) => ({ name: p.plan, count: p.count }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Active members" value={summary.activeMembers ?? 0} icon="group" />
        <SummaryTile label="New (30 days)" value={summary.newMembers30d ?? 0} icon="person_add" />
        <SummaryTile label="Check-ins (30d)" value={summary.totalCheckIns30d ?? 0} icon="qr_code_scanner" />
        <SummaryTile label="Avg daily check-ins" value={summary.avgDailyCheckIns ?? 0} icon="insights" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold">New members</h3>
          <p className="mb-2 text-xs text-secondary">Sign-ups over the last 6 months</p>
          <MembersLineChart data={memberTrend} />
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold">Revenue trend</h3>
          <p className="mb-2 text-xs text-secondary">Membership, store, and invoice income</p>
          <SimpleBarChart
            data={revenueTrend.map((row) => ({ label: row.label, count: row.amount ?? row.count }))}
            name="Revenue"
          />
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold">Check-ins by weekday</h3>
          <p className="mb-2 text-xs text-secondary">Last 30 days</p>
          <SimpleBarChart data={weekdayAttendance} name="Check-ins" />
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-sm font-semibold">Lead pipeline</h3>
          <p className="mb-3 text-xs text-secondary">Enquiries grouped by status</p>
          {leadsByStatus.length === 0 ? (
            <p className="py-8 text-sm text-secondary">No leads recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {leadsByStatus.map((lead) => (
                <div key={lead.status}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span>{formatLeadStatus(lead.status)}</span>
                    <span className="font-semibold">{lead.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-primary-fixed/80"
                      style={{
                        width: `${Math.max((lead.count / Math.max(summary.totalLeads, 1)) * 100, 6)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold">Active plan mix</h3>
        <p className="mb-3 text-xs text-secondary">Share of members on each membership plan</p>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
          <div className="h-[240px] w-full min-w-0">
            <PlanPieChart data={planMix} />
          </div>
          <div className="space-y-2">
            {planMix.length === 0 ? (
              <p className="text-sm text-secondary">No active memberships yet.</p>
            ) : (
              planMix.map((plan) => {
                const total = planMix.reduce((sum, row) => sum + (row.count || 0), 0) || 1;
                const pct = Math.round(((plan.count || 0) / total) * 100);
                return (
                  <div key={plan.name} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-medium">{plan.name}</span>
                      <span className="shrink-0 tabular-nums text-secondary">{plan.count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-primary-fixed" style={{ width: `${Math.max(pct, 4)}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-secondary">{pct}% of active members</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default DashboardAnalytics;
