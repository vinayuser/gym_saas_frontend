import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import AppModal from '../../../components/fitsphere/AppModal';
import ToggleSwitch from '../../../components/fitsphere/ToggleSwitch';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, patchRequest } from '../../../config/dataApi';
import { formatDate } from '../../../helpers/formatUtils';
import {
  TENANT_FEATURE_OPTIONS,
  normalizeTenantFeatures,
} from '../../../constants/tenantFeatures';

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'INACTIVE'];

const tenantStatusClass = (isActive) =>
  isActive
    ? 'bg-primary-container/20 text-primary-container border-primary-container/30'
    : 'bg-error-container/20 text-error border-error-container/30';

const subStatusClass = (status) => {
  switch (status) {
    case 'ACTIVE':
    case 'TRIAL':
      return 'bg-primary-container/15 text-primary-container border-primary-container/30';
    case 'PAST_DUE':
    case 'EXPIRED':
    case 'CANCELLED':
      return 'bg-error-container/15 text-error border-error-container/30';
    default:
      return 'bg-white/5 text-secondary border-white/10';
  }
};

const TenantsList = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [featuresTenant, setFeaturesTenant] = useState(null);
  const [featureDraft, setFeatureDraft] = useState(normalizeTenantFeatures(null));
  const [savingFeatures, setSavingFeatures] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
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
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await getRequest(ENDPOINTS.TENANTS.LIST, { params });
      setTenants(res.data?.tenants || []);
      setPagination(
        res.data?.pagination || {
          total: 0,
          page,
          limit,
          totalPages: 1,
        }
      );
    } catch {
      setTenants([]);
      setPagination({ total: 0, page: 1, limit, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const total = pagination.total || 0;
  const totalPages = pagination.totalPages || 1;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pageNumbers = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set(
      [1, totalPages, page, page - 1, page + 1].filter((n) => n >= 1 && n <= totalPages)
    );
    const sorted = Array.from(pages).sort((a, b) => a - b);
    const withEllipsis = [];
    sorted.forEach((n, i) => {
      if (i > 0 && n - sorted[i - 1] > 1) withEllipsis.push('...');
      withEllipsis.push(n);
    });
    return withEllipsis;
  })();

  const activeTenant = tenants.find((t) => t.id === menuOpenId);

  const openMenu = (tenantId, event) => {
    event.stopPropagation();
    if (menuOpenId === tenantId) {
      setMenuOpenId(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    setMenuOpenId(tenantId);
  };

  const openFeatures = (tenant) => {
    setMenuOpenId(null);
    setFeaturesTenant(tenant);
    setFeatureDraft(normalizeTenantFeatures(tenant.features));
  };

  const closeFeatures = () => {
    setFeaturesTenant(null);
  };

  const toggleActive = async (tenant) => {
    setMenuOpenId(null);
    setBusyId(tenant.id);
    try {
      await patchRequest(ENDPOINTS.TENANTS.UPDATE_STATUS(tenant.id), {
        isActive: !tenant.isActive,
      });
      toast.success(tenant.isActive ? 'Tenant deactivated' : 'Tenant activated');
      load();
    } catch {
      /* toast from api */
    } finally {
      setBusyId(null);
    }
  };

  const saveFeatures = async (e) => {
    e.preventDefault();
    if (!featuresTenant) return;
    setSavingFeatures(true);
    try {
      await patchRequest(ENDPOINTS.TENANTS.UPDATE_FEATURES(featuresTenant.id), {
        features: featureDraft,
      });
      toast.success('Features updated');
      closeFeatures();
      load();
    } catch {
      /* toast from api */
    } finally {
      setSavingFeatures(false);
    }
  };

  return (
    <>
      <AdminPageShell
        showSearch
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by business name, slug, or email..."
      >
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Tenants</h1>
            <p className="mt-1 text-secondary/70">
              Gym businesses onboarded via invites — plan, gyms, owner, and module features.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
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
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-widest text-secondary/60">
                    <th className="px-4 py-3 w-14">#</th>
                    <th className="px-6 py-3">Business</th>
                    <th className="px-6 py-3">Owner</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3">Gyms</th>
                    <th className="px-6 py-3">App alias</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Joined</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-secondary">
                        Loading…
                      </td>
                    </tr>
                  ) : tenants.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-secondary">
                        {debouncedSearch
                          ? `No tenants match “${debouncedSearch}”.`
                          : 'No tenants yet. Accepted invites with completed payment create tenants here.'}
                      </td>
                    </tr>
                  ) : (
                    tenants.map((tenant, rowIndex) => {
                      const rowNumber = (page - 1) * limit + rowIndex + 1;
                      const ownerName = tenant.owner
                        ? `${tenant.owner.firstName || ''} ${tenant.owner.lastName || ''}`.trim()
                        : '';
                      return (
                        <tr key={tenant.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-4 text-xs font-semibold text-secondary tabular-nums">
                            {rowNumber}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium">{tenant.name}</p>
                            <p className="text-xs text-secondary">{tenant.slug}</p>
                            <p className="text-xs text-secondary/70">{tenant.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            {tenant.owner ? (
                              <>
                                <p className="font-medium">{ownerName || '—'}</p>
                                <p className="text-xs text-secondary">{tenant.owner.email}</p>
                              </>
                            ) : (
                              <span className="text-secondary">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-primary-container">
                              {tenant.subscription?.plan?.name || '—'}
                            </p>
                            {tenant.subscription?.status ? (
                              <span
                                className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${subStatusClass(tenant.subscription.status)}`}
                              >
                                {tenant.subscription.status}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-6 py-4">{tenant.gymCount ?? 0}</td>
                          <td className="px-6 py-4 text-xs text-secondary">
                            {tenant.primaryGym?.appAlias ? (
                              <>
                                <span className="font-mono text-on-surface">
                                  {tenant.primaryGym.appAlias}
                                </span>
                                {tenant.primaryGym.appPublished ? (
                                  <span className="mt-0.5 block text-[10px] font-semibold uppercase text-primary-container">
                                    Published
                                  </span>
                                ) : null}
                              </>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${tenantStatusClass(tenant.isActive)}`}
                            >
                              {tenant.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-secondary">{formatDate(tenant.createdAt)}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              title="Actions"
                              onClick={(e) => openMenu(tenant.id, e)}
                              className="rounded p-2 text-secondary hover:bg-white/10 hover:text-on-surface"
                            >
                              <Icon name="more_vert" size={20} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-6 py-3">
              <p className="text-xs font-semibold text-secondary">
                {total === 0
                  ? 'No tenants'
                  : `Showing ${start} to ${end} of ${total.toLocaleString()} tenants`}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
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
                      disabled={loading}
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
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded p-1 text-secondary transition-colors hover:bg-white/10 disabled:opacity-30"
                >
                  <Icon name="chevron_right" size={22} />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </AdminPageShell>

      {menuOpenId && activeTenant && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpenId(null)}
            aria-label="Close menu"
          />
          <div
            className="fixed z-50 min-w-[200px] overflow-hidden rounded-lg border border-white/10 bg-surface-container shadow-xl"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <button
              type="button"
              onClick={() => openFeatures(activeTenant)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5"
            >
              <Icon name="tune" size={16} />
              Manage features
            </button>
            <button
              type="button"
              disabled={busyId === activeTenant.id}
              onClick={() => toggleActive(activeTenant)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5 disabled:opacity-50"
            >
              <Icon name={activeTenant.isActive ? 'block' : 'check_circle'} size={16} />
              {activeTenant.isActive ? 'Deactivate tenant' : 'Activate tenant'}
            </button>
          </div>
        </>
      )}

      <AppModal open={Boolean(featuresTenant)} onClose={closeFeatures} size="md" scrollable>
        <h2 className="font-display text-xl font-bold">Gym features</h2>
        <p className="mt-1 text-sm text-secondary">
          Enable modules for {featuresTenant?.name || 'this tenant'}. Disabled modules are hidden
          from the owner dashboard.
        </p>
        <form onSubmit={saveFeatures} className="mt-5 space-y-3">
          {TENANT_FEATURE_OPTIONS.map((option) => (
            <div
              key={option.key}
              className="flex items-center justify-between gap-4 rounded-lg border border-white/10 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-secondary">{option.description}</p>
              </div>
              <ToggleSwitch
                id={`feature-${option.key}`}
                label={option.label}
                checked={Boolean(featureDraft[option.key])}
                onChange={() =>
                  setFeatureDraft((current) => ({
                    ...current,
                    [option.key]: !current[option.key],
                  }))
                }
                disabled={savingFeatures}
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={closeFeatures}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-secondary hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingFeatures}
              className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container disabled:opacity-50"
            >
              {savingFeatures ? 'Saving…' : 'Save features'}
            </button>
          </div>
        </form>
      </AppModal>
    </>
  );
};

export default TenantsList;
