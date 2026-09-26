import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BrandMark from '../../../components/fitsphere/BrandMark';
import EventCalendar from '../../../components/fitsphere/EventCalendar';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import { formatCurrency, formatDate, formatDateTime } from '../../../helpers/formatUtils';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'members', label: 'Members' },
  { id: 'staff', label: 'Staff' },
  { id: 'trainers', label: 'Trainers' },
  { id: 'plans', label: 'Plans' },
  { id: 'payments', label: 'Payments' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'store', label: 'Store' },
  { id: 'events', label: 'Events' },
  { id: 'leads', label: 'Leads' },
  { id: 'banners', label: 'Banners' },
];

const ADDON_LABELS = {
  attendance: 'Attendance',
  store: 'Member store',
  day_pass: 'Day pass',
};

const chip = (label, tone = 'neutral') => {
  const toneClass =
    tone === 'good'
      ? 'border-primary-container/30 bg-primary-container/15 text-primary-container'
      : tone === 'bad'
        ? 'border-error-container/30 bg-error-container/15 text-error'
        : 'border-white/10 bg-white/5 text-secondary';
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${toneClass}`}>
      {label}
    </span>
  );
};

const DataTable = ({ title, count, rows, columns }) => (
  <div>
    {title ? (
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <p className="text-xs text-secondary">
          {count > rows.length ? `Latest ${rows.length} of ${count}` : count}
        </p>
      </div>
    ) : null}
    {rows.length === 0 ? (
      <p className="text-sm text-secondary">None yet.</p>
    ) : (
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-widest text-secondary/60">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-2.5 font-semibold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 text-secondary">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-white/10 px-4 py-3">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary/70">{label}</p>
    <p className="mt-1 text-xl font-bold text-on-surface">{value}</p>
  </div>
);

const EventsTab = ({ events }) => {
  const [calendarView, setCalendarView] = useState('month');
  const [anchorDate, setAnchorDate] = useState(() => new Date());

  return (
    <EventCalendar
      events={events}
      view={calendarView}
      onViewChange={setCalendarView}
      anchorDate={anchorDate}
      onAnchorChange={setAnchorDate}
      readOnly
    />
  );
};

const TabPanel = ({ tab, gym, business }) => {
  if (!gym && tab !== 'overview') {
    return <p className="text-sm text-secondary">This business has no gym yet.</p>;
  }

  const c = gym?.counts || {};
  const flags = gym?.commercialAddons && typeof gym.commercialAddons === 'object' ? gym.commercialAddons : {};
  const address = gym
    ? [gym.address, gym.city, gym.state, gym.pincode, gym.country].filter(Boolean).join(', ')
    : '';

  if (tab === 'overview') {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Owner</p>
            <p className="mt-2 font-semibold">
              {business?.owner
                ? `${business.owner.firstName || ''} ${business.owner.lastName || ''}`.trim() || 'Owner'
                : 'Not set up yet'}
            </p>
            <p className="text-sm text-secondary">{business?.owner?.email || business?.email || '—'}</p>
            {business?.owner?.phone ? <p className="text-sm text-secondary">{business.owner.phone}</p> : null}
            {business?.owner?.status
              ? chip(business.owner.status, business.owner.status === 'ACTIVE' ? 'good' : 'bad')
              : null}
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Plan</p>
            <p className="mt-2 font-semibold text-primary-container">{business?.subscription?.plan?.name || '—'}</p>
            {business?.subscription?.status ? (
              <div className="mt-2">{chip(business.subscription.status, 'good')}</div>
            ) : null}
            {business?.subscription?.currentPeriodEnd ? (
              <p className="mt-2 text-sm text-secondary">Renews {formatDate(business.subscription.currentPeriodEnd)}</p>
            ) : null}
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Platform payments</p>
            {(business?.payments || []).length === 0 ? (
              <p className="mt-2 text-sm text-secondary">None yet.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-secondary">
                {business.payments.slice(0, 4).map((payment) => (
                  <li key={payment.id} className="flex justify-between gap-3">
                    <span className="text-on-surface">{formatCurrency(payment.amount)}</span>
                    <span>{formatDate(payment.paidAt || payment.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
        {gym ? (
          <>
            <p className="text-sm text-secondary">{address || [gym.email, gym.phone].filter(Boolean).join(' · ')}</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ADDON_LABELS).map(([key, label]) =>
                chip(flags[key] ? `${label} on` : `${label} off`, flags[key] ? 'good' : 'neutral')
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Stat label="Members" value={c.members ?? 0} />
              <Stat label="Active plans" value={c.activeMemberships ?? 0} />
              <Stat label="Staff" value={c.staff ?? 0} />
              <Stat label="Trainers" value={c.trainers ?? 0} />
              <Stat label="Attendance" value={c.attendance ?? 0} />
              <Stat label="Orders" value={c.orders ?? 0} />
            </div>
          </>
        ) : (
          <p className="text-sm text-secondary">This invite has not created a gym yet.</p>
        )}
      </div>
    );
  }

  if (tab === 'members') {
    return (
      <DataTable
        count={c.members ?? gym.members.length}
        rows={gym.members}
        columns={[
          { key: 'name', label: 'Name', render: (r) => <span className="text-on-surface">{r.name}</span> },
          { key: 'code', label: 'Code', render: (r) => r.memberCode },
          { key: 'contact', label: 'Contact', render: (r) => [r.email, r.phone].filter(Boolean).join(' · ') || '—' },
          { key: 'status', label: 'Status', render: (r) => (r.isActive ? 'Active' : 'Inactive') },
          { key: 'joined', label: 'Joined', render: (r) => formatDate(r.joinedAt) },
        ]}
      />
    );
  }

  if (tab === 'staff') {
    return (
      <DataTable
        count={c.staff ?? gym.staff.length}
        rows={gym.staff}
        columns={[
          { key: 'name', label: 'Name', render: (r) => <span className="text-on-surface">{r.name || '—'}</span> },
          { key: 'role', label: 'Role', render: (r) => r.designation || r.role || '—' },
          { key: 'contact', label: 'Contact', render: (r) => [r.email, r.phone].filter(Boolean).join(' · ') || '—' },
          { key: 'status', label: 'Status', render: (r) => r.status || (r.isActive ? 'Active' : 'Inactive') },
        ]}
      />
    );
  }

  if (tab === 'trainers') {
    return (
      <DataTable
        count={c.trainers ?? gym.trainers.length}
        rows={gym.trainers}
        columns={[
          { key: 'name', label: 'Name', render: (r) => <span className="text-on-surface">{r.name || '—'}</span> },
          { key: 'contact', label: 'Contact', render: (r) => [r.email, r.phone].filter(Boolean).join(' · ') || '—' },
          { key: 'focus', label: 'Focus', render: (r) => (r.specialties?.length ? r.specialties.join(', ') : '—') },
          { key: 'years', label: 'Experience', render: (r) => (r.experience != null ? `${r.experience} yrs` : '—') },
        ]}
      />
    );
  }

  if (tab === 'plans') {
    return (
      <DataTable
        count={c.plans ?? gym.plans.length}
        rows={gym.plans}
        columns={[
          { key: 'name', label: 'Plan', render: (r) => <span className="text-on-surface">{r.name}</span> },
          { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
          { key: 'cycle', label: 'Billing', render: (r) => r.billingCycle },
          { key: 'days', label: 'Days', render: (r) => r.durationDays },
          { key: 'status', label: 'Status', render: (r) => (r.isActive ? 'Active' : 'Inactive') },
        ]}
      />
    );
  }

  if (tab === 'payments') {
    return (
      <div className="space-y-8">
        <DataTable
          title="Member payments"
          count={c.payments ?? gym.payments.length}
          rows={gym.payments}
          columns={[
            { key: 'member', label: 'Member', render: (r) => <span className="text-on-surface">{r.member || '—'}</span> },
            { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
            { key: 'method', label: 'Method', render: (r) => r.method || '—' },
            { key: 'status', label: 'Status', render: (r) => r.status },
            { key: 'when', label: 'Date', render: (r) => formatDate(r.paidAt || r.createdAt) },
          ]}
        />
        <DataTable
          title="Invoices"
          count={c.invoices ?? gym.invoices.length}
          rows={gym.invoices}
          columns={[
            { key: 'no', label: 'Invoice', render: (r) => <span className="text-on-surface">{r.invoiceNumber}</span> },
            { key: 'amount', label: 'Total', render: (r) => formatCurrency(r.totalAmount) },
            { key: 'status', label: 'Status', render: (r) => r.status },
            { key: 'when', label: 'Issued', render: (r) => formatDate(r.issuedAt || r.paidAt) },
          ]}
        />
      </div>
    );
  }

  if (tab === 'attendance') {
    return (
      <DataTable
        count={c.attendance ?? gym.attendance.length}
        rows={gym.attendance}
        columns={[
          { key: 'member', label: 'Member', render: (r) => <span className="text-on-surface">{r.member || '—'}</span> },
          { key: 'type', label: 'Type', render: (r) => r.type },
          { key: 'source', label: 'Source', render: (r) => r.source },
          { key: 'in', label: 'In', render: (r) => formatDateTime(r.checkInAt) },
          { key: 'out', label: 'Out', render: (r) => (r.checkOutAt ? formatDateTime(r.checkOutAt) : '—') },
        ]}
      />
    );
  }

  if (tab === 'store') {
    return (
      <div className="space-y-8">
        <DataTable
          title="Orders"
          count={c.orders ?? gym.orders.length}
          rows={gym.orders}
          columns={[
            {
              key: 'no',
              label: 'Order',
              render: (r) => <span className="text-on-surface">{r.orderNumber || r.id.slice(0, 8)}</span>,
            },
            { key: 'amount', label: 'Total', render: (r) => formatCurrency(r.totalAmount) },
            { key: 'status', label: 'Payment', render: (r) => r.status },
            { key: 'fulfill', label: 'Fulfillment', render: (r) => r.fulfillmentStatus },
            { key: 'when', label: 'Date', render: (r) => formatDate(r.soldAt) },
          ]}
        />
        <DataTable
          title="Products"
          count={c.products ?? gym.products.length}
          rows={gym.products}
          columns={[
            { key: 'name', label: 'Product', render: (r) => <span className="text-on-surface">{r.name}</span> },
            { key: 'sku', label: 'SKU', render: (r) => r.sku || '—' },
            { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
            { key: 'stock', label: 'Stock', render: (r) => r.stockQty },
            { key: 'status', label: 'Status', render: (r) => (r.isActive ? 'Active' : 'Inactive') },
          ]}
        />
      </div>
    );
  }

  if (tab === 'events') return <EventsTab events={gym.events || []} />;

  if (tab === 'leads') {
    return (
      <DataTable
        count={c.leads ?? gym.leads.length}
        rows={gym.leads}
        columns={[
          { key: 'name', label: 'Name', render: (r) => <span className="text-on-surface">{r.name}</span> },
          { key: 'contact', label: 'Contact', render: (r) => [r.email, r.phone].filter(Boolean).join(' · ') || '—' },
          { key: 'source', label: 'Source', render: (r) => r.source || '—' },
          { key: 'status', label: 'Status', render: (r) => r.status },
          { key: 'when', label: 'Added', render: (r) => formatDate(r.createdAt) },
        ]}
      />
    );
  }

  return (
    <DataTable
      count={c.banners ?? gym.banners.length}
      rows={gym.banners}
      columns={[
        { key: 'name', label: 'Banner', render: (r) => <span className="text-on-surface">{r.name}</span> },
        { key: 'place', label: 'Placement', render: (r) => r.placement },
        { key: 'status', label: 'Status', render: (r) => r.status },
        { key: 'views', label: 'Views', render: (r) => r.impressions },
        { key: 'clicks', label: 'Clicks', render: (r) => r.clicks },
      ]}
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
          setGymId(next?.gyms?.[0]?.id || null);
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
  const gym = gyms.find((item) => item.id === gymId) || gyms[0] || null;
  const name = business?.name || invite?.businessName || invite?.email || 'Business';
  const logo = business?.logo || gym?.logo;

  return (
    <AdminPageShell showSearch={false}>
      <div className="mb-6">
        <Link to="/admin/invites" className="inline-flex items-center gap-1 text-sm text-secondary hover:text-on-surface">
          <Icon name="arrow_back" size={16} />
          Businesses
        </Link>
      </div>

      {loading ? (
        <p className="py-16 text-center text-secondary">Loading business…</p>
      ) : error || !invite ? (
        <p className="py-16 text-center text-secondary">{error || 'Business not found.'}</p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <BrandMark logo={logo} name={name} className="h-16 w-16 text-xl" />
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-bold md:text-4xl">{name}</h1>
              <p className="mt-1 text-sm text-secondary">
                {[business?.slug, business?.email || invite.email, business?.phone].filter(Boolean).join(' · ')}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {chip(invite.status, invite.status === 'ACCEPTED' ? 'good' : invite.status === 'REVOKED' ? 'bad' : 'neutral')}
                {business ? chip(business.isActive ? 'Active' : 'Inactive', business.isActive ? 'good' : 'bad') : null}
              </div>
            </div>
          </div>

          {gyms.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {gyms.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGymId(item.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                    gym?.id === item.id ? 'bg-white/10 text-on-surface' : 'text-secondary hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${
                  tab === item.id ? 'bg-white/10 text-on-surface' : 'text-secondary hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <TabPanel tab={tab} gym={gym} business={business ? { ...business, email: business.email || invite.email } : null} />
        </div>
      )}
    </AdminPageShell>
  );
};

export default InviteDetail;
