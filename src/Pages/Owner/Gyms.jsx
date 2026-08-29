import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGyms, createGym, deleteGym } from '../../store/slices/gymSlice';
import PageLoader from '../../components/Loader/PageLoader';
import GlassCard from '../../components/fitsphere/GlassCard';
import Icon from '../../components/fitsphere/Icon';
import OwnerPageShell from '../../components/fitsphere/OwnerPageShell';
import { ROLES } from '../../constants';

const canManageGyms = (role) => role === ROLES.GYM_OWNER || role === ROLES.SUPER_ADMIN;

const Gyms = () => {
  const dispatch = useDispatch();
  const { gyms, loading, pagination } = useSelector((state) => state.gym);
  const { user } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', city: '', phone: '', address: '' });

  const manageGyms = canManageGyms(user?.role);

  useEffect(() => {
    dispatch(fetchGyms());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await dispatch(createGym(form));
    setShowForm(false);
    setForm({ name: '', city: '', phone: '', address: '' });
    dispatch(fetchGyms());
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this gym branch?')) {
      await dispatch(deleteGym(id));
    }
  };

  return (
    <PageLoader show={loading && !gyms.length} message="Loading gyms...">
    <OwnerPageShell title="Gyms">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Gyms & Branches</h1>
          <p className="mt-1 text-secondary">
            {pagination.total} location(s)
            {!manageGyms && ' · View only'}
          </p>
        </div>
        {manageGyms && (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="neon-glow flex items-center gap-2 rounded-lg bg-primary-fixed px-4 py-2.5 text-sm font-bold text-on-primary-fixed"
          >
            <Icon name="add" size={20} />
            Add Branch
          </button>
        )}
      </div>

      {manageGyms && showForm && (
        <GlassCard className="mb-6 p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">New Branch</h2>
          <form onSubmit={handleCreate}>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Gym Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="fitsphere-input"
              />
              <input
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="fitsphere-input"
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="fitsphere-input"
              />
              <input
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="fitsphere-input"
              />
            </div>
            <button
              type="submit"
              className="mt-4 rounded-lg bg-primary-fixed px-6 py-2 text-sm font-bold text-on-primary-fixed"
            >
              Save Branch
            </button>
          </form>
        </GlassCard>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gyms.map((gym) => (
          <GlassCard key={gym.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed/10">
                  <Icon name="location_on" className="text-primary-fixed" />
                </div>
                <h3 className="font-display text-lg font-semibold">{gym.name}</h3>
              </div>
              {manageGyms && (
                <button
                  type="button"
                  onClick={() => handleDelete(gym.id)}
                  className="text-error hover:opacity-80"
                  aria-label={`Delete ${gym.name}`}
                >
                  <Icon name="delete" size={20} />
                </button>
              )}
            </div>
            {gym.city && (
              <p className="mt-3 flex items-center gap-1 text-sm text-secondary">
                <Icon name="map" size={16} />
                {gym.city}
                {gym.state ? `, ${gym.state}` : ''}
              </p>
            )}
            <div className="mt-4 flex gap-4 text-xs text-secondary">
              <span>{gym._count?.members ?? 0} members</span>
              <span>{gym._count?.staff ?? 0} staff</span>
            </div>
            <span
              className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                gym.isActive
                  ? 'bg-primary-fixed/20 text-primary-fixed'
                  : 'bg-white/10 text-secondary'
              }`}
            >
              {gym.isActive ? 'Active' : 'Inactive'}
            </span>
          </GlassCard>
        ))}
      </div>
    </OwnerPageShell>
    </PageLoader>
  );
};

export default Gyms;
