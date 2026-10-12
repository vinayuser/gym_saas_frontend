import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCurrentMember, fetchMemberById } from '../../../store/slices/memberSlice';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import SectionLoader from '../../../components/Loader/SectionLoader';
import { formatDate } from '../../../helpers/formatUtils';

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{label}</p>
    <p className="mt-1 text-sm text-on-surface">{value || '—'}</p>
  </div>
);

const MemberView = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentGym } = useSelector((s) => s.gym);
  const { currentMember, loading } = useSelector((s) => s.member);

  useEffect(() => {
    if (currentGym?.id && memberId) {
      dispatch(fetchMemberById({ gymId: currentGym.id, memberId }));
    }
    return () => dispatch(clearCurrentMember());
  }, [currentGym?.id, memberId, dispatch]);

  const m = currentMember;
  const membership = m?.memberships?.[0];

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch.</GlassCard>
      </OwnerPageShell>
    );
  }

  return (
    <SectionLoader show={loading && !m}>
      <OwnerPageShell showSearch={false}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/owner/members')}
            className="inline-flex items-center gap-1 text-sm text-secondary hover:text-on-surface"
          >
            <Icon name="arrow_back" size={18} />
            Members
          </button>
          {m ? (
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/owner/members/${m.id}/plans`}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/5"
              >
                Workout & diet
              </Link>
              <Link
                to={`/owner/members/${m.id}/edit`}
                className="rounded-lg bg-primary-fixed px-3 py-2 text-xs font-bold text-on-primary-fixed"
              >
                Edit member
              </Link>
            </div>
          ) : null}
        </div>

        {!m && !loading ? (
          <GlassCard className="p-8 text-center text-secondary">Member not found.</GlassCard>
        ) : m ? (
          <div className="space-y-4">
            <GlassCard className="p-6">
              <div className="flex flex-wrap items-start gap-4">
                <img
                  src={
                    m.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      `${m.firstName}+${m.lastName}`
                    )}&background=2a2a2a&color=e5e2e1`
                  }
                  alt=""
                  className="h-20 w-20 rounded-full border border-white/10 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-2xl font-bold">
                    {m.firstName} {m.lastName}
                  </h1>
                  <p className="mt-1 text-sm text-secondary">{m.memberCode}</p>
                  <span
                    className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      m.isActive
                        ? 'bg-primary-container/15 text-primary-fixed'
                        : 'bg-secondary-container/20 text-secondary'
                    }`}
                  >
                    {m.isActive ? 'Active' : 'Lapsed'}
                  </span>
                </div>
              </div>
            </GlassCard>

            <div className="grid gap-4 lg:grid-cols-2">
              <GlassCard className="space-y-4 p-5">
                <h2 className="text-sm font-semibold">Contact</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email" value={m.email} />
                  <Field label="Phone" value={m.phone} />
                  <Field label="Gender" value={m.gender} />
                  <Field label="Date of birth" value={formatDate(m.dateOfBirth)} />
                </div>
              </GlassCard>

              <GlassCard className="space-y-4 p-5">
                <h2 className="text-sm font-semibold">Emergency</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact name" value={m.emergencyContact} />
                  <Field label="Contact phone" value={m.emergencyPhone} />
                </div>
              </GlassCard>

              <GlassCard className="space-y-4 p-5 lg:col-span-2">
                <h2 className="text-sm font-semibold">Membership</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Plan" value={membership?.plan?.name} />
                  <Field label="Status" value={membership?.status} />
                  <Field label="Start" value={formatDate(membership?.startDate)} />
                  <Field label="End" value={formatDate(membership?.endDate)} />
                </div>
              </GlassCard>

              {(m.address || m.city || m.state || m.pincode) && (
                <GlassCard className="space-y-4 p-5 lg:col-span-2">
                  <h2 className="text-sm font-semibold">Address</h2>
                  <p className="text-sm">
                    {[m.address, m.city, m.state, m.pincode].filter(Boolean).join(', ') || '—'}
                  </p>
                </GlassCard>
              )}
            </div>
          </div>
        ) : null}
      </OwnerPageShell>
    </SectionLoader>
  );
};

export default MemberView;
