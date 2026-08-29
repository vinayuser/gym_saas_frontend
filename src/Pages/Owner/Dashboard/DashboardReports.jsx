import { Link } from 'react-router-dom';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import { formatCurrency } from '../../../helpers/formatUtils';

const SnapshotCard = ({ label, value, icon }) => (
  <GlassCard className="rounded-xl p-5">
    <Icon name={icon} className="text-primary-container" />
    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-secondary">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold">{value}</p>
  </GlassCard>
);

const DashboardReports = ({ data }) => {
  const snapshots = data?.snapshots || {};
  const reports = data?.reports || [];
  const periodLabel = data?.periodLabel || 'This month';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Reports</h1>
        <p className="mt-1 text-secondary/70">
          Monthly snapshots and quick links to operational reports for {periodLabel}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SnapshotCard label="Active members" value={snapshots.activeMembers ?? 0} icon="group" />
        <SnapshotCard label="New members" value={snapshots.newMembersMonth ?? 0} icon="person_add" />
        <SnapshotCard label="Check-ins" value={snapshots.checkInsMonth ?? 0} icon="qr_code_scanner" />
        <SnapshotCard
          label="Revenue MTD"
          value={formatCurrency(snapshots.totalRevenue ?? 0)}
          icon="payments"
        />
        <SnapshotCard label="Expiring soon" value={snapshots.expiringSoon ?? 0} icon="event_busy" />
        <SnapshotCard label="Open leads" value={snapshots.openLeads ?? 0} icon="filter_alt" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {reports.map((report) => (
          <GlassCard key={report.id} className="flex flex-col rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container/10">
                <Icon name={report.icon} className="text-primary-container" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-semibold">{report.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-secondary">{report.description}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {report.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-secondary">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {report.id === 'revenue' && metric.label === 'Total revenue'
                      ? formatCurrency(Number(metric.value))
                      : report.id === 'revenue' &&
                          (metric.label === 'Membership' || metric.label === 'Store + invoices')
                        ? formatCurrency(Number(metric.value))
                        : metric.value}
                  </p>
                </div>
              ))}
            </div>

            <Link
              to={report.actionPath}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-fixed hover:underline"
            >
              {report.actionLabel}
              <Icon name="arrow_forward" size={18} />
            </Link>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="rounded-xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-xl font-semibold">Detailed finance exports</h3>
            <p className="mt-1 text-sm text-secondary">
              Ledger reports, GST breakdown, and exportable finance data live in the Finances module.
            </p>
          </div>
          <Link
            to="/owner/finances/reports"
            className="neon-glow inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-fixed px-6 py-3 text-sm font-bold text-on-primary-fixed"
          >
            Open finance reports
            <Icon name="assessment" size={18} />
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default DashboardReports;
