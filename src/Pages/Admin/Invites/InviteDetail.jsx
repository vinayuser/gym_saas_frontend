import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BrandMark from '../../../components/fitsphere/BrandMark';
import EventCalendar from '../../../components/fitsphere/EventCalendar';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  TableSelect,
  tableRowNumber,
} from '../../../components/fitsphere/TableShell';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, putRequest } from '../../../config/dataApi';
import { formatCurrency, formatDate, formatDateTime } from '../../../helpers/formatUtils';
import { toast } from 'react-toastify';
import AppAdToggles from '../../../components/fitsphere/AppAdToggles';
import { appAdsOf } from '../../../helpers/appAds';

const PAGE_SIZE = 10;

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'members', label: 'Members', icon: 'group', countKey: 'members' },
  { id: 'staff', label: 'Staff', icon: 'badge', countKey: 'staff' },
  { id: 'trainers', label: 'Trainers', icon: 'sports_martial_arts', countKey: 'trainers' },
  { id: 'plans', label: 'Plans', icon: 'card_membership', countKey: 'plans' },
  { id: 'payments', label: 'Payments', icon: 'payments', countKey: 'payments' },
  { id: 'attendance', label: 'Attendance', icon: 'qr_code_scanner', countKey: 'attendance' },
  { id: 'store', label: 'Store', icon: 'storefront', countKey: 'orders' },
  { id: 'events', label: 'Events', icon: 'event', countKey: 'events' },
  { id: 'leads', label: 'Leads', icon: 'filter_alt', countKey: 'leads' },
  { id: 'banners', label: 'Banners', icon: 'view_carousel', countKey: 'banners' },
];

const ADDON_LABELS = {
  attendance: 'Attendance',
  store: 'Member store',
  day_pass: 'Day pass',
};

const statusChip = (label, good) => (
  <span
    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
      good
        ? 'border-primary-container/30 bg-primary-container/15 text-primary-container'
        : 'border-white/10 bg-white/5 text-secondary'
    }`}
  >
    {label}
  </span>
);

const chip = (label, tone = 'neutral') => {
  const toneClass =
    tone === 'good'
      ? 'border-primary-container/30 bg-primary-container/15 text-primary-container'
      : tone === 'bad'
        ? 'border-error-container/30 bg-error-container/15 text-error'
        : 'border-white/10 bg-white/5 text-secondary';
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${toneClass}`}>
      {label}
    </span>
  );
};

const TAB_COLUMNS = {
  members: [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-on-surface">{r.name}</span> },
    { key: 'code', label: 'Code', render: (r) => r.memberCode },
    { key: 'contact', label: 'Contact', render: (r) => [r.email, r.phone].filter(Boolean).join(' · ') || '—' },
    { key: 'status', label: 'Status', render: (r) => statusChip(r.isActive ? 'Active' : 'Inactive', r.isActive) },
    { key: 'joined', label: 'Joined', render: (r) => formatDate(r.joinedAt) },
  ],
  staff: [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-on-surface">{r.name || '—'}</span> },
    { key: 'role', label: 'Role', render: (r) => r.designation || r.role || '—' },
    { key: 'contact', label: 'Contact', render: (r) => [r.email, r.phone].filter(Boolean).join(' · ') || '—' },
    { key: 'status', label: 'Status', render: (r) => statusChip(r.status || (r.isActive ? 'Active' : 'Inactive'), r.isActive) },
  ],
  trainers: [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-on-surface">{r.name || '—'}</span> },
    { key: 'contact', label: 'Contact', render: (r) => [r.email, r.phone].filter(Boolean).join(' · ') || '—' },
    { key: 'focus', label: 'Focus', render: (r) => (r.specialties?.length ? r.specialties.join(', ') : '—') },
    { key: 'years', label: 'Experience', render: (r) => (r.experience != null ? `${r.experience} yrs` : '—') },
  ],
  plans: [
    { key: 'name', label: 'Plan', render: (r) => <span className="font-medium text-on-surface">{r.name}</span> },
    { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
    { key: 'cycle', label: 'Billing', render: (r) => r.billingCycle },
    { key: 'days', label: 'Days', render: (r) => r.durationDays },
    { key: 'status', label: 'Status', render: (r) => statusChip(r.isActive ? 'Active' : 'Inactive', r.isActive) },
  ],
  payments: [
    { key: 'member', label: 'Member', render: (r) => <span className="font-medium text-on-surface">{r.member || '—'}</span> },
    { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'method', label: 'Method', render: (r) => r.method || '—' },
    { key: 'status', label: 'Status', render: (r) => r.status },
    { key: 'when', label: 'Date', render: (r) => formatDate(r.paidAt || r.createdAt) },
  ],
  invoices: [
    { key: 'no', label: 'Invoice', render: (r) => <span className="font-medium text-on-surface">{r.invoiceNumber}</span> },
    { key: 'amount', label: 'Total', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'status', label: 'Status', render: (r) => r.status },
    { key: 'when', label: 'Issued', render: (r) => formatDate(r.issuedAt || r.paidAt) },
  ],
  attendance: [
    { key: 'member', label: 'Member', render: (r) => <span className="font-medium text-on-surface">{r.member || '—'}</span> },
    { key: 'type', label: 'Type', render: (r) => r.type },
    { key: 'source', label: 'Source', render: (r) => r.source },
    { key: 'in', label: 'In', render: (r) => formatDateTime(r.checkInAt) },
    { key: 'out', label: 'Out', render: (r) => (r.checkOutAt ? formatDateTime(r.checkOutAt) : '—') },
  ],
  orders: [
    {
      key: 'no',
      label: 'Order',
      render: (r) => <span className="font-medium text-on-surface">{r.orderNumber || r.id.slice(0, 8)}</span>,
    },
    { key: 'amount', label: 'Total', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'status', label: 'Payment', render: (r) => r.status },
    { key: 'fulfill', label: 'Fulfillment', render: (r) => r.fulfillmentStatus },
    { key: 'when', label: 'Date', render: (r) => formatDate(r.soldAt) },
  ],
  products: [
    { key: 'name', label: 'Product', render: (r) => <span className="font-medium text-on-surface">{r.name}</span> },
    { key: 'sku', label: 'SKU', render: (r) => r.sku || '—' },
    { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
    { key: 'stock', label: 'Stock', render: (r) => r.stockQty },
    { key: 'status', label: 'Status', render: (r) => statusChip(r.isActive ? 'Active' : 'Inactive', r.isActive) },
  ],
  events: [
    { key: 'title', label: 'Event', render: (r) => <span className="font-medium text-on-surface">{r.title}</span> },
    { key: 'type', label: 'Type', render: (r) => r.type || '—' },
    { key: 'when', label: 'Starts', render: (r) => formatDateTime(r.startAt) },
    { key: 'place', label: 'Location', render: (r) => r.location || '—' },
    { key: 'status', label: 'Status', render: (r) => statusChip(r.isActive ? 'Active' : 'Inactive', r.isActive) },
  ],
  leads: [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-on-surface">{r.name}</span> },
    { key: 'contact', label: 'Contact', render: (r) => [r.email, r.phone].filter(Boolean).join(' · ') || '—' },
    { key: 'source', label: 'Source', render: (r) => r.source || '—' },
    { key: 'status', label: 'Status', render: (r) => r.status },
    { key: 'when', label: 'Added', render: (r) => formatDate(r.createdAt) },
  ],
  banners: [
    { key: 'name', label: 'Banner', render: (r) => <span className="font-medium text-on-surface">{r.name}</span> },
    { key: 'place', label: 'Placement', render: (r) => r.placement },
    { key: 'status', label: 'Status', render: (r) => r.status },
    { key: 'views', label: 'Views', render: (r) => r.impressions },
    { key: 'clicks', label: 'Clicks', render: (r) => r.clicks },
  ],
};

const gymKey = (gym) => String(gym?.id || gym?._id || '');

const emptyList = { rows: [], pagination: { total: 0, page: 1, limit: PAGE_SIZE } };

const GymFilter = ({ gyms, gymId, onGymChange }) =>
  gyms.length > 0 ? (
    <TableSelect value={gymId || ''} onChange={onGymChange} className="min-w-[160px]">
      {gyms.map((item) => (
        <option key={gymKey(item)} value={gymKey(item)}>
          {item.name}
        </option>
      ))}
    </TableSelect>
  ) : null;

const useInviteRecords = (inviteId, gymId, resource, page, search) => {
  const [state, setState] = useState(emptyList);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inviteId || !gymId || !resource) {
      setState(emptyList);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    getRequest(ENDPOINTS.INVITES.RECORDS(inviteId), {
      params: { gymId: String(gymId), resource, page, limit: PAGE_SIZE, search: search || undefined },
    })
      .then((res) => {
        if (cancelled) return;
        setState({
          rows: res.data?.rows || [],
          pagination: res.meta?.pagination || res.data?.pagination || { total: 0, page, limit: PAGE_SIZE },
        });
      })
      .catch(() => {
        if (!cancelled) setState(emptyList);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [inviteId, gymId, resource, page, search]);

  return { ...state, loading };
};

const RecordsTable = ({
  title,
  noun,
  columns,
  rows,
  pagination,
  loading,
  onPage,
  search,
  onSearch,
  filters,
}) => (
  <TableShell
    title={title}
    search={search}
    onSearch={onSearch}
    searchPlaceholder={`Search ${noun}...`}
    filters={filters}
    page={pagination.page || 1}
    total={pagination.total || 0}
    limit={pagination.limit || PAGE_SIZE}
    loading={loading}
    onPage={onPage}
    noun={noun}
  >
    <table className={`${TABLE_CLASS} min-w-[720px]`}>
      <thead>
        <tr className={THEAD_ROW}>
          <th className={`w-12 ${TH}`}>#</th>
          {columns.map((col) => (
            <th key={col.key} className={TH}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {loading && rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length + 1} className={`${TD} py-10 text-center text-secondary`}>
              Loading…
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length + 1} className={`${TD} py-10 text-center text-secondary`}>
              No {noun} yet.
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={row.id} className="hover:bg-white/[0.02]">
              <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                {tableRowNumber(pagination.page || 1, pagination.limit || PAGE_SIZE, i)}
              </td>
              {columns.map((col) => (
                <td key={col.key} className={`${TD} text-secondary`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </TableShell>
);

const StatTile = ({ label, value, icon }) => (
  <GlassCard className="p-3">
    <div className="flex items-center justify-between gap-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-secondary">{label}</p>
      <Icon name={icon} size={16} className="text-primary-fixed" />
    </div>
    <p className="mt-1.5 font-display text-xl font-bold leading-none">{value}</p>
  </GlassCard>
);

const OverviewPanel = ({ gym, business, inviteId, onGymAdsUpdated }) => {
  const c = gym?.counts || {};
  const flags = gym?.commercialAddons && typeof gym.commercialAddons === 'object' ? gym.commercialAddons : {};
  const [savingAd, setSavingAd] = useState('');
  const address = gym
    ? [gym.address, gym.city, gym.state, gym.pincode, gym.country].filter(Boolean).join(', ')
    : '';
  const ownerName = business?.owner
    ? `${business.owner.firstName || ''} ${business.owner.lastName || ''}`.trim() || 'Owner'
    : 'Not set up yet';

  const toggleAppAd = async (key) => {
    if (!gym?.id || !inviteId) return;
    const current = appAdsOf(gym);
    const nextValue = !current[key];
    setSavingAd(key);
    try {
      const res = await putRequest(ENDPOINTS.INVITES.APP_ADS(inviteId), { gymId: gym.id, [key]: nextValue });
      const updated = (res.data?.gyms || []).find((row) => row.id === gym.id);
      onGymAdsUpdated?.(gym.id, updated?.appAds || { ...current, [key]: nextValue });
      toast.success(nextValue ? 'Channel enabled' : 'Channel disabled');
    } finally {
      setSavingAd('');
    }
  };

  const stats = [
    { label: 'Members', value: c.members ?? 0, icon: 'group' },
    { label: 'Active plans', value: c.activeMemberships ?? 0, icon: 'card_membership' },
    { label: 'Staff', value: c.staff ?? 0, icon: 'badge' },
    { label: 'Trainers', value: c.trainers ?? 0, icon: 'sports_martial_arts' },
    { label: 'Check-ins', value: c.attendance ?? 0, icon: 'qr_code_scanner' },
    { label: 'Orders', value: c.orders ?? 0, icon: 'shopping_cart' },
  ];

  return (
    <div className="space-y-3">
      {gym ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <StatTile key={stat.label} {...stat} />
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-12">
        <GlassCard className="p-4 lg:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">Owner</p>
          <p className="mt-1 text-sm font-semibold">{ownerName}</p>
          <p className="mt-1 text-xs text-secondary">{business?.owner?.email || business?.email || '—'}</p>
          {business?.owner?.phone ? <p className="text-xs text-secondary">{business.owner.phone}</p> : null}
          <div className="mt-3">
            {business?.owner?.status
              ? chip(business.owner.status, business.owner.status === 'ACTIVE' ? 'good' : 'bad')
              : chip('Pending setup')}
          </div>
        </GlassCard>

        <GlassCard className="p-4 lg:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">Plan</p>
          <p className="mt-1 text-sm font-semibold text-primary-container">
            {business?.subscription?.plan?.name || '—'}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {business?.subscription?.status ? chip(business.subscription.status, 'good') : null}
          </div>
          <p className="mt-3 text-xs text-secondary">
            {business?.subscription?.currentPeriodEnd
              ? `Renews ${formatDate(business.subscription.currentPeriodEnd)}`
              : 'No billing period yet.'}
          </p>
        </GlassCard>

        <GlassCard className="p-4 lg:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">Platform payments</p>
          {(business?.payments || []).length === 0 ? (
            <p className="mt-3 text-xs text-secondary">None yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {business.payments.slice(0, 4).map((payment) => (
                <li key={payment.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-on-surface">{formatCurrency(payment.amount)}</span>
                  <span className="text-secondary">{formatDate(payment.paidAt || payment.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        {gym ? (
          <>
            <GlassCard className="p-4 lg:col-span-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">Location</p>
                  <p className="mt-1 text-sm font-semibold">{gym.name}</p>
                  <p className="mt-1 text-xs text-secondary">
                    {address || [gym.email, gym.phone].filter(Boolean).join(' · ') || 'No address on file'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(ADDON_LABELS).map(([key, label]) =>
                    chip(flags[key] ? `${label} on` : `${label} off`, flags[key] ? 'good' : 'neutral')
                  )}
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 lg:col-span-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">App ads</p>
              <p className="mt-1 text-xs text-secondary">Banner, video, and audio for this gym’s member app.</p>
              <div className="mt-3 max-w-xs">
                <AppAdToggles ads={appAdsOf(gym)} savingKey={savingAd} onToggle={toggleAppAd} compact />
              </div>
            </GlassCard>
          </>
        ) : (
          <GlassCard className="p-6 text-sm text-secondary lg:col-span-12">
            This invite has not created a gym yet.
          </GlassCard>
        )}
      </div>
    </div>
  );
};

const TabRecords = ({ inviteId, gymId, gyms, onGymChange, tab }) => {
  const [page, setPage] = useState(1);
  const [pageB, setPageB] = useState(1);
  const [search, setSearch] = useState('');
  const [searchB, setSearchB] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const debouncedSearchB = useDebouncedValue(searchB);
  const [calendarView, setCalendarView] = useState('month');
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const gymFilter = <GymFilter gyms={gyms} gymId={gymId} onGymChange={onGymChange} />;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, gymId]);

  useEffect(() => {
    setPageB(1);
  }, [debouncedSearchB, gymId]);

  const primaryResource = tab === 'store' ? 'orders' : tab;
  const secondaryResource = tab === 'payments' ? 'invoices' : tab === 'store' ? 'products' : null;

  const primary = useInviteRecords(inviteId, gymId, primaryResource, page, debouncedSearch);
  const secondary = useInviteRecords(inviteId, gymId, secondaryResource, pageB, debouncedSearchB);

  if (tab === 'events') {
    return (
      <div className="space-y-3">
        <RecordsTable
          title="Scheduled events"
          noun="events"
          columns={TAB_COLUMNS.events}
          rows={primary.rows}
          pagination={primary.pagination}
          loading={primary.loading}
          onPage={setPage}
          search={search}
          onSearch={setSearch}
          filters={gymFilter}
        />
        <GlassCard className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Calendar</h3>
          <EventCalendar
            events={primary.rows}
            view={calendarView}
            onViewChange={setCalendarView}
            anchorDate={anchorDate}
            onAnchorChange={setAnchorDate}
            readOnly
          />
        </GlassCard>
      </div>
    );
  }

  if (tab === 'payments') {
    return (
      <div className="space-y-3">
        <RecordsTable
          title="Member payments"
          noun="payments"
          columns={TAB_COLUMNS.payments}
          rows={primary.rows}
          pagination={primary.pagination}
          loading={primary.loading}
          onPage={setPage}
          search={search}
          onSearch={setSearch}
          filters={gymFilter}
        />
        <RecordsTable
          title="Invoices"
          noun="invoices"
          columns={TAB_COLUMNS.invoices}
          rows={secondary.rows}
          pagination={secondary.pagination}
          loading={secondary.loading}
          onPage={setPageB}
          search={searchB}
          onSearch={setSearchB}
          filters={gymFilter}
        />
      </div>
    );
  }

  if (tab === 'store') {
    return (
      <div className="space-y-3">
        <RecordsTable
          title="Orders"
          noun="orders"
          columns={TAB_COLUMNS.orders}
          rows={primary.rows}
          pagination={primary.pagination}
          loading={primary.loading}
          onPage={setPage}
          search={search}
          onSearch={setSearch}
          filters={gymFilter}
        />
        <RecordsTable
          title="Products"
          noun="products"
          columns={TAB_COLUMNS.products}
          rows={secondary.rows}
          pagination={secondary.pagination}
          loading={secondary.loading}
          onPage={setPageB}
          search={searchB}
          onSearch={setSearchB}
          filters={gymFilter}
        />
      </div>
    );
  }

  return (
    <RecordsTable
      title={TABS.find((item) => item.id === tab)?.label}
      noun={tab}
      columns={TAB_COLUMNS[primaryResource]}
      rows={primary.rows}
      pagination={primary.pagination}
      loading={primary.loading}
      onPage={setPage}
      search={search}
      onSearch={setSearch}
      filters={gymFilter}
    />
  );
};

const InviteDetail = () => {
  const { inviteId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [gymId, setGymId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getRequest(ENDPOINTS.INVITES.OVERVIEW(inviteId));
        if (!cancelled) {
          const next = res.data || null;
          setData(next);
          setGymId(gymKey(next?.gyms?.[0]) || null);
          setTab('overview');
        }
      } catch {
        if (!cancelled) {
          setData(null);
          setError('Could not load this business.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [inviteId]);

  const invite = data?.invite;
  const business = data?.business;
  const gyms = data?.gyms || [];
  const gym = useMemo(
    () => gyms.find((item) => gymKey(item) === String(gymId || '')) || gyms[0] || null,
    [gyms, gymId]
  );
  const selectedGymId = gymKey(gym) || gymId;
  const name = business?.name || invite?.businessName || invite?.email || 'Business';
  const logo = business?.logo || gym?.logo;
  const counts = gym?.counts || {};

  const switchGym = (nextId) => {
    const next = String(nextId || '');
    if (!next || next === String(gymId || '')) return;
    setGymId(next);
  };

  return (
    <AdminPageShell showSearch={false}>
      {loading ? (
        <GlassCard className="px-4 py-10 text-center text-sm text-secondary">Loading business…</GlassCard>
      ) : error || !invite ? (
        <GlassCard className="px-4 py-10 text-center text-sm text-secondary">
          {error || 'Business not found.'}
        </GlassCard>
      ) : (
        <div className="space-y-3">
          <GlassCard className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Link
                  to="/admin/invites"
                  className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-secondary hover:bg-white/5 hover:text-on-surface"
                >
                  <Icon name="arrow_back" size={14} />
                  Back
                </Link>
                <BrandMark logo={logo} name={name} className="h-10 w-10 shrink-0 text-sm" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate font-display text-lg font-bold leading-tight">{name}</h1>
                    {chip(
                      invite.status,
                      invite.status === 'ACCEPTED' ? 'good' : invite.status === 'REVOKED' ? 'bad' : 'neutral'
                    )}
                    {business
                      ? chip(business.isActive ? 'Active' : 'Inactive', business.isActive ? 'good' : 'bad')
                      : chip('Invite only')}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-secondary">
                    {[business?.email || invite.email, gym?.city || gym?.name].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>

              {gyms.length > 0 ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary">Gym</span>
                  <GymFilter gyms={gyms} gymId={selectedGymId} onGymChange={switchGym} />
                </div>
              ) : null}
            </div>
          </GlassCard>

          <div className="custom-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
            {TABS.map((item) => {
              const count = item.countKey ? counts[item.countKey] : null;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-primary-fixed text-on-primary-fixed'
                      : 'text-secondary hover:bg-white/5 hover:text-on-surface'
                  }`}
                >
                  <Icon name={item.icon} size={15} />
                  {item.label}
                  {count != null ? (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] tabular-nums ${
                        active ? 'bg-black/15' : 'bg-white/10'
                      }`}
                    >
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {tab === 'overview' ? (
            <OverviewPanel
              gym={gym}
              inviteId={inviteId}
              business={business ? { ...business, email: business.email || invite.email } : null}
              onGymAdsUpdated={(id, appAds) => {
                setData((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    gyms: (prev.gyms || []).map((item) =>
                      gymKey(item) === String(id) ? { ...item, appAds, adsEnabled: appAds.banners } : item
                    ),
                  };
                });
              }}
            />
          ) : selectedGymId ? (
            <TabRecords
              key={`${selectedGymId}-${tab}`}
              inviteId={inviteId}
              gymId={selectedGymId}
              gyms={gyms}
              onGymChange={switchGym}
              tab={tab}
            />
          ) : (
            <GlassCard className="p-6 text-sm text-secondary">This business has no gym yet.</GlassCard>
          )}
        </div>
      )}
    </AdminPageShell>
  );
};

export default InviteDetail;
