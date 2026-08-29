import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembers, deleteMember } from '../../store/slices/memberSlice';
import { setCurrentGym } from '../../store/slices/gymSlice';
import PageLoader from '../../components/Loader/PageLoader';
import GlassCard from '../../components/fitsphere/GlassCard';
import Icon from '../../components/fitsphere/Icon';
import OwnerPageShell from '../../components/fitsphere/OwnerPageShell';

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
  const [planFilter, setPlanFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const limit = 10;

  useEffect(() => {
    if (!currentGym?.id) return;

    const params = {
      gymId: currentGym.id,
      page,
      limit,
      search: search || undefined,
    };

    if (activeOnly) {
      params.isActive = true;
    } else if (statusFilter === 'active') {
      params.isActive = true;
    } else if (statusFilter === 'lapsed') {
      params.isActive = false;
    }

    dispatch(fetchMembers(params));
  }, [dispatch, currentGym?.id, page, limit, search, activeOnly, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, activeOnly, statusFilter, planFilter, branchFilter, currentGym?.id]);

  useEffect(() => {
    if (branchFilter !== 'all' && branchFilter !== currentGym?.id) {
      const gym = gyms.find((g) => g.id === branchFilter);
      if (gym) dispatch(setCurrentGym(gym));
    }
  }, [branchFilter, gyms, currentGym?.id, dispatch]);

  const planOptions = useMemo(() => {
    const names = new Set();
    members.forEach((m) => {
      const name = m.memberships?.[0]?.plan?.name;
      if (name) names.add(name);
    });
    return Array.from(names);
  }, [members]);

  const displayedMembers = useMemo(() => {
    let list = members;
    if (planFilter !== 'all') {
      list = list.filter((m) => m.memberships?.[0]?.plan?.name === planFilter);
    }
    if (statusFilter === 'expiring') {
      list = list.filter((m) => m.isActive && !m.memberships?.[0]);
    } else if (statusFilter === 'active') {
      list = list.filter((m) => m.isActive);
    } else if (statusFilter === 'lapsed') {
      list = list.filter((m) => !m.isActive);
    }
    return list;
  }, [members, planFilter, statusFilter]);

  const handleDelete = async (memberId) => {
    if (!currentGym?.id) return;
    if (window.confirm('Delete this member?')) {
      await dispatch(deleteMember({ gymId: currentGym.id, memberId }));
      setMenuOpenId(null);
    }
  };

  const total = pagination.total || 0;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const totalPages = pagination.totalPages || 1;

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) return [1, 2, 3, '...', totalPages];
    if (page >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page, '...', totalPages];
  }, [page, totalPages]);

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
    <PageLoader show={loading && !members.length} message="Loading members...">
    <>
      <OwnerPageShell
        variant="members"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search members..."
      >
        <div className="space-y-6">
          {/* Page header */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Member Directory
              </h1>
              <p className="mt-1 text-secondary">
                {`${total.toLocaleString()} member${total === 1 ? '' : 's'} at ${currentGym.name}.`}
                {activeOnly ? ' Showing active only.' : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => exportMembersCsv(displayedMembers)}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container-high px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-container-highest"
              >
                <Icon name="download" size={20} />
                Export CSV
              </button>
              <Link
                to="/owner/members/new"
                className="neon-glow flex items-center gap-2 rounded-lg bg-neon px-4 py-2.5 text-sm font-bold text-on-primary-fixed transition-transform hover:scale-[1.02] active:scale-95"
              >
                <Icon name="person_add" size={20} />
                Add Member
              </Link>
            </div>
          </div>

          {/* Filter bar */}
          <GlassCard className="flex flex-wrap items-center gap-4 rounded-xl p-4">
            <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-background/50 px-3 py-1.5">
              <Icon name="filter_list" size={18} className="text-secondary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Filters
              </span>
            </div>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-surface-container-low px-3 py-1.5 text-sm focus:border-primary-fixed focus:outline-none"
            >
              <option value="all">All Branches</option>
              {gyms.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                if (e.target.value !== 'all') setActiveOnly(false);
              }}
              className="rounded-lg border border-white/10 bg-surface-container-low px-3 py-1.5 text-sm focus:border-primary-fixed focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring</option>
              <option value="lapsed">Lapsed</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-surface-container-low px-3 py-1.5 text-sm focus:border-primary-fixed focus:outline-none"
            >
              <option value="all">All Plans</option>
              {planOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <div className="flex-1" />

            <div className="flex items-center rounded-lg border border-white/10 bg-surface-container-low p-1">
              <button
                type="button"
                onClick={() => setActiveOnly(true)}
                className={`rounded px-3 py-1 text-xs font-bold uppercase transition-colors ${
                  activeOnly
                    ? 'bg-white/10 text-primary-fixed'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Active Only
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveOnly(false);
                  setStatusFilter('all');
                }}
                className={`rounded px-3 py-1 text-xs font-bold uppercase transition-colors ${
                  !activeOnly
                    ? 'bg-white/10 text-primary-fixed'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Show All
              </button>
            </div>
          </GlassCard>

          {/* Data table */}
          <GlassCard className="overflow-hidden rounded-xl p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    {['Member Name', 'Status', 'Current Plan', 'Last Check-in', 'Actions'].map(
                      (col) => (
                        <th
                          key={col}
                          className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider text-secondary ${
                            col === 'Actions' ? 'text-right' : ''
                          }`}
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayedMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-secondary">
                        <p>No members found.</p>
                        <Link
                          to="/owner/members/new"
                          className="mt-2 inline-block text-sm text-primary-container hover:underline"
                        >
                          Add your first member
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    displayedMembers.map((m) => (
                      <tr
                        key={m.id}
                        className="group transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-surface-container-high">
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
                              <p className="text-xs text-secondary">
                                {m.email || m.memberCode || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <MemberStatusBadge member={m} />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {m.memberships?.[0]?.plan?.name || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary">—</td>
                        <td className="relative px-6 py-4 text-right">
                          <div className="inline-flex items-center">
                            <button
                              type="button"
                              onClick={() => navigate(`/owner/members/${m.id}/edit`)}
                              className="p-2 text-secondary transition-colors hover:text-primary-fixed"
                            >
                              <Icon name="edit" size={20} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setMenuOpenId(menuOpenId === m.id ? null : m.id)
                              }
                              className="p-2 text-secondary transition-colors hover:text-primary-fixed"
                            >
                              <Icon name="more_vert" size={20} />
                            </button>
                          </div>
                          {menuOpenId === m.id && (
                            <div className="absolute right-6 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-white/10 bg-surface-container shadow-xl">
                              <button
                                type="button"
                                onClick={() => navigate(`/owner/members/${m.id}/edit`)}
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-white/5"
                              >
                                Edit
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
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-6 py-3">
              <p className="text-xs font-semibold text-secondary">
                Showing {start} to {end} of {total.toLocaleString()} members
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded p-1 text-secondary transition-colors hover:bg-white/10 disabled:opacity-30"
                >
                  <Icon name="chevron_left" size={22} />
                </button>
                {pageNumbers.map((n, i) =>
                  n === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-secondary">
                      ...
                    </span>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`flex h-8 w-8 items-center justify-center rounded text-xs font-bold transition-colors ${
                        page === n
                          ? 'bg-neon text-on-primary-fixed'
                          : 'text-secondary hover:bg-white/10'
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded p-1 text-secondary transition-colors hover:bg-white/10 disabled:opacity-30"
                >
                  <Icon name="chevron_right" size={22} />
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

export default Members;
