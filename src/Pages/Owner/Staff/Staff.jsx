import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaff, deleteStaff } from '../../../store/slices/staffSlice';
import PageLoader from '../../../components/Loader/PageLoader';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import {
  STAFF_CATEGORIES,
  getRoleLabel,
  getStaffStatus,
  getPerformanceWidth,
} from '../../../helpers/staffUtils';

const Staff = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { staff, loading, pagination } = useSelector((state) => state.staff);
  const { currentGym } = useSelector((state) => state.gym);

  const [headerTab, setHeaderTab] = useState('Staff Directory');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const limit = 10;

  useEffect(() => {
    if (!currentGym?.id) return;
    dispatch(
      fetchStaff({
        gymId: currentGym.id,
        page,
        limit,
        search: search || undefined,
        category: category === 'all' ? undefined : category,
      })
    );
  }, [dispatch, currentGym?.id, page, search, category]);

  useEffect(() => {
    setPage(1);
  }, [search, category, currentGym?.id]);

  const total = pagination.total || 0;
  const activeCount = staff.filter((s) => s.isActive).length;
  const specializationSet = useMemo(() => {
    const set = new Set();
    staff.forEach((s) => {
      (s.trainer?.specialties || []).forEach((sp) => set.add(sp));
    });
    return set;
  }, [staff]);

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const totalPages = pagination.totalPages || 1;

  const handleDelete = async (staffId) => {
    if (!currentGym?.id) return;
    if (window.confirm('Remove this staff member?')) {
      await dispatch(deleteStaff({ gymId: currentGym.id, staffId }));
      setMenuOpenId(null);
    }
  };

  if (!currentGym) {
    return (
      <OwnerPageShell variant="staff" showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch to view staff.</GlassCard>
      </OwnerPageShell>
    );
  }

  return (
    <PageLoader show={loading && !staff.length} message="Loading staff...">
    <>
      <OwnerPageShell
        variant="staff"
        tabs={['Overview', 'Staff Directory', 'Analytics']}
        activeTab={headerTab}
        onTabChange={setHeaderTab}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff members..."
      >
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Staff Management
              </h1>
              <p className="mt-1 text-secondary/60">
                Manage your high-performance team and their active shifts.
              </p>
            </div>
            <Link
              to="/owner/staff/new"
              className="neon-glow flex items-center justify-center gap-2 rounded-lg bg-neon px-6 py-2.5 text-sm font-bold text-on-primary-fixed transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Icon name="add" size={20} />
              Add Staff Member
            </Link>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <GlassCard className="rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
                    Total Workforce
                  </p>
                  <h3 className="mt-2 font-display text-4xl font-bold">{total}</h3>
                </div>
                <div className="rounded-lg bg-primary-fixed/10 p-2">
                  <Icon name="group" className="text-primary-fixed" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm text-primary-fixed">
                <Icon name="trending_up" size={16} />
                <span>+3 this month</span>
              </div>
            </GlassCard>

            <GlassCard className="rounded-xl border-l-4 border-primary-fixed p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
                    Active On-Shift
                  </p>
                  <h3 className="mt-2 font-display text-4xl font-bold text-primary-fixed">
                    {activeCount}
                  </h3>
                </div>
                <div className="rounded-lg bg-primary-fixed p-2">
                  <Icon name="bolt" size={22} className="text-on-primary-fixed" />
                </div>
              </div>
              <p className="mt-4 text-sm text-secondary/60">Current peak efficiency</p>
            </GlassCard>

            <GlassCard className="rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
                    Specialization Diversity
                  </p>
                  <h3 className="mt-2 font-display text-4xl font-bold">
                    {specializationSet.size || '—'}
                  </h3>
                </div>
                <div className="rounded-lg bg-white/5 p-2">
                  <Icon name="psychology" className="text-on-surface" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1">
                {[...specializationSet].slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/5 bg-surface-container-high px-3 py-1 text-[10px] font-bold uppercase"
                  >
                    {tag}
                  </span>
                ))}
                {specializationSet.size === 0 && (
                  <>
                    <span className="rounded-full border border-white/5 bg-surface-container-high px-3 py-1 text-[10px] font-bold">
                      HIIT
                    </span>
                    <span className="rounded-full border border-white/5 bg-surface-container-high px-3 py-1 text-[10px] font-bold">
                      YOGA
                    </span>
                  </>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex rounded-lg border border-white/5 bg-surface-container p-1">
              {STAFF_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`rounded-md px-4 py-1.5 text-sm transition-all ${
                    category === cat.key
                      ? 'bg-white/10 font-medium text-on-surface'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-1.5 text-sm text-secondary transition-colors hover:bg-white/5"
            >
              <Icon name="filter_list" size={18} />
              More Filters
            </button>
          </div>

          {/* Table */}
          <GlassCard className="overflow-hidden rounded-xl p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    {['Staff Member', 'Role', 'Specialization', 'Status', 'Performance', ''].map(
                      (col) => (
                        <th
                          key={col || 'actions'}
                          className="px-6 py-3 text-xs font-semibold uppercase tracking-widest text-secondary"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {staff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-secondary">
                        No staff found.{' '}
                        <Link to="/owner/staff/new" className="text-primary-fixed hover:underline">
                          Add your first team member
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    staff.map((row, index) => {
                      const status = getStaffStatus(row, index);
                      const specs = row.trainer?.specialties || [];
                      const perf = getPerformanceWidth(row.id);

                      return (
                        <tr
                          key={row.id}
                          className="staff-row transition-all hover:bg-white/5"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={
                                  row.user?.avatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    `${row.user?.firstName}+${row.user?.lastName}`
                                  )}&background=2a2a2a&color=e5e2e1`
                                }
                                alt=""
                                className="h-10 w-10 rounded-full border border-white/10 object-cover transition-colors group-hover:border-primary-fixed/50"
                              />
                              <div>
                                <p className="font-semibold">
                                  {row.user?.firstName} {row.user?.lastName}
                                </p>
                                <p className="text-sm text-secondary/60">{row.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-secondary">{getRoleLabel(row)}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {specs.length > 0 ? (
                                specs.map((sp, i) => (
                                  <span
                                    key={sp}
                                    className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${
                                      i === 0
                                        ? 'border-primary-fixed/20 bg-primary-fixed/10 text-primary-fixed'
                                        : 'border-white/10 bg-white/5 text-secondary'
                                    }`}
                                  >
                                    {sp}
                                  </span>
                                ))
                              ) : (
                                <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase text-secondary">
                                  General
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
                              <span className={`text-xs font-bold uppercase ${status.textClass}`}>
                                {status.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full bg-primary-fixed"
                                style={{ width: `${perf}%` }}
                              />
                            </div>
                          </td>
                          <td className="relative px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setMenuOpenId(menuOpenId === row.id ? null : row.id)}
                              className="p-1 text-secondary hover:text-primary-fixed"
                            >
                              <Icon name="more_vert" size={22} />
                            </button>
                            {menuOpenId === row.id && (
                              <div className="absolute right-6 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-white/10 bg-surface-container shadow-xl">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/owner/staff/new?edit=${row.id}`)}
                                  className="block w-full px-4 py-2 text-left text-sm hover:bg-white/5"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(row.id)}
                                  className="block w-full px-4 py-2 text-left text-sm text-error hover:bg-white/5"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 bg-white/[0.02] px-6 py-3">
              <p className="text-xs text-secondary/60">
                Showing {start} to {end} of {total} employees
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded border border-white/10 p-2 text-secondary hover:bg-white/5 disabled:opacity-30"
                >
                  <Icon name="chevron_left" size={20} />
                </button>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`flex h-8 min-w-[2rem] items-center justify-center rounded px-2 text-xs font-bold ${
                      page === n
                        ? 'bg-neon text-on-primary-fixed'
                        : 'border border-white/10 text-secondary hover:bg-white/5'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                {totalPages > 3 && (
                  <>
                    <span className="px-1 text-secondary">...</span>
                    <button
                      type="button"
                      onClick={() => setPage(totalPages)}
                      className="rounded border border-white/10 px-3 py-1 text-xs font-bold text-secondary hover:bg-white/5"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded border border-white/10 p-2 text-secondary hover:bg-white/5 disabled:opacity-30"
                >
                  <Icon name="chevron_right" size={20} />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </OwnerPageShell>

      {menuOpenId && (
        <button
          type="button"
          className="fixed inset-0 z-10"
          onClick={() => setMenuOpenId(null)}
          aria-label="Close menu"
        />
      )}

    </>
    </PageLoader>
  );
};

export default Staff;
