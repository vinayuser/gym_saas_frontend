import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BrandMark from '../../../components/fitsphere/BrandMark';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import AppModal from '../../../components/fitsphere/AppModal';
import TableShell, { TABLE_CLASS, TH, THEAD_ROW, TableSelect, tableRowNumber } from '../../../components/fitsphere/TableShell';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, patchRequest, postRequest, putRequest } from '../../../config/dataApi';
import { formatDate } from '../../../helpers/formatUtils';
import AppAdToggles from '../../../components/fitsphere/AppAdToggles';
import { appAdsOf } from '../../../helpers/appAds';

const STATUS_FILTERS = ['ALL', 'PENDING', 'SENT', 'PAYMENT_PENDING', 'ACCEPTED', 'REVOKED'];

const STATUS_LABELS = {
  PENDING: 'Pending',
  SENT: 'Email sent',
  PAYMENT_PENDING: 'Awaiting payment',
  ACCEPTED: 'Accepted',
  REVOKED: 'Revoked',
  EXPIRED: 'Expired',
};

const statusClass = (status) => {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-primary-container/20 text-primary-container border-primary-container/30';
    case 'SENT':
    case 'PAYMENT_PENDING':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'PENDING':
      return 'bg-white/10 text-secondary border-white/10';
    case 'REVOKED':
    case 'EXPIRED':
      return 'bg-error-container/20 text-error border-error-container/30';
    default:
      return 'bg-white/5 text-secondary border-white/10';
  }
};

const slugifyAlias = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const INCLUDED = ['Members', 'Staff', 'Finances', 'Events', 'Leads', 'Banners', 'Chat'];
const ADDONS = [
  { key: 'attendance', label: 'Attendance' },
  { key: 'store', label: 'Member store' },
  { key: 'day_pass', label: 'Day pass' },
];

const addonState = (value) => {
  const src = value && typeof value === 'object' ? value : {};
  return {
    attendance: Boolean(src.attendance),
    store: Boolean(src.store),
    day_pass: Boolean(src.day_pass),
  };
};

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

const accountIsOn = (invite) => {
  const tenant = invite?.tenant;
  if (!tenant) return false;
  const ownerOk = !tenant.owner || tenant.owner.status === 'ACTIVE';
  return Boolean(tenant.isActive) && ownerOk;
};

const InviteList = () => {
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const limit = 10;
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [publishInvite, setPublishInvite] = useState(null);
  const [addonsInvite, setAddonsInvite] = useState(null);
  const [passwordInvite, setPasswordInvite] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingAddon, setSavingAddon] = useState('');
  const [savingAppAd, setSavingAppAd] = useState('');
  const [aliasInput, setAliasInput] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [branchInviteFor, setBranchInviteFor] = useState(null);
  const [branchForm, setBranchForm] = useState({ businessName: '', note: '', expiryDays: 14 });
  const [savingBranchInvite, setSavingBranchInvite] = useState(false);

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
      const res = await getRequest(ENDPOINTS.INVITES.LIST, { params });
      setInvites(res.data?.invites || []);
      setPagination(
        res.data?.pagination || {
          total: 0,
          page,
          limit,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }
      );
    } catch {
      setInvites([]);
      setPagination({
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page]);

  useEffect(() => {
    load();
  }, [load]);

  const total = pagination.total || 0;

  const getInviteLink = (token) => `${window.location.origin}/setup/${token}`;

  const handleCopyLink = (invite) => {
    navigator.clipboard.writeText(getInviteLink(invite.token));
    toast.success('Invite link copied');
    setMenuOpenId(null);
  };

  const handleMarkSent = async (id) => {
    setMenuOpenId(null);
    try {
      await patchRequest(ENDPOINTS.INVITES.MARK_SENT(id));
      toast.success('Marked as sent');
      load();
    } catch {
      /* handled in api */
    }
  };

  const handleRevoke = async (id) => {
    setMenuOpenId(null);
    if (!window.confirm('Revoke this invite? The link will stop working.')) return;
    try {
      await patchRequest(ENDPOINTS.INVITES.REVOKE(id));
      toast.success('Invite revoked');
      load();
    } catch {
      /* handled in api */
    }
  };

  const setAccountStatus = async (invite) => {
    setMenuOpenId(null);
    const tenant = invite.tenant;
    if (!tenant) return;
    const turningOn = !accountIsOn(invite);
    try {
      await patchRequest(ENDPOINTS.TENANTS.UPDATE_STATUS(tenant.id), { isActive: turningOn });
      if (tenant.owner) {
        await patchRequest(ENDPOINTS.GYM_OWNERS.UPDATE_STATUS(tenant.owner.id), {
          status: turningOn ? 'ACTIVE' : 'SUSPENDED',
        });
      }
      toast.success(turningOn ? 'Business activated' : 'Business deactivated');
      load();
    } catch {
      /* toast from api */
    }
  };

  const openPasswordModal = (invite) => {
    setMenuOpenId(null);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordInvite(invite);
  };

  const closePasswordModal = () => {
    setPasswordInvite(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const owner = passwordInvite?.tenant?.owner;
    if (!owner) return;
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await patchRequest(ENDPOINTS.GYM_OWNERS.RESET_PASSWORD(owner.id), { password: newPassword });
      toast.success('Password updated');
      closePasswordModal();
    } catch {
      /* toast from api */
    } finally {
      setSavingPassword(false);
    }
  };

  const openAddons = (invite) => {
    setMenuOpenId(null);
    setAddonsInvite(invite);
  };

  const openBranchInvite = (invite) => {
    setMenuOpenId(null);
    setBranchForm({ businessName: '', note: '', expiryDays: 14 });
    setBranchInviteFor(invite);
  };

  const closeBranchInvite = () => {
    setBranchInviteFor(null);
    setBranchForm({ businessName: '', note: '', expiryDays: 14 });
  };

  const handleCreateBranchInvite = async (e) => {
    e.preventDefault();
    if (!branchInviteFor?.tenantId && !branchInviteFor?.tenant?.id) {
      toast.error('This business has no tenant yet');
      return;
    }
    const name = branchForm.businessName.trim();
    if (name.length < 2) {
      toast.error('Enter the new branch / gym name');
      return;
    }
    setSavingBranchInvite(true);
    try {
      const res = await postRequest(ENDPOINTS.INVITES.CREATE, {
        purpose: 'EXTRA_BRANCH',
        parentInviteId: branchInviteFor.id,
        existingTenantId: branchInviteFor.tenantId || branchInviteFor.tenant?.id,
        businessName: name,
        note: branchForm.note.trim() || undefined,
        expiryDays: Number(branchForm.expiryDays) || 14,
      });
      const link = res.data?.link;
      if (link) {
        try {
          await navigator.clipboard.writeText(link);
          toast.success('Branch invite created — setup link copied');
        } catch {
          toast.success('Branch invite created');
        }
      } else {
        toast.success('Branch invite created');
      }
      closeBranchInvite();
      load();
    } catch {
      /* toast from api */
    } finally {
      setSavingBranchInvite(false);
    }
  };

  const applyAppAdsToInvite = (invite, gyms) => {
    const tenant = { ...invite.tenant, gyms };
    return { ...invite, tenant, primaryGym: gyms[0] || null };
  };

  const toggleAppAd = async (invite, key) => {
    if (invite.status !== 'ACCEPTED' || !invite.tenant?.gyms?.length) return;
    const current = appAdsOf(invite.primaryGym);
    const nextValue = !current[key];
    setSavingAppAd(`${invite.id}:${key}`);
    try {
      const res = await putRequest(ENDPOINTS.INVITES.APP_ADS(invite.id), { [key]: nextValue });
      const gyms = (invite.tenant.gyms || []).map((gym) => {
        const updated = (res.data?.gyms || []).find((row) => row.id === gym.id);
        return updated ? { ...gym, appAds: updated.appAds, adsEnabled: updated.appAds?.banners } : gym;
      });
      const updated = applyAppAdsToInvite(invite, gyms);
      setInvites((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
      toast.success(nextValue ? `${key === 'banners' ? 'Banners' : key === 'video' ? 'Video ads' : 'Audio ads'} enabled` : `${key === 'banners' ? 'Banners' : key === 'video' ? 'Video ads' : 'Audio ads'} disabled`);
    } finally {
      setSavingAppAd('');
    }
  };

  const toggleAddon = async (gym, key) => {
    if (!addonsInvite?.tenant) return;
    const current = addonState(gym.commercialAddons);
    const next = { ...current, [key]: !current[key] };
    setSavingAddon(`${gym.id}:${key}`);
    try {
      await patchRequest(ENDPOINTS.TENANTS.UPDATE_ADDONS(addonsInvite.tenant.id, gym.id), { addons: next });
      const gyms = addonsInvite.tenant.gyms.map((item) =>
        item.id === gym.id ? { ...item, commercialAddons: next } : item
      );
      const tenant = { ...addonsInvite.tenant, gyms };
      const updated = { ...addonsInvite, tenant, primaryGym: gyms[0] || null };
      setAddonsInvite(updated);
      setInvites((rows) => rows.map((row) => (row.id === updated.id ? { ...row, tenant, primaryGym: gyms[0] || null } : row)));
      toast.success(next[key] ? 'Add-on enabled' : 'Add-on removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update add-on');
    } finally {
      setSavingAddon('');
    }
  };

  const openPublishModal = (invite) => {
    setMenuOpenId(null);
    if (invite.status !== 'ACCEPTED' || !invite.tenantId) {
      toast.info('Publish is available after the invite is accepted and the gym is created');
      return;
    }
    setAliasInput(invite.primaryGym?.appAlias || '');
    setPublishInvite(invite);
  };

  const closePublishModal = () => {
    setPublishInvite(null);
    setAliasInput('');
  };

  const handleConfirmPublish = async (e) => {
    e.preventDefault();
    if (!publishInvite) return;

    const existingAlias = publishInvite.primaryGym?.appAlias;
    if (existingAlias) {
      closePublishModal();
      return;
    }

    const alias = slugifyAlias(aliasInput);
    if (!alias || alias.length < 2) {
      toast.error('Enter a unique app alias');
      return;
    }

    setPublishing(true);
    try {
      await putRequest(ENDPOINTS.INVITES.PUBLISH(publishInvite.id), {
        appAlias: alias,
        appPublished: true,
      });
      toast.success('App published');
      closePublishModal();
      load();
    } catch {
      /* toast from api */
    } finally {
      setPublishing(false);
    }
  };

  const openMenu = (inviteId, event) => {
    event.stopPropagation();
    if (menuOpenId === inviteId) {
      setMenuOpenId(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    setMenuOpenId(inviteId);
  };

  const activeInvite = invites.find((i) => i.id === menuOpenId);
  const aliasLocked = Boolean(publishInvite?.primaryGym?.appAlias);

  return (
    <>
      <AdminPageShell showSearch={false}>
        <TableShell
          title="Businesses"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search business, owner, or email..."
          filters={
            <TableSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All statuses' : STATUS_LABELS[s] || s}
                </option>
              ))}
            </TableSelect>
          }
          actions={
            <button
              type="button"
              onClick={() => navigate('/admin/invites/new')}
              className="cyber-glow inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-3 py-2 text-xs font-bold text-on-primary-container"
            >
              <Icon name="add" size={16} />
              Create Invite
            </button>
          }
          page={page}
          total={total}
          limit={limit}
          loading={loading}
          onPage={setPage}
          noun="businesses"
        >
              <table className={`${TABLE_CLASS} min-w-[1180px]`}>
                <thead>
                  <tr className={THEAD_ROW}>
                    <th className={`w-12 ${TH}`}>#</th>
                    <th className="px-3 py-2.5">Business</th>
                    <th className="px-3 py-2.5">Owner</th>
                    <th className="px-3 py-2.5">Plan</th>
                    <th className="w-20 px-3 py-2.5">Gyms</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">App ads</th>
                    <th className="px-3 py-2.5">App alias</th>
                    <th className="whitespace-nowrap px-3 py-2.5">Expires</th>
                    <th className="px-3 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-10 text-center text-secondary">
                        Loading…
                      </td>
                    </tr>
                  ) : invites.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-10 text-center text-secondary">
                        {debouncedSearch ? (
                          <>No businesses match “{debouncedSearch}”.</>
                        ) : (
                          <>
                            No businesses yet.{' '}
                            <Link to="/admin/invites/new" className="text-primary-container hover:underline">
                              Create your first invite
                            </Link>
                          </>
                        )}
                      </td>
                    </tr>
                  ) : (
                    invites.map((invite, rowIndex) => {
                      const gym = invite.primaryGym;
                      const tenant = invite.tenant;
                      const owner = tenant?.owner;
                      const gyms = tenant?.gyms || [];
                      const businessName = tenant?.name || invite.businessName || invite.email;
                      const ownerName = owner
                        ? `${owner.firstName || ''} ${owner.lastName || ''}`.trim()
                        : invite.inviteeName || '';
                      const planName = tenant?.subscription?.plan?.name || invite.planName || '—';
                      const rowNumber = tableRowNumber(page, limit, rowIndex);
                      return (
                        <tr key={invite.id} className="hover:bg-white/[0.02]">
                          <td className="px-3 py-2.5 align-middle text-xs font-semibold text-secondary tabular-nums">
                            {rowNumber}
                          </td>
                          <td className="px-3 py-2.5 align-middle">
                            <div className="flex items-center gap-2.5">
                              <BrandMark logo={tenant?.logo || gym?.logo} name={businessName} className="h-8 w-8 text-xs" />
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <p className="truncate font-medium leading-tight">{businessName}</p>
                                  {invite.purpose === 'EXTRA_BRANCH' ? (
                                    <span className="rounded-full border border-sky-500/30 bg-sky-500/15 px-1.5 py-px text-[10px] font-semibold uppercase text-sky-300">
                                      Extra branch
                                    </span>
                                  ) : null}
                                </div>
                                <p className="truncate text-[11px] leading-tight text-secondary">
                                  {invite.purpose === 'EXTRA_BRANCH'
                                    ? `Branch: ${invite.businessName || '—'}`
                                    : tenant?.email || invite.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 align-middle">
                            <p className="truncate font-medium leading-tight">{ownerName || '—'}</p>
                            <p className="truncate text-[11px] leading-tight text-secondary">
                              {owner?.phone || owner?.email || invite.email}
                            </p>
                          </td>
                          <td className="px-3 py-2.5 align-middle">
                            <p className="leading-tight text-primary-container">{planName}</p>
                            {tenant?.subscription?.status ? (
                              <span
                                className={`mt-0.5 inline-flex rounded-full border px-1.5 py-px text-[10px] font-semibold uppercase ${subStatusClass(tenant.subscription.status)}`}
                              >
                                {tenant.subscription.status}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-3 py-2.5 align-middle">
                            <p className="leading-tight">{gyms.length}</p>
                            {gyms[0] ? (
                              <p className="truncate text-[11px] leading-tight text-secondary">
                                {gyms[0].name}
                                {gyms.length > 1 ? ` +${gyms.length - 1}` : ''}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-3 py-2.5 align-middle">
                            <div className="flex flex-wrap items-center gap-1">
                              <span
                                className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase ${statusClass(invite.status)}`}
                              >
                                {STATUS_LABELS[invite.status] || invite.status}
                              </span>
                              {invite.status === 'ACCEPTED' && tenant ? (
                                <span
                                  className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                    accountIsOn(invite)
                                      ? 'border-primary-container/30 bg-primary-container/15 text-primary-container'
                                      : 'border-error-container/30 bg-error-container/15 text-error'
                                  }`}
                                >
                                  {accountIsOn(invite) ? 'Active' : 'Inactive'}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 align-middle">
                            {invite.status === 'ACCEPTED' && gym ? (
                              <AppAdToggles
                                layout="row"
                                ads={appAdsOf(gym)}
                                savingKey={savingAppAd.startsWith(`${invite.id}:`) ? savingAppAd.split(':')[1] : ''}
                                onToggle={(key) => toggleAppAd(invite, key)}
                              />
                            ) : (
                              <span className="text-xs text-secondary">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 align-middle text-xs text-secondary">
                            {gym?.appAlias ? (
                              <div>
                                <span className="font-mono text-on-surface">{gym.appAlias}</span>
                                {gym.appPublished ? (
                                  <span className="mt-0.5 block text-[10px] font-semibold uppercase text-primary-container">
                                    Published
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 align-middle text-xs text-secondary">
                            {formatDate(invite.expiresAt)}
                          </td>
                          <td className="px-3 py-2.5 align-middle text-right">
                            <button
                              type="button"
                              title="Actions"
                              onClick={(e) => openMenu(invite.id, e)}
                              className="rounded p-1.5 text-secondary hover:bg-white/10 hover:text-on-surface"
                            >
                              <Icon name="more_vert" size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
        </TableShell>
      </AdminPageShell>

      {menuOpenId && activeInvite && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpenId(null)}
            aria-label="Close menu"
          />
          <div
            className="fixed z-50 min-w-[180px] overflow-hidden rounded-lg border border-white/10 bg-surface-container shadow-xl"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpenId(null);
                navigate(`/admin/invites/${activeInvite.id}`);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5"
            >
              <Icon name="visibility" size={16} />
              View
            </button>
            {activeInvite.status !== 'ACCEPTED' && (
              <button
                type="button"
                onClick={() => handleCopyLink(activeInvite)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5"
              >
                <Icon name="link" size={16} />
                Copy setup link
              </button>
            )}
            {activeInvite.status === 'ACCEPTED' && (
              <button
                type="button"
                onClick={() => openPublishModal(activeInvite)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5"
              >
                <Icon name="publish" size={16} />
                Publish app
              </button>
            )}
            {activeInvite.status === 'ACCEPTED' && activeInvite.tenant?.owner && (
              <button
                type="button"
                onClick={() => openPasswordModal(activeInvite)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5"
              >
                <Icon name="key" size={16} />
                Reset password
              </button>
            )}
            {activeInvite.status === 'ACCEPTED' && activeInvite.tenant && (
              <button
                type="button"
                onClick={() => setAccountStatus(activeInvite)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5"
              >
                <Icon name={accountIsOn(activeInvite) ? 'block' : 'check_circle'} size={16} />
                {accountIsOn(activeInvite) ? 'Deactivate' : 'Activate'}
              </button>
            )}
            {activeInvite.status === 'ACCEPTED' &&
              activeInvite.tenant &&
              activeInvite.purpose !== 'EXTRA_BRANCH' && (
              <button
                type="button"
                onClick={() => openBranchInvite(activeInvite)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5"
              >
                <Icon name="add_business" size={16} />
                Invite extra branch
              </button>
            )}
            {activeInvite.status === 'ACCEPTED' && activeInvite.tenant && (
              <button
                type="button"
                onClick={() => openAddons(activeInvite)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5"
              >
                <Icon name="tune" size={16} />
                Manage add-ons
              </button>
            )}
            {activeInvite.status === 'PENDING' && (
              <button
                type="button"
                onClick={() => handleMarkSent(activeInvite.id)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-white/5"
              >
                <Icon name="send" size={16} />
                Mark as sent
              </button>
            )}
            {activeInvite.status !== 'ACCEPTED' && activeInvite.status !== 'REVOKED' && (
              <button
                type="button"
                onClick={() => handleRevoke(activeInvite.id)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-error hover:bg-white/5"
              >
                <Icon name="block" size={16} />
                Revoke
              </button>
            )}
          </div>
        </>
      )}

      {publishInvite && (
        <AppModal open={Boolean(publishInvite)} onClose={closePublishModal} size="md">
          <h2 className="font-display text-xl font-bold">Publish app</h2>
          <p className="mt-1 text-sm leading-relaxed text-secondary">
            Set a unique alias used by the mobile app to load this gym.
            {aliasLocked ? ' Alias cannot be changed once set.' : ''}
          </p>

          <form onSubmit={handleConfirmPublish} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
                App alias
              </label>
              <input
                value={aliasInput}
                onChange={(e) => !aliasLocked && setAliasInput(slugifyAlias(e.target.value))}
                disabled={aliasLocked}
                placeholder="e.g. fitness-gym-app"
                className="input-cyber disabled:cursor-not-allowed disabled:opacity-60"
                required={!aliasLocked}
                autoFocus={!aliasLocked}
              />
              <p className="mt-1.5 text-xs text-secondary/70">
                Resolve via <code className="rounded bg-white/5 px-1">/public/resolve?alias=…</code>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closePublishModal}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-secondary hover:bg-white/5"
              >
                {aliasLocked ? 'Close' : 'Cancel'}
              </button>
              {!aliasLocked && (
                <button
                  type="submit"
                  disabled={publishing}
                  className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container disabled:opacity-50"
                >
                  {publishing ? 'Publishing…' : 'Publish'}
                </button>
              )}
            </div>
          </form>
        </AppModal>
      )}

      {passwordInvite?.tenant?.owner && (
        <AppModal open onClose={closePasswordModal} size="md">
          <h2 className="font-display text-xl font-bold">Reset password</h2>
          <p className="mt-1 text-sm text-secondary">
            Set a new sign-in password for {passwordInvite.tenant.owner.email}.
          </p>
          <form onSubmit={handleResetPassword} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="input-cyber"
                required
                minLength={8}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="input-cyber"
                required
                minLength={8}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closePasswordModal}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-secondary hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPassword}
                className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container disabled:opacity-50"
              >
                {savingPassword ? 'Saving…' : 'Update password'}
              </button>
            </div>
          </form>
        </AppModal>
      )}

      {addonsInvite?.tenant && (
        <AppModal open onClose={() => setAddonsInvite(null)} size="lg" scrollable>
          <h2 className="font-display text-xl font-bold">Plan and add-ons</h2>
          <p className="mt-1 text-sm text-secondary">
            {addonsInvite.tenant.name} includes the standard gym tools. Add-ons are extra and billed per gym.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {INCLUDED.map((label) => (
              <span key={label} className="rounded-full border border-white/10 px-3 py-1 text-xs">
                {label}
              </span>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            {(addonsInvite.tenant.gyms || []).map((gym) => {
              const flags = addonState(gym.commercialAddons);
              return (
                <div key={gym.id} className="rounded-xl border border-white/10 p-4">
                  <p className="font-semibold">{gym.name}</p>
                  <div className="mt-3 space-y-2">
                    {ADDONS.map((addon) => (
                      <label key={addon.key} className="flex items-center justify-between gap-4 text-sm">
                        <span>{addon.label}</span>
                        <input
                          type="checkbox"
                          checked={flags[addon.key]}
                          disabled={savingAddon === `${gym.id}:${addon.key}`}
                          onChange={() => toggleAddon(gym, addon.key)}
                          className="h-4 w-4 accent-[#c3f400]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setAddonsInvite(null)}
              className="rounded-lg bg-primary-fixed px-4 py-2 text-sm font-bold text-on-primary-fixed"
            >
              Done
            </button>
          </div>
        </AppModal>
      )}
      {branchInviteFor ? (
        <AppModal open onClose={closeBranchInvite} size="md">
          <h2 className="font-display text-xl font-bold">Invite extra branch</h2>
          <p className="mt-1 text-sm text-secondary">
            Send a setup link for another gym under{' '}
            <span className="text-on-surface">
              {branchInviteFor.tenant?.name || branchInviteFor.businessName}
            </span>
            . Same owner account; charged as an extra gym.
          </p>
          <form onSubmit={handleCreateBranchInvite} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
                New branch / gym name
              </label>
              <input
                type="text"
                value={branchForm.businessName}
                onChange={(e) => setBranchForm((f) => ({ ...f, businessName: e.target.value }))}
                placeholder="e.g. Zirakpur"
                className="input-cyber"
                required
                minLength={2}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
                Note (optional)
              </label>
              <input
                type="text"
                value={branchForm.note}
                onChange={(e) => setBranchForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Internal note"
                className="input-cyber"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
                Link expires (days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={branchForm.expiryDays}
                onChange={(e) => setBranchForm((f) => ({ ...f, expiryDays: e.target.value }))}
                className="input-cyber"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeBranchInvite}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-secondary hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingBranchInvite}
                className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container disabled:opacity-50"
              >
                {savingBranchInvite ? 'Creating…' : 'Create invite & copy link'}
              </button>
            </div>
          </form>
        </AppModal>
      ) : null}

    </>
  );
};

export default InviteList;
