import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import SectionLoader from '../../../components/Loader/SectionLoader';

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{label}</p>
    <p className="mt-1 text-sm text-on-surface">{value || '—'}</p>
  </div>
);

const TrainerView = () => {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const { currentGym } = useSelector((s) => s.gym);
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentGym?.id || !trainerId) return;
    setLoading(true);
    getRequest(ENDPOINTS.TRAINERS.BY_ID(currentGym.id, trainerId))
      .then((res) => setTrainer(res.data))
      .catch(() => setTrainer(null))
      .finally(() => setLoading(false));
  }, [currentGym?.id, trainerId]);

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch.</GlassCard>
      </OwnerPageShell>
    );
  }

  return (
    <SectionLoader show={loading && !trainer}>
      <OwnerPageShell showSearch={false}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/owner/trainers')}
            className="inline-flex items-center gap-1 text-sm text-secondary hover:text-on-surface"
          >
            <Icon name="arrow_back" size={18} />
            Trainers
          </button>
          {trainer?.staffId ? (
            <Link
              to={`/owner/staff/new?edit=${trainer.staffId}`}
              className="rounded-lg bg-primary-fixed px-3 py-2 text-xs font-bold text-on-primary-fixed"
            >
              Edit trainer
            </Link>
          ) : null}
        </div>

        {!trainer && !loading ? (
          <GlassCard className="p-8 text-center text-secondary">Trainer not found.</GlassCard>
        ) : trainer ? (
          <div className="space-y-4">
            <GlassCard className="p-6">
              <div className="flex flex-wrap items-start gap-4">
                <img
                  src={
                    trainer.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(trainer.name || 'T')}&background=2a2a2a&color=e5e2e1`
                  }
                  alt=""
                  className="h-20 w-20 rounded-full border border-white/10 object-cover"
                />
                <div>
                  <h1 className="font-display text-2xl font-bold">{trainer.name}</h1>
                  <p className="mt-1 text-sm text-secondary">{trainer.email}</p>
                  <span
                    className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      trainer.status === 'ACTIVE'
                        ? 'bg-primary-container/15 text-primary-fixed'
                        : 'bg-secondary-container/20 text-secondary'
                    }`}
                  >
                    {trainer.status}
                  </span>
                </div>
              </div>
            </GlassCard>

            <div className="grid gap-4 lg:grid-cols-2">
              <GlassCard className="space-y-4 p-5">
                <h2 className="text-sm font-semibold">Profile</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone" value={trainer.phone} />
                  <Field label="Experience" value={trainer.experience != null ? `${trainer.experience} yrs` : null} />
                  <Field label="Clients / sessions" value={trainer.clients} />
                  <Field label="Rating" value={trainer.rating != null ? trainer.rating.toFixed(1) : null} />
                </div>
              </GlassCard>

              <GlassCard className="space-y-4 p-5">
                <h2 className="text-sm font-semibold">Specialization</h2>
                <p className="text-sm">
                  {(trainer.specialties || []).length ? trainer.specialties.join(', ') : '—'}
                </p>
                {trainer.bio ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Bio</p>
                    <p className="mt-1 text-sm text-secondary/90">{trainer.bio}</p>
                  </div>
                ) : null}
              </GlassCard>
            </div>
          </div>
        ) : null}
      </OwnerPageShell>
    </SectionLoader>
  );
};

export default TrainerView;
