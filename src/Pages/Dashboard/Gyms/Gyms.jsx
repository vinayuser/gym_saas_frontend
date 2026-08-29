import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGyms, createGym, deleteGym } from '../../../store/slices/gymSlice';
import PageLoader from '../../../components/Loader/PageLoader';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { ROLES } from '../../../constants';
import { Plus, Trash2, MapPin } from 'lucide-react';

const Gyms = () => {
  const dispatch = useDispatch();
  const { gyms, loading, pagination } = useSelector((state) => state.gym);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', city: '', phone: '', address: '' });

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
    if (window.confirm('Delete this gym?')) {
      await dispatch(deleteGym(id));
    }
  };

  return (
    <PageLoader show={loading && !gyms.length}>
    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER]}>
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gyms</h1>
            <p className="text-slate-500">{pagination.total} gym(s) total</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Gym
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-3 sm:grid-cols-2">
              <input required placeholder="Gym Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <button type="submit" className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Save Gym</button>
          </form>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gyms.map((gym) => (
            <div key={gym.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">{gym.name}</h3>
                <button onClick={() => handleDelete(gym.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {gym.city && (
                <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {gym.city}{gym.state ? `, ${gym.state}` : ''}
                </p>
              )}
              <div className="mt-4 flex gap-4 text-xs text-slate-500">
                <span>{gym._count?.members ?? 0} members</span>
                <span>{gym._count?.staff ?? 0} staff</span>
              </div>
              <span className={`mt-3 inline-block rounded-full px-2 py-0.5 text-xs ${gym.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100'}`}>
                {gym.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
    </PageLoader>
  );
};

export default Gyms;
