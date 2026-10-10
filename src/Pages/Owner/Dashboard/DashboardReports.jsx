import { Link } from 'react-router-dom';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import { formatCurrency } from '../../../helpers/formatUtils';

const SnapshotCard = ({ label, value, icon }) => (
  <GlassCard className="p-4">
    <Icon name={icon} size={18} className="text-primary-container" />
    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-secondary">{label}</p>
    <p className="mt-1 font-display text-xl font-bold leading-none">{value}</p>
  </GlassCard>
);

const DashboardReports = ({ data }) => {
  const snapshots = data?.snapshots || {};
  const reports = data?.reports || [];
  const periodLabel = data?.periodLabel || 'This month';

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">Monthly snapshots for {periodLabel}.</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SnapshotCard label="Active members" value={snapshots.activeMembers ?? 0} icon="group" />
        <SnapshotCard label="New members" value={snapshots.newMembersMonth ?? 0} icon="person_add" />
        <SnapshotCard label="Check-ins" value={snapshots.checkInsMonth ?? 0} icon="qr_code_scanner" />
        <SnapshotCard label="Revenue MTD" value={formatCurrency(snapshots.totalRevenue ?? 0)} icon="payments" />
        <SnapshotCard label="Expiring soon" value={snapshots.expiringSoon ?? 0} icon="event_busy" />
        <SnapshotCard label="Open leads" value={snapshots.openLeads ?? 0} icon="filter_alt" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {reports.map((report) => (
          <GlassCard key={report.id} className="flex flex-col p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-container/10">
                <Icon name={report.icon} size={18} className="text-primary-container" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{report.title}</h3>
                <p className="mt-0.5 text-xs text-secondary">{report.description}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {report.metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-secondary">{metric.label}</p>
                  <p className="mt-1 text-sm font-bold">
                    {report.id === 'revenue' ? formatCurrency(Number(metric.value)) : metric.value}
                  </p>
                </div>
              ))}
            </div>

            <Link
              to={report.actionPath}
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary-fixed hover:underline"
            >
              {report.actionLabel}
              <Icon name="arrow_forward" size={14} />
            </Link>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default DashboardReports;
