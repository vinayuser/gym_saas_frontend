import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCurrentStaff, fetchStaffById } from '../../../store/slices/staffSlice';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import SectionLoader from '../../../components/Loader/SectionLoader';
import { getRoleLabel } from '../../../helpers/staffUtils';
import { formatCurrency, formatDate } from '../../../helpers/formatUtils';

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{label}</p>
    <p className="mt-1 text-sm text-on-surface">{value || '—'}</p>
  </div>
);

const StaffView = () => {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentGym } = useSelector((s) => s.gym);
  const { currentStaff, loading } = useSelector((s) => s.staff);

  useEffect(() => {
    if (currentGym?.id && staffId) {
      dispatch(fetchStaffById({ gymId: currentGym.id, staffId }));
    }
    return () => dispatch(clearCurrentStaff());
  }, [currentGym?.id, staffId, dispatch]);

  const s = currentStaff;
  const specs = s?.trainer?.specialties || [];

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch.</GlassCard>
      </OwnerPageShell>
    );
  }

  return (
    <SectionLoader show={loading && !s}>
      <OwnerPageShell showSearch={false}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/owner/staff')}
            className="inline-flex items-center gap-1 text-sm text-secondary hover:text-on-surface"
          >
            <Icon name="arrow_back" size={18} />
            Staff
          </button>
          {s ? (
            <Link
              to={`/owner/staff/new?edit=${s.id}`}
              className="rounded-lg bg-primary-fixed px-3 py-2 text-xs font-bold text-on-primary-fixed"
            >
              Edit staff
            </Link>
          ) : null}
        </div>

        {!s && !loading ? (
          <GlassCard className="p-8 text-center text-secondary">Staff member not found.</GlassCard>
        ) : s ? (
          <div className="space-y-4">
            <GlassCard className="p-6">
              <div className="flex flex-wrap items-start gap-4">
                <img
                  src={
                    s.user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      `${s.user?.firstName}+${s.user?.lastName}`
                    )}&background=2a2a2a&color=e5e2e1`
                  }
                  alt=""
                  className="h-20 w-20 rounded-full border border-white/10 object-cover"
                />
                <div>
                  <h1 className="font-display text-2xl font-bold">
                    {s.user?.firstName} {s.user?.lastName}
                  </h1>
                  <p className="mt-1 text-sm text-secondary">{getRoleLabel(s)}</p>
                  <span
                    className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      s.isActive
                        ? 'bg-primary-container/15 text-primary-fixed'
                        : 'bg-secondary-container/20 text-secondary'
                    }`}
                  >
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </GlassCard>

            <div className="grid gap-4 lg:grid-cols-2">
              <GlassCard className="space-y-4 p-5">
                <h2 className="text-sm font-semibold">Contact</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email" value={s.user?.email} />
                  <Field label="Phone" value={s.user?.phone} />
                  <Field label="Designation" value={s.designation} />
                  <Field label="Joined" value={formatDate(s.joinedAt)} />
                </div>
              </GlassCard>

              <GlassCard className="space-y-4 p-5">
                <h2 className="text-sm font-semibold">Employment</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Type" value={s.employmentType} />
                  <Field label="Pay frequency" value={s.paymentFrequency} />
                  <Field
                    label="Base salary"
                    value={s.baseSalary != null ? formatCurrency(s.baseSalary, s.salaryCurrency || 'INR') : null}
                  />
                </div>
              </GlassCard>

              {(s.address || s.city || s.state || s.pincode) && (
                <GlassCard className="space-y-4 p-5 lg:col-span-2">
                  <h2 className="text-sm font-semibold">Address</h2>
                  <p className="text-sm">
                    {[s.address, s.city, s.state, s.pincode].filter(Boolean).join(', ') || '—'}
                  </p>
                </GlassCard>
              )}

              {(specs.length > 0 || s.trainer?.bio || s.trainer?.experience != null) && (
                <GlassCard className="space-y-4 p-5 lg:col-span-2">
                  <h2 className="text-sm font-semibold">Trainer profile</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Experience (years)" value={s.trainer?.experience} />
                    <Field label="Specialties" value={specs.join(', ')} />
                  </div>
                  {s.trainer?.bio ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Bio</p>
                      <p className="mt-1 text-sm text-secondary/90">{s.trainer.bio}</p>
                    </div>
                  ) : null}
                </GlassCard>
              )}
            </div>
          </div>
        ) : null}
      </OwnerPageShell>
    </SectionLoader>
  );
};

export default StaffView;
