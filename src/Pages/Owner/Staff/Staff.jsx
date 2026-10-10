import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaff, deleteStaff } from '../../../store/slices/staffSlice';
import SectionLoader from '../../../components/Loader/SectionLoader';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  TableSelect,
  tableRowNumber,
} from '../../../components/fitsphere/TableShell';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
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
  const debouncedSearch = useDebouncedValue(search, 350);
  const limit = 10;

  useEffect(() => {
    if (!currentGym?.id) return;
    dispatch(
      fetchStaff({
        gymId: currentGym.id,
        page,
        limit,
        search: debouncedSearch || undefined,
        category: category === 'all' ? undefined : category,
      })
    );
  }, [dispatch, currentGym?.id, page, debouncedSearch, category]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, currentGym?.id]);

  const total = pagination.total || 0;
  const activeCount = staff.filter((s) => s.isActive).length;
  const specializationSet = useMemo(() => {
    const set = new Set();
    staff.forEach((s) => {
      (s.trainer?.specialties || []).forEach((sp) => set.add(sp));
    });
    return set;
  }, [staff]);

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
    <SectionLoader show={loading && !staff.length}>
      <>
        <OwnerPageShell
          variant="staff"
          tabs={['Overview', 'Staff Directory', 'Analytics']}
          activeTab={headerTab}
          onTabChange={setHeaderTab}
          showSearch={false}
        >
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
                    Total Workforce
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold">{total}</h3>
                </div>
                <div className="rounded-lg bg-primary-fixed/10 p-2">
                  <Icon name="group" className="text-primary-fixed" />
                </div>
              </div>
            </GlassCard>
            <GlassCard className="border-l-4 border-primary-fixed p-4" hover={false}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
                    Active On-Shift
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold text-primary-fixed">{activeCount}</h3>
                </div>
                <div className="rounded-lg bg-primary-fixed p-2">
                  <Icon name="bolt" size={22} className="text-on-primary-fixed" />
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
                    Specialization Diversity
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold">{specializationSet.size || '—'}</h3>
                </div>
                <div className="rounded-lg bg-white/5 p-2">
                  <Icon name="psychology" className="text-on-surface" />
                </div>
              </div>
            </GlassCard>
          </div>

          <TableShell
            title="Staff"
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search staff..."
            filters={
              <TableSelect
                value={category}
                onChange={(value) => {
                  setCategory(value);
                  setPage(1);
                }}
              >
                {STAFF_CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </TableSelect>
            }
            actions={
              <Link
                to="/owner/staff/new"
                className="neon-glow inline-flex items-center gap-1.5 rounded-lg bg-neon px-3 py-2 text-xs font-bold text-on-primary-fixed"
              >
                <Icon name="add" size={16} />
                Add Staff Member
              </Link>
            }
            page={page}
            total={total}
            limit={limit}
            loading={loading}
            onPage={setPage}
            noun="staff"
          >
            <table className={`${TABLE_CLASS} min-w-[720px]`}>
              <thead>
                <tr className={THEAD_ROW}>
                  <th className={`w-12 ${TH}`}>#</th>
                  <th className={TH}>Staff Member</th>
                  <th className={TH}>Role</th>
                  <th className={TH}>Specialization</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Performance</th>
                  <th className={`${TH} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`${TD} py-16 text-center text-secondary`}>
                      No staff found.{' '}
                      <Link to="/owner/staff/new" className="text-primary-fixed hover:underline">
                        Add your first team member
                      </Link>
                    </td>
                  </tr>
                ) : (
                  staff.map((row, i) => {
                    const status = getStaffStatus(row, i);
                    const specs = row.trainer?.specialties || [];
                    const perf = getPerformanceWidth(row.id);

                    return (
                      <tr key={row.id} className="hover:bg-white/[0.02]">
                        <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                          {tableRowNumber(page, limit, i)}
                        </td>
                        <td className={TD}>
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                row.user?.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  `${row.user?.firstName}+${row.user?.lastName}`
                                )}&background=2a2a2a&color=e5e2e1`
                              }
                              alt=""
                              className="h-8 w-8 rounded-full border border-white/10 object-cover"
                            />
                            <div>
                              <p className="font-semibold">
                                {row.user?.firstName} {row.user?.lastName}
                              </p>
                              <p className="text-xs text-secondary/60">{row.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`${TD} text-secondary`}>{getRoleLabel(row)}</td>
                        <td className={TD}>
                          <div className="flex flex-wrap gap-1">
                            {specs.length > 0 ? (
                              specs.map((sp, idx) => (
                                <span
                                  key={sp}
                                  className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${
                                    idx === 0
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
                        <td className={TD}>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
                            <span className={`text-xs font-bold uppercase ${status.textClass}`}>
                              {status.label}
                            </span>
                          </div>
                        </td>
                        <td className={TD}>
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full bg-primary-fixed" style={{ width: `${perf}%` }} />
                          </div>
                        </td>
                        <td className={`relative ${TD} text-right`}>
                          <button
                            type="button"
                            onClick={() => setMenuOpenId(menuOpenId === row.id ? null : row.id)}
                            className="p-1 text-secondary hover:text-primary-fixed"
                          >
                            <Icon name="more_vert" size={22} />
                          </button>
                          {menuOpenId === row.id && (
                            <div className="absolute right-3 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-white/10 bg-surface-container shadow-xl">
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
          </TableShell>
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
    </SectionLoader>
  );
};

export default Staff;
