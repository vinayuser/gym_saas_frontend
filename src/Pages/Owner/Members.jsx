import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembers, deleteMember } from '../../store/slices/memberSlice';
import { setCurrentGym } from '../../store/slices/gymSlice';
import GlassCard from '../../components/fitsphere/GlassCard';
import Icon from '../../components/fitsphere/Icon';
import OwnerPageShell from '../../components/fitsphere/OwnerPageShell';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  TableSelect,
  tableRowNumber,
} from '../../components/fitsphere/TableShell';
import useDebouncedValue from '../../hooks/useDebouncedValue';

const MemberStatusBadge = ({ member }) => {
  if (!member.isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-secondary-container/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-secondary">
        Lapsed
      </span>
    );
  }

  const expiring = member.memberships?.[0]?.status === 'EXPIRING';
  if (expiring) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-error-container/30 bg-error-container/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-error">
        Expiring
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-container/30 bg-primary-container/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary-fixed">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
      Active
    </span>
  );
};

const exportMembersCsv = (members) => {
  const headers = ['Member Code', 'First Name', 'Last Name', 'Email', 'Phone', 'Plan', 'Status'];
  const rows = members.map((m) => [
    m.memberCode,
    m.firstName,
    m.lastName,
    m.email || '',
    m.phone || '',
    m.memberships?.[0]?.plan?.name || '',
    m.isActive ? 'Active' : 'Lapsed',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `members-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const Members = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { members, loading, pagination } = useSelector((state) => state.member);
  const { currentGym, gyms } = useSelector((state) => state.gym);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 350);
  const limit = 10;

  useEffect(() => {
    if (!currentGym?.id) return;

    const params = {
      gymId: currentGym.id,
      page,
      limit,
      search: debouncedSearch || undefined,
    };

    if (statusFilter === 'active') params.isActive = true;
    if (statusFilter === 'lapsed') params.isActive = false;

    dispatch(fetchMembers(params));
  }, [dispatch, currentGym?.id, page, limit, debouncedSearch, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, branchFilter, currentGym?.id]);

  useEffect(() => {
    if (branchFilter !== 'all' && branchFilter !== currentGym?.id) {
      const gym = gyms.find((g) => g.id === branchFilter);
      if (gym) dispatch(setCurrentGym(gym));
    }
  }, [branchFilter, gyms, currentGym?.id, dispatch]);

  const handleDelete = async (memberId) => {
    if (!currentGym?.id) return;
    if (window.confirm('Delete this member?')) {
      await dispatch(deleteMember({ gymId: currentGym.id, memberId }));
      setMenuOpenId(null);
    }
  };

  if (!currentGym) {
    return (
      <OwnerPageShell variant="members" showSearch={false}>
        <GlassCard className="border-primary-fixed/30 p-6 text-secondary">
          Please select a gym branch from the filter bar to manage members.
        </GlassCard>
      </OwnerPageShell>
    );
  }

  return (
    <>
      <OwnerPageShell variant="members" showSearch={false}>
        <TableShell
          title="Members"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search members..."
          filters={
            <>
              {gyms.length > 1 ? (
                <TableSelect value={branchFilter} onChange={setBranchFilter}>
                  <option value="all">All Branches</option>
                  {gyms.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </TableSelect>
              ) : null}
              <TableSelect
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="lapsed">Lapsed</option>
              </TableSelect>
            </>
          }
          actions={
            <>
              <button
                type="button"
                onClick={() => exportMembersCsv(members)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/5"
              >
                <Icon name="download" size={16} />
                Export
              </button>
              <Link
                to="/owner/members/new"
                className="neon-glow inline-flex items-center gap-1.5 rounded-lg bg-neon px-3 py-2 text-xs font-bold text-on-primary-fixed"
              >
                <Icon name="person_add" size={16} />
                Add Member
              </Link>
            </>
          }
          page={page}
          total={pagination.total || 0}
          limit={limit}
          loading={loading}
          onPage={setPage}
          noun="members"
        >
          <table className={`${TABLE_CLASS} min-w-[720px]`}>
            <thead>
              <tr className={THEAD_ROW}>
                <th className={`w-12 ${TH}`}>#</th>
                <th className={TH}>Member Name</th>
                <th className={TH}>Status</th>
                <th className={TH}>Current Plan</th>
                <th className={TH}>Last Check-in</th>
                <th className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`${TD} py-16 text-center text-secondary`}>
                    {loading ? (
                      <p>Loading members…</p>
                    ) : (
                      <>
                        <p>No members found.</p>
                        <Link
                          to="/owner/members/new"
                          className="mt-2 inline-block text-sm text-primary-container hover:underline"
                        >
                          Add your first member
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                members.map((m, i) => (
                  <tr key={m.id} className="hover:bg-white/[0.02]">
                    <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                      {tableRowNumber(page, limit, i)}
                    </td>
                    <td className={TD}>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-surface-container-high">
                          <img
                            src={
                              m.profileImage ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                `${m.firstName}+${m.lastName}`
                              )}&background=2a2a2a&color=e5e2e1`
                            }
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {m.firstName} {m.lastName}
                          </p>
                          <p className="text-xs text-secondary">{m.email || m.memberCode || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className={TD}>
                      <MemberStatusBadge member={m} />
                    </td>
                    <td className={TD}>{m.memberships?.[0]?.plan?.name || '—'}</td>
                    <td className={`${TD} text-secondary`}>—</td>
                    <td className={`relative ${TD} text-right`}>
                      <div className="inline-flex items-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/owner/members/${m.id}`)}
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-secondary transition-colors hover:border-primary-fixed/40 hover:text-primary-fixed"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/owner/members/${m.id}/edit`)}
                          className="p-2 text-secondary transition-colors hover:text-primary-fixed"
                        >
                          <Icon name="edit" size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMenuOpenId(menuOpenId === m.id ? null : m.id)}
                          className="p-2 text-secondary transition-colors hover:text-primary-fixed"
                        >
                          <Icon name="more_vert" size={20} />
                        </button>
                      </div>
                      {menuOpenId === m.id && (
                        <div className="absolute right-3 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-white/10 bg-surface-container shadow-xl">
                          <button
                            type="button"
                            onClick={() => navigate(`/owner/members/${m.id}/edit`)}
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-white/5"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/owner/members/${m.id}/plans`)}
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-white/5"
                          >
                            Workout & diet
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id)}
                            className="block w-full px-4 py-2 text-left text-sm text-error hover:bg-white/5"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
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
  );
};

export default Members;
