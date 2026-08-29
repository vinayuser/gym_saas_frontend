import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembers, createMember, deleteMember } from '../../../store/slices/memberSlice';
import PageLoader from '../../../components/Loader/PageLoader';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { ROLES } from '../../../constants';
import { Plus, Trash2, Search } from 'lucide-react';

const Members = () => {
  const dispatch = useDispatch();
  const { members, loading, pagination } = useSelector((state) => state.member);
  const { currentGym } = useSelector((state) => state.gym);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'male',
  });

  useEffect(() => {
    if (currentGym?.id) {
      dispatch(fetchMembers({ gymId: currentGym.id, search }));
    }
  }, [dispatch, currentGym?.id, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!currentGym?.id) return;
    await dispatch(createMember({ gymId: currentGym.id, data: form }));
    setShowForm(false);
    setForm({ firstName: '', lastName: '', email: '', phone: '', gender: 'male' });
    dispatch(fetchMembers({ gymId: currentGym.id }));
  };

  const handleDelete = async (memberId) => {
    if (!currentGym?.id) return;
    if (window.confirm('Delete this member?')) {
      await dispatch(deleteMember({ gymId: currentGym.id, memberId }));
    }
  };

  if (!currentGym) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Please select a gym from the top bar to manage members.
      </div>
    );
  }

  return (
    <PageLoader show={loading && !members.length}>
    <ProtectedRoute
      allowedRoles={[ROLES.SUPER_ADMIN, ROLES.GYM_OWNER, ROLES.MANAGER, ROLES.RECEPTIONIST]}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Members</h1>
            <p className="text-slate-500">
              {currentGym.name} — {pagination.total} member(s)
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Member
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <input required placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <input required placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button type="submit" className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Save Member</button>
          </form>
        )}

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-mono text-xs">{m.memberCode}</td>
                  <td className="px-4 py-3 font-medium">{m.firstName} {m.lastName}</td>
                  <td className="px-4 py-3">{m.email || '-'}</td>
                  <td className="px-4 py-3">{m.phone || '-'}</td>
                  <td className="px-4 py-3">{m.memberships?.[0]?.plan?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100'}`}>
                      {m.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!members.length && (
            <p className="p-8 text-center text-slate-500">No members found</p>
          )}
        </div>
      </div>
    </ProtectedRoute>
    </PageLoader>
  );
};

export default Members;
