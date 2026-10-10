import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, postRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
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
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { formatCurrency, formatDateTime } from '../../../helpers/formatUtils';

const EMPTY = { guestName: '', phone: '', email: '', notes: '' };

const DayPass = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [data, setData] = useState({ passes: [], stats: {}, pagination: { total: 0 } });
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 350);
  const limit = 10;

  const load = () => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.DAY_PASSES.LIST(currentGym.id), {
      params: { page, limit, search: debouncedSearch || undefined },
    })
      .then((res) => setData(res.data || { passes: [], stats: {}, pagination: { total: 0 } }))
      .finally(() => setLoading(false));
  };

  useEffect(load, [currentGym?.id, page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, currentGym?.id]);

  const issue = async (e) => {
    e.preventDefault();
    await postRequest(ENDPOINTS.DAY_PASSES.CREATE(currentGym.id), form);
    toast.success('Day pass issued');
    setForm(EMPTY);
    load();
  };

  const checkIn = async (passId) => {
    await postRequest(ENDPOINTS.DAY_PASSES.CHECK_IN(currentGym.id, passId), {});
    toast.success('Guest checked in');
    load();
  };

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch.</GlassCard>
      </OwnerPageShell>
    );
  }

  const passes = data.passes || [];

  return (
    <SectionLoader show={loading && !passes.length}>
      <OwnerPageShell showSearch={false}>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <StatCard label="Sold today" value={data.stats?.total || 0} icon="confirmation_number" />
          <StatCard label="Checked in" value={data.stats?.checkedIn || 0} icon="login" />
          <StatCard label="Revenue" value={formatCurrency(data.stats?.revenue ?? data.stats?.amount)} icon="payments" />
        </div>

        <GlassCard className="mb-4 p-4">
          <h2 className="mb-3 text-sm font-semibold">Issue walk-in pass</h2>
          <form onSubmit={issue} className="grid gap-3 md:grid-cols-2">
            <input
              required
              placeholder="Guest name"
              value={form.guestName}
              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              className="input-cyber rounded-lg px-3 py-2"
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-cyber rounded-lg px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-cyber rounded-lg px-3 py-2"
            />
            <input
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-cyber rounded-lg px-3 py-2"
            />
            <button type="submit" className="rounded-lg bg-primary-fixed px-4 py-2 text-sm font-bold text-on-primary-fixed md:col-span-2">
              Issue pass · {formatCurrency(currentGym.dayPassPrice || 0)}
            </button>
          </form>
        </GlassCard>

        <TableShell
          title="Day passes"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search guests..."
          page={page}
          total={data.pagination?.total || 0}
          limit={limit}
          loading={loading}
          onPage={setPage}
          noun="passes"
        >
          <table className={`${TABLE_CLASS} min-w-[720px]`}>
            <thead>
              <tr className={THEAD_ROW}>
                <th className={`w-12 ${TH}`}>#</th>
                <th className={TH}>Guest</th>
                <th className={TH}>Amount</th>
                <th className={TH}>Status</th>
                <th className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {passes.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${TD} py-8 text-center text-secondary`}>
                    No day passes yet.
                  </td>
                </tr>
              ) : (
                passes.map((pass, i) => (
                  <tr key={pass.id} className="hover:bg-white/[0.02]">
                    <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                      {tableRowNumber(page, limit, i)}
                    </td>
                    <td className={TD}>
                      <p className="font-medium">{pass.guestName}</p>
                      <p className="text-xs text-secondary">{pass.phone || '—'}</p>
                    </td>
                    <td className={TD}>{formatCurrency(pass.amount)}</td>
                    <td className={TD}>
                      {pass.checkedInAt ? `In ${formatDateTime(pass.checkedInAt)}` : 'Awaiting check-in'}
                    </td>
                    <td className={`${TD} text-right`}>
                      {!pass.checkedInAt ? (
                        <button
                          type="button"
                          onClick={() => checkIn(pass.id)}
                          className="text-sm font-semibold text-primary-fixed"
                        >
                          Check in
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>
      </OwnerPageShell>
    </SectionLoader>
  );
};

export default DayPass;
