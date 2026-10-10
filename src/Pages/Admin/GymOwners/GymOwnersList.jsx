import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import TableShell, { TABLE_CLASS, TD, TH, THEAD_ROW, TableSelect, tableRowNumber } from '../../../components/fitsphere/TableShell';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, patchRequest } from '../../../config/dataApi';
import { formatDate } from '../../../helpers/formatUtils';

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'INACTIVE'];

const statusBadge = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-primary-container/20 text-primary-container border-primary-container/30';
    case 'SUSPENDED':
      return 'bg-error-container/20 text-error border-error-container/30';
    default:
      return 'bg-white/10 text-secondary border-white/10';
  }
};

const GymOwnersList = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const limit = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await getRequest(ENDPOINTS.GYM_OWNERS.LIST, { params });
      const nextOwners = res.data?.owners || [];
      setOwners(nextOwners);
      setPagination(
        res.data?.pagination || res.meta?.pagination || {
          total: nextOwners.length,
          page,
          limit,
          totalPages: 1,
        }
      );
    } catch {
      setOwners([]);
      setPagination({ total: 0, page: 1, limit, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (owner) => {
    const next = owner.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await patchRequest(ENDPOINTS.GYM_OWNERS.UPDATE_STATUS(owner.id), { status: next });
      toast.success(`Owner ${next === 'ACTIVE' ? 'activated' : 'suspended'}`);
      load();
    } catch {
      /* toast from api */
    }
  };

  return (
    <AdminPageShell showSearch={false}>
      <TableShell
        title="Gym Owners"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search owners by name, email, phone..."
        filters={
          <TableSelect
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All statuses' : s === 'INACTIVE' ? 'Inactive / Suspended' : 'Active'}
              </option>
            ))}
          </TableSelect>
        }
        page={page}
        total={pagination.total || owners.length}
        limit={limit}
        loading={loading}
        onPage={setPage}
        noun="owners"
      >
        <table className={`${TABLE_CLASS} min-w-[960px]`}>
          <thead>
            <tr className={THEAD_ROW}>
              <th className={`w-12 ${TH}`}>#</th>
              <th className={TH}>Owner</th>
              <th className={TH}>Tenant / business</th>
              <th className={TH}>Plan</th>
              <th className={TH}>Gyms</th>
              <th className={TH}>Status</th>
              <th className={TH}>Joined</th>
              <th className={`${TH} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={8} className={`${TD} py-10 text-center text-secondary`}>
                  Loading…
                </td>
              </tr>
            ) : owners.length === 0 ? (
              <tr>
                <td colSpan={8} className={`${TD} py-10 text-center text-secondary`}>
                  No gym owners yet. Accepted invites with completed payment appear here.
                </td>
              </tr>
            ) : (
              owners.map((owner, i) => (
                <tr key={owner.id} className="hover:bg-white/[0.02]">
                  <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                    {tableRowNumber(page, limit, i)}
                  </td>
                  <td className={TD}>
                    <p className="font-medium">
                      {owner.firstName} {owner.lastName}
                    </p>
                    <p className="text-xs text-secondary">{owner.email}</p>
                    {owner.phone && <p className="text-xs text-secondary/70">{owner.phone}</p>}
                  </td>
                  <td className={TD}>
                    {owner.tenant ? (
                      <>
                        <p className="font-medium">{owner.tenant.name}</p>
                        <p className="text-xs text-secondary">{owner.tenant.slug}</p>
                      </>
                    ) : (
                      <span className="text-secondary">—</span>
                    )}
                  </td>
                  <td className={`${TD} text-secondary`}>
                    {owner.tenant?.subscription?.plan?.name || '—'}
                  </td>
                  <td className={TD}>{owner.tenant?.gymCount ?? 0}</td>
                  <td className={TD}>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${statusBadge(owner.status)}`}
                    >
                      {owner.status}
                    </span>
                  </td>
                  <td className={`${TD} text-secondary`}>{formatDate(owner.createdAt)}</td>
                  <td className={`${TD} text-right`}>
                    <button
                      type="button"
                      title={owner.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      onClick={() => toggleStatus(owner)}
                      className="rounded p-2 text-secondary hover:bg-white/10"
                    >
                      <Icon name={owner.status === 'ACTIVE' ? 'block' : 'check_circle'} size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableShell>
    </AdminPageShell>
  );
};

export default GymOwnersList;
