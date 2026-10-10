import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGyms, deleteGym } from '../../store/slices/gymSlice';
import SectionLoader from '../../components/Loader/SectionLoader';
import Icon from '../../components/fitsphere/Icon';
import OwnerPageShell from '../../components/fitsphere/OwnerPageShell';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  tableRowNumber,
} from '../../components/fitsphere/TableShell';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest } from '../../config/dataApi';
import { ROLES } from '../../constants';

const canManageGyms = (role) => role === ROLES.GYM_OWNER || role === ROLES.SUPER_ADMIN;

const Gyms = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0 });
  const debouncedSearch = useDebouncedValue(search);
  const limit = 10;
  const manageGyms = canManageGyms(user?.role);

  const loadTable = () => {
    setLoading(true);
    getRequest(ENDPOINTS.GYMS.LIST, {
      params: { page, limit, search: debouncedSearch || undefined },
    })
      .then((res) => {
        setGyms(res.data || []);
        setPagination(res.meta?.pagination || { total: (res.data || []).length, page, limit });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    loadTable();
  }, [page, debouncedSearch]);

  const refreshPicker = () => {
    dispatch(fetchGyms({ limit: 100 }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this gym branch?')) {
      await dispatch(deleteGym(id));
      loadTable();
      refreshPicker();
    }
  };

  return (
    <SectionLoader show={loading && !gyms.length}>
      <OwnerPageShell showSearch={false}>
        <TableShell
          title="Gyms"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search gyms by name, city, or email..."
          page={page}
          total={pagination.total || 0}
          limit={limit}
          loading={loading}
          onPage={setPage}
          noun="gyms"
        >
          <p className="mb-3 text-xs text-secondary">
            New branches are added by the FitSphere team via an invite. Contact support if you need another location.
          </p>
          <table className={`${TABLE_CLASS} min-w-[720px]`}>
            <thead>
              <tr className={THEAD_ROW}>
                <th className={`w-12 ${TH}`}>#</th>
                <th className={TH}>Gym</th>
                <th className={TH}>City</th>
                <th className={TH}>Members</th>
                <th className={TH}>Staff</th>
                <th className={TH}>Status</th>
                {manageGyms ? <th className={`${TH} text-right`}>Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && gyms.length === 0 ? (
                <tr>
                  <td colSpan={manageGyms ? 7 : 6} className={`${TD} py-10 text-center text-secondary`}>
                    Loading…
                  </td>
                </tr>
              ) : gyms.length === 0 ? (
                <tr>
                  <td colSpan={manageGyms ? 7 : 6} className={`${TD} py-10 text-center text-secondary`}>
                    No gyms yet.
                  </td>
                </tr>
              ) : (
                gyms.map((gym, i) => (
                  <tr key={gym.id} className="hover:bg-white/[0.02]">
                    <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                      {tableRowNumber(page, limit, i)}
                    </td>
                    <td className={TD}>
                      <p className="font-medium">{gym.name}</p>
                      {gym.email ? <p className="text-xs text-secondary">{gym.email}</p> : null}
                    </td>
                    <td className={`${TD} text-secondary`}>
                      {[gym.city, gym.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className={TD}>{gym._count?.members ?? 0}</td>
                    <td className={TD}>{gym._count?.staff ?? 0}</td>
                    <td className={TD}>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          gym.isActive ? 'bg-primary-fixed/20 text-primary-fixed' : 'bg-white/10 text-secondary'
                        }`}
                      >
                        {gym.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {manageGyms ? (
                      <td className={`${TD} text-right`}>
                        <button
                          type="button"
                          onClick={() => handleDelete(gym.id)}
                          className="rounded p-2 text-secondary hover:bg-white/10"
                          aria-label={`Delete ${gym.name}`}
                        >
                          <Icon name="delete" size={18} />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>
      </OwnerPageShell>
    </SectionLoader>
  );
};

export default Gyms;
