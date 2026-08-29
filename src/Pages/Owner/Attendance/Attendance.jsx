import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import StatCard from '../../../components/fitsphere/StatCard';
import PageLoader from '../../../components/Loader/PageLoader';
import { formatDateTime } from '../../../helpers/formatUtils';

const Attendance = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.ATTENDANCE.LIST(currentGym.id))
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [currentGym?.id]);

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch.</GlassCard>
      </OwnerPageShell>
    );
  }

  if (loading) return <PageLoader show message="Loading attendance..." />;

  const stats = data?.stats || {};
  const records = data?.records || [];
  const capacity = stats.capacity || 150;
  const inside = stats.currentlyInside || 0;
  const pct = Math.round((inside / capacity) * 100);

  const hours = Array.from({ length: 16 }, (_, i) => i + 6);
  const hourlyMap = Object.fromEntries((stats.hourly || []).map((h) => [h.hour, h.count]));

  return (
    <OwnerPageShell showSearch={false}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Live Attendance Dashboard</h1>
          <p className="mt-1 text-secondary/70">Real-time check-ins and facility capacity.</p>
        </div>

        <GlassCard className="flex flex-col items-center gap-4 p-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container/20">
              <Icon name="qr_code_scanner" size={32} className="text-primary-container" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-container">
                System Active
              </p>
              <h2 className="text-xl font-bold">Biometric QR Ready</h2>
              <p className="text-sm text-secondary">Members can scan at the front desk terminal.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
              Force Scan
            </button>
            <button type="button" className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
              Reset Terminal
            </button>
          </div>
        </GlassCard>

        <div className="grid gap-6 md:grid-cols-4">
          <StatCard label="Currently Inside" value={`${inside}/${capacity}`} icon="groups" accent sub={`${pct}% load`} />
          <StatCard label="Check-ins Today" value={stats.totalToday || 0} icon="login" />
          <StatCard label="Active Members" value={stats.memberTotal || '—'} icon="person" />
          <StatCard label="Predicted Peak" value="18:30" icon="schedule" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <GlassCard className="p-6 lg:col-span-2">
            <h3 className="mb-4 font-semibold">Daily Attendance Trend</h3>
            <div className="flex h-40 items-end gap-1">
              {hours.map((h) => {
                const count = hourlyMap[h] || 0;
                const max = Math.max(...hours.map((hr) => hourlyMap[hr] || 0), 1);
                return (
                  <div key={h} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-primary-container/80"
                      style={{ height: `${(count / max) * 100}%`, minHeight: count ? 4 : 0 }}
                    />
                    <span className="text-[9px] text-secondary">{h}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
          <GlassCard className="flex flex-col items-center justify-center p-6">
            <div
              className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary-container/30"
              style={{
                background: `conic-gradient(#c3f400 ${pct}%, rgba(255,255,255,0.05) 0)`,
              }}
            >
              <span className="rounded-full bg-surface px-4 py-2 text-2xl font-bold">{pct}%</span>
            </div>
            <p className="mt-3 text-sm text-secondary">Live capacity</p>
          </GlassCard>
        </div>

        <GlassCard className="overflow-hidden p-0">
          <div className="border-b border-white/5 p-4">
            <h3 className="font-semibold">Live Check-in Feed</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase text-secondary/60">
                <th className="px-6 py-3">Member</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-secondary">
                    No check-ins today yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <p className="font-medium">{r.memberName}</p>
                      <p className="text-xs text-secondary">{r.member?.memberCode}</p>
                    </td>
                    <td className="px-6 py-4 text-secondary">{r.planName}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-primary-container/20 px-2 py-0.5 text-xs font-semibold text-primary-container">
                        ACTIVE
                      </span>
                    </td>
                    <td className="px-6 py-4 text-secondary">{formatDateTime(r.checkInAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </OwnerPageShell>
  );
};

export default Attendance;
