import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import StatCard from '../../../components/fitsphere/StatCard';
import SectionLoader from '../../../components/Loader/SectionLoader';
import ListPagination from '../../../components/fitsphere/ListPagination';

const Trainers = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.TRAINERS.PERFORMANCE(currentGym.id), { params: { page, limit } })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [currentGym?.id, page]);

  const summary = data?.summary || {};
  const trainers = data?.trainers || [];

  return (
    <SectionLoader show={loading}>
    <OwnerPageShell showSearch={false}>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Trainer Management</h1>
            <p className="mt-1 text-secondary/70">Performance, sessions, and roster overview.</p>
          </div>
          <Link
            to="/owner/trainers/new"
            className="neon-glow flex items-center gap-2 rounded-lg bg-primary-fixed px-6 py-3 text-sm font-bold text-on-primary-fixed"
          >
            <Icon name="person_add" size={20} />
            Add Trainer
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <StatCard label="Active Trainers" value={summary.activeTrainers || 0} icon="sports_martial_arts" accent />
          <StatCard label="Avg. Rating" value={`${summary.avgRating || 0}/5`} icon="star" />
          <StatCard label="Sessions" value={summary.totalSessions || 0} icon="event" />
          <StatCard label="Efficiency" value={`${summary.efficiency || 0}%`} icon="speed" />
        </div>

        <GlassCard className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase text-secondary/60">
                <th className="px-6 py-3">Trainer</th>
                <th className="px-6 py-3">Specialization</th>
                <th className="px-6 py-3">Clients</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trainers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                    No trainers yet. Click Add Trainer to onboard your first coach.
                  </td>
                </tr>
              ) : (
                trainers.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-secondary">{t.email}</p>
                    </td>
                    <td className="px-6 py-4 text-secondary">
                      {(t.specialties || []).join(', ') || '—'}
                    </td>
                    <td className="px-6 py-4">{t.clients}</td>
                    <td className="px-6 py-4 font-bold text-primary-container">{t.rating?.toFixed(1)}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-primary-container/20 px-2 py-0.5 text-xs font-semibold text-primary-container">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <ListPagination
            page={page}
            total={data?.pagination?.total || 0}
            limit={limit}
            loading={loading}
            onPage={setPage}
            noun="trainers"
          />
        </GlassCard>
      </div>
    </OwnerPageShell>
    </SectionLoader>
  );
};

export default Trainers;
