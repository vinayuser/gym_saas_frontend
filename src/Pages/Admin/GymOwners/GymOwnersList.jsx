import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
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
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await getRequest(ENDPOINTS.GYM_OWNERS.LIST, { params });
      setOwners(res.data?.owners || []);
    } catch {
      setOwners([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

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
    <AdminPageShell
      showSearch
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search owners by name, email, phone..."
    >
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Gym Owners</h1>
          <p className="mt-1 text-secondary/70">
            Tenants created after invite onboarding and Razorpay payment.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                statusFilter === s ? 'bg-white/10 text-on-surface' : 'text-secondary hover:bg-white/5'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <GlassCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-widest text-secondary/60">
                  <th className="px-6 py-3">Owner</th>
                  <th className="px-6 py-3">Tenant / business</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Gyms</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-secondary">
                      Loading…
                    </td>
                  </tr>
                ) : owners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-secondary">
                      No gym owners yet. Accepted invites with completed payment appear here.
                    </td>
                  </tr>
                ) : (
                  owners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {owner.firstName} {owner.lastName}
                        </p>
                        <p className="text-xs text-secondary">{owner.email}</p>
                        {owner.phone && (
                          <p className="text-xs text-secondary/70">{owner.phone}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {owner.tenant ? (
                          <>
                            <p className="font-medium">{owner.tenant.name}</p>
                            <p className="text-xs text-secondary">{owner.tenant.slug}</p>
                          </>
                        ) : (
                          <span className="text-secondary">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-secondary">
                        {owner.tenant?.subscription?.plan?.name || '—'}
                      </td>
                      <td className="px-6 py-4">{owner.tenant?.gymCount ?? 0}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${statusBadge(owner.status)}`}
                        >
                          {owner.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-secondary">{formatDate(owner.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          title={owner.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          onClick={() => toggleStatus(owner)}
                          className="rounded p-2 text-secondary hover:bg-white/10"
                        >
                          <Icon
                            name={owner.status === 'ACTIVE' ? 'block' : 'check_circle'}
                            size={18}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </AdminPageShell>
  );
};

export default GymOwnersList;
