import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGyms } from '../../store/slices/gymSlice';
import { fetchMembers } from '../../store/slices/memberSlice';
import { Building2, Users, TrendingUp, Calendar } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const Home = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { gyms } = useSelector((state) => state.gym);
  const { members, pagination } = useSelector((state) => state.member);
  const { currentGym } = useSelector((state) => state.gym);

  useEffect(() => {
    dispatch(fetchGyms({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (currentGym?.id) {
      dispatch(fetchMembers({ gymId: currentGym.id, limit: 5 }));
    }
  }, [dispatch, currentGym?.id]);

  const totalMembers = currentGym
    ? gyms.find((g) => g.id === currentGym.id)?._count?.members ?? pagination.total
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Welcome, {user?.firstName}!
      </h1>
      <p className="mt-1 text-slate-500">Here&apos;s your gym overview</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Total Gyms" value={gyms.length} color="bg-blue-500" />
        <StatCard icon={Users} label="Active Members" value={totalMembers} color="bg-emerald-500" />
        <StatCard icon={TrendingUp} label="Growth" value="—" color="bg-violet-500" />
        <StatCard icon={Calendar} label="Events Today" value="0" color="bg-amber-500" />
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Members</h2>
        {members.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No members yet. Add your first member!</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-700">
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Phone</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.slice(0, 5).map((m) => (
                  <tr key={m.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 font-mono text-xs">{m.memberCode}</td>
                    <td className="py-3">{m.firstName} {m.lastName}</td>
                    <td className="py-3">{m.phone || '-'}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
