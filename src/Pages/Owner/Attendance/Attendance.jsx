import { useEffect, useState } from 'react';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, postRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import StatCard from '../../../components/fitsphere/StatCard';
import SectionLoader from '../../../components/Loader/SectionLoader';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  tableRowNumber,
} from '../../../components/fitsphere/TableShell';
import { formatDateTime } from '../../../helpers/formatUtils';

const Attendance = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [listSearch, setListSearch] = useState('');
  const debouncedListSearch = useDebouncedValue(listSearch);
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [qrText, setQrText] = useState('');
  const [busy, setBusy] = useState(false);
  const limit = 10;

  const loadList = () => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.ATTENDANCE.LIST(currentGym.id), {
      params: { page, limit, search: debouncedListSearch || undefined },
    })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedListSearch, currentGym?.id]);

  useEffect(() => {
    if (!currentGym?.id) return;
    loadList();
  }, [currentGym?.id, page, debouncedListSearch]);

  useEffect(() => {
    if (!currentGym?.id || query.trim().length < 2) {
      setMatches([]);
      return undefined;
    }
    const handle = setTimeout(() => {
      getRequest(ENDPOINTS.ATTENDANCE.LOOKUP(currentGym.id), { params: { q: query } }).then((res) => {
        setMatches(res.data?.members || []);
      });
    }, 250);
    return () => clearTimeout(handle);
  }, [currentGym?.id, query]);

  const doCheckIn = async (body) => {
    if (!currentGym?.id) return;
    setBusy(true);
    try {
      const res = await postRequest(ENDPOINTS.ATTENDANCE.CHECK_IN(currentGym.id), body);
      toast.success(`${res.data?.memberName || 'Member'} · ${res.data?.action === 'CHECK_OUT' ? 'checked out' : 'checked in'}`);
      setQuery('');
      setQrText('');
      setMatches([]);
      loadList();
    } finally {
      setBusy(false);
    }
  };

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch.</GlassCard>
      </OwnerPageShell>
    );
  }

  const stats = data?.stats || {};
  const records = data?.records || [];
  const capacity = stats.capacity || 150;
  const inside = stats.currentlyInside || 0;
  const pct = Math.round((inside / capacity) * 100);
  const trend = data?.trend || [];
  const maxTrend = Math.max(...trend.map((item) => item.count), 1);

  return (
    <OwnerPageShell showSearch={false}>
      <SectionLoader show={loading && !data}>
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <StatCard label="Currently Inside" value={`${inside}/${capacity}`} icon="groups" accent sub={`${pct}% load`} />
          <StatCard label="Check-ins Today" value={stats.totalToday || 0} icon="login" />
          <StatCard label="Active Members" value={stats.memberTotal || '—'} icon="person" />
          <StatCard label="Predicted Peak" value={stats.predictedPeak || '—'} icon="schedule" />
        </div>

        <GlassCard className="mb-4 space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">Front desk check-in</h3>
            <Link to="/owner/day-pass" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">
              Day passes
            </Link>
          </div>
          <div className="grid items-start gap-3 md:grid-cols-2">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, phone, or member code"
                className="input-cyber w-full rounded-lg px-3 py-2"
              />
              {matches.length > 0 ? (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-surface-container shadow-xl">
                  {matches.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      disabled={busy}
                      onClick={() => doCheckIn({ memberId: member.id, source: 'FRONTDESK' })}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-white/5"
                    >
                      <span>
                        {member.firstName} {member.lastName}
                        <span className="ml-2 text-xs text-secondary">{member.memberCode}</span>
                      </span>
                      <span className="text-xs text-primary-fixed">Check in</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (qrText.trim()) {
                  const raw = qrText.trim();
                  doCheckIn(
                    raw.startsWith('{')
                      ? { qrPayload: raw, source: 'QR_CODE' }
                      : { memberCode: raw, source: 'QR_CODE' }
                  );
                }
              }}
              className="flex gap-2 self-start"
            >
              <input
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="Paste QR payload or member code"
                className="input-cyber flex-1 rounded-lg px-3 py-2"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-primary-fixed px-4 text-sm font-bold text-on-primary-fixed"
              >
                Scan
              </button>
            </form>
          </div>
        </GlassCard>

        <div className="mb-4 grid gap-3 lg:grid-cols-3">
          <GlassCard className="p-4 lg:col-span-2">
            <h3 className="mb-3 text-sm font-semibold">Check-ins, last 14 days</h3>
            <div className="flex h-40 items-end gap-1">
              {trend.length === 0 ? (
                <p className="text-sm text-secondary">No check-ins in the last 14 days.</p>
              ) : (
                trend.map((item) => {
                  const height = item.count ? Math.max((item.count / maxTrend) * 100, 14) : 0;
                  return (
                    <div key={item.label} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                      <span className="mb-1 text-center text-[10px] font-semibold text-secondary">{item.count || ''}</span>
                      <div
                        className="w-full rounded-t bg-primary-container"
                        style={{ height: `${height}%` }}
                        title={`${item.label}: ${item.count}`}
                      />
                      <span className="mt-2 truncate text-center text-[10px] text-secondary">{item.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
          <GlassCard className="flex flex-col items-center justify-center p-4">
            <div
              className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary-container/30"
              style={{ background: `conic-gradient(#c3f400 ${pct}%, rgba(255,255,255,0.05) 0)` }}
            >
              <span className="rounded-full bg-surface px-4 py-2 text-2xl font-bold">{pct}%</span>
            </div>
            <p className="mt-3 text-sm text-secondary">Live capacity</p>
          </GlassCard>
        </div>

        <TableShell
          title="Recent check-ins"
          search={listSearch}
          onSearch={setListSearch}
          searchPlaceholder="Search member name, code, or phone..."
          page={page}
          total={data?.pagination?.total || 0}
          limit={limit}
          loading={loading}
          onPage={setPage}
          noun="check-ins"
        >
          <table className={`${TABLE_CLASS} min-w-[720px]`}>
            <thead>
              <tr className={THEAD_ROW}>
                <th className={`w-12 ${TH}`}>#</th>
                <th className={TH}>Member</th>
                <th className={TH}>Plan</th>
                <th className={TH}>Status</th>
                <th className={TH}>Time In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${TD} py-8 text-center text-secondary`}>
                    No check-ins in the last 30 days.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                      {tableRowNumber(page, limit, i)}
                    </td>
                    <td className={TD}>
                      <p className="font-medium">{r.memberName}</p>
                      <p className="text-xs text-secondary">{r.member?.memberCode}</p>
                    </td>
                    <td className={`${TD} text-secondary`}>{r.planName}</td>
                    <td className={TD}>
                      <span className="rounded-full bg-primary-container/20 px-2 py-0.5 text-xs font-semibold text-primary-container">
                        ACTIVE
                      </span>
                    </td>
                    <td className={`${TD} text-secondary`}>{formatDateTime(r.checkInAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>
      </SectionLoader>
    </OwnerPageShell>
  );
};

export default Attendance;
