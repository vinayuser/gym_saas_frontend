import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
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
import useDebouncedValue from '../../../hooks/useDebouncedValue';

const Trainers = () => {
  const navigate = useNavigate();
  const { currentGym } = useSelector((s) => s.gym);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 350);
  const limit = 10;

  useEffect(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.TRAINERS.PERFORMANCE(currentGym.id), {
      params: { page, limit, search: debouncedSearch || undefined },
    })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [currentGym?.id, page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, currentGym?.id]);

  const summary = data?.summary || {};
  const trainers = data?.trainers || [];

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch.</GlassCard>
      </OwnerPageShell>
    );
  }

  return (
    <SectionLoader show={loading && !data}>
      <OwnerPageShell showSearch={false}>
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <StatCard label="Active Trainers" value={summary.activeTrainers || 0} icon="sports_martial_arts" accent />
          <StatCard label="Avg. Rating" value={`${summary.avgRating || 0}/5`} icon="star" />
          <StatCard label="Sessions" value={summary.totalSessions || 0} icon="event" />
          <StatCard label="Efficiency" value={`${summary.efficiency || 0}%`} icon="speed" />
        </div>

        <TableShell
          title="Trainers"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search trainers..."
          actions={
            <Link
              to="/owner/trainers/new"
              className="neon-glow inline-flex items-center gap-1.5 rounded-lg bg-primary-fixed px-3 py-2 text-xs font-bold text-on-primary-fixed"
            >
              <Icon name="person_add" size={16} />
              Add Trainer
            </Link>
          }
          page={page}
          total={data?.pagination?.total || 0}
          limit={limit}
          loading={loading}
          onPage={setPage}
          noun="trainers"
        >
          <table className={`${TABLE_CLASS} min-w-[720px]`}>
            <thead>
              <tr className={THEAD_ROW}>
                <th className={`w-12 ${TH}`}>#</th>
                <th className={TH}>Trainer</th>
                <th className={TH}>Specialization</th>
                <th className={TH}>Clients</th>
                <th className={TH}>Rating</th>
                <th className={TH}>Status</th>
                <th className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trainers.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`${TD} py-12 text-center text-secondary`}>
                    No trainers yet. Click Add Trainer to onboard your first coach.
                  </td>
                </tr>
              ) : (
                trainers.map((t, i) => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                      {tableRowNumber(page, limit, i)}
                    </td>
                    <td className={TD}>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-secondary">{t.email}</p>
                    </td>
                    <td className={`${TD} text-secondary`}>{(t.specialties || []).join(', ') || '—'}</td>
                    <td className={TD}>{t.clients}</td>
                    <td className={`${TD} font-bold text-primary-container`}>{t.rating?.toFixed(1)}</td>
                    <td className={TD}>
                      <span className="rounded-full bg-primary-container/20 px-2 py-0.5 text-xs font-semibold text-primary-container">
                        {t.status}
                      </span>
                    </td>
                    <td className={`${TD} text-right`}>
                      <button
                        type="button"
                        onClick={() => navigate(`/owner/trainers/${t.id}`)}
                        className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-secondary transition-colors hover:border-primary-fixed/40 hover:text-primary-fixed"
                      >
                        View
                      </button>
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

export default Trainers;
