import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, patchRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AppModal from '../../../components/fitsphere/AppModal';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import StatCard from '../../../components/fitsphere/StatCard';
import PageLoader from '../../../components/Loader/PageLoader';
import { formatCurrency, formatDateTime } from '../../../helpers/formatUtils';

const FULFILLMENT_STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'PLACED', label: 'Placed' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'READY_FOR_PICKUP', label: 'Ready for pickup' },
  { value: 'COLLECTED', label: 'Collected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_LABELS = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for pickup',
  COLLECTED: 'Collected',
  CANCELLED: 'Cancelled',
};

const NEXT_STATUS = {
  PLACED: { status: 'CONFIRMED', label: 'Confirm order' },
  CONFIRMED: { status: 'PREPARING', label: 'Start preparing' },
  PREPARING: { status: 'READY_FOR_PICKUP', label: 'Mark ready for pickup' },
  READY_FOR_PICKUP: { status: 'COLLECTED', label: 'Mark collected' },
};

const fulfillmentClass = (status) => {
  if (status === 'COLLECTED') return 'bg-emerald-500/20 text-emerald-300';
  if (status === 'READY_FOR_PICKUP') return 'bg-primary-container/20 text-primary-container';
  if (status === 'PREPARING') return 'bg-sky-500/20 text-sky-300';
  if (status === 'CONFIRMED') return 'bg-indigo-500/20 text-indigo-300';
  if (status === 'PLACED') return 'bg-amber-500/20 text-amber-300';
  if (status === 'CANCELLED') return 'bg-error/20 text-error';
  return 'bg-white/10 text-secondary';
};

const memberName = (m) => (m ? `${m.firstName} ${m.lastName}`.trim() : 'Walk-in');

const StoreOrders = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = () => {
    if (!currentGym?.id) return;
    setLoading(true);
    const params = { limit: 100, ...(statusFilter ? { fulfillmentStatus: statusFilter } : {}) };
    Promise.all([
      getRequest(ENDPOINTS.ORDERS.LIST(currentGym.id), { params }),
      getRequest(ENDPOINTS.ORDERS.STATS(currentGym.id)),
    ]).then(([list, st]) => {
      setOrders(list.data || []);
      setStats(st.data);
      setLoading(false);
    });
  };

  useEffect(load, [currentGym?.id, statusFilter]);

  const viewOrder = async (order) => {
    const res = await getRequest(ENDPOINTS.ORDERS.BY_ID(currentGym.id, order.id));
    setSelected(res.data);
  };

  const updateStatus = async (orderId, fulfillmentStatus) => {
    setUpdating(true);
    try {
      const res = await patchRequest(ENDPOINTS.ORDERS.UPDATE_STATUS(currentGym.id, orderId), {
        fulfillmentStatus,
      });
      toast.success(`Order marked as ${STATUS_LABELS[fulfillmentStatus]}`);
      setSelected(res.data);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch.</GlassCard>
      </OwnerPageShell>
    );
  }

  const pendingPickup = stats?.byStatus?.READY_FOR_PICKUP ?? 0;

  return (
    <PageLoader show={loading} message="Loading orders...">
      <OwnerPageShell showSearch={false}>
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Store Orders</h1>
            <p className="mt-1 text-secondary/70">
              Manage member orders and pickup status at your gym.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} icon="shopping_cart" accent />
            <StatCard label="Revenue" value={formatCurrency(stats?.totalRevenue)} icon="payments" />
            <StatCard label="Ready for Pickup" value={pendingPickup} icon="storefront" sub="Awaiting collection" />
            <StatCard label="Collected" value={stats?.byStatus?.COLLECTED ?? 0} icon="check_circle" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-secondary">Filter:</label>
            <select
              className="input-cyber rounded-lg px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {FULFILLMENT_STATUSES.map((s) => (
                <option key={s.value || 'all'} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <GlassCard className="overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase text-secondary/60">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Pickup status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs font-semibold">{order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`}</p>
                      <p className="text-xs text-secondary">{order.fulfillmentType === 'PICKUP' ? 'Gym pickup' : 'Delivery'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{memberName(order.member)}</p>
                      {order.member?.memberCode && (
                        <p className="text-xs text-secondary">{order.member.memberCode}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-secondary">{formatDateTime(order.soldAt)}</td>
                    <td className="px-6 py-4">{order.itemCount ?? order.items?.length ?? 0}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${fulfillmentClass(order.fulfillmentStatus)}`}>
                        {STATUS_LABELS[order.fulfillmentStatus] || order.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button type="button" onClick={() => viewOrder(order)} className="rounded-lg px-3 py-1.5 text-xs hover:bg-white/5">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-secondary">
                      No orders yet. Member store purchases will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </GlassCard>
        </div>

        <AppModal open={Boolean(selected)} onClose={() => setSelected(null)} size="lg" scrollable>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold">
                    {selected.orderNumber || 'Order details'}
                  </h2>
                  <p className="text-sm text-secondary">{formatDateTime(selected.soldAt)}</p>
                  <p className="mt-1 text-sm">
                    <span className="text-secondary">Member: </span>
                    <span className="font-medium">{memberName(selected.member)}</span>
                    {selected.member?.phone && (
                      <span className="text-secondary"> · {selected.member.phone}</span>
                    )}
                  </p>
                </div>
                <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-white/5">
                  <Icon name="close" size={20} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${fulfillmentClass(selected.fulfillmentStatus)}`}>
                  {STATUS_LABELS[selected.fulfillmentStatus]}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-secondary">
                  {selected.fulfillmentType === 'PICKUP' ? 'Collect at gym' : 'Delivery'}
                </span>
                {selected.collectedAt && (
                  <span className="text-xs text-secondary">
                    Collected {formatDateTime(selected.collectedAt)}
                  </span>
                )}
              </div>

              {selected.notes && (
                <p className="rounded-lg bg-white/[0.03] p-3 text-sm text-secondary">{selected.notes}</p>
              )}

              <div className="space-y-2 border-t border-white/10 pt-4">
                {selected.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-3">
                    {item.product?.images?.[0] && (
                      <img src={item.product.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name || 'Product'}</p>
                      <p className="text-xs text-secondary">
                        Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.total)}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-container">{formatCurrency(selected.totalAmount)}</span>
              </div>

              {NEXT_STATUS[selected.fulfillmentStatus] && (
                <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => updateStatus(selected.id, NEXT_STATUS[selected.fulfillmentStatus].status)}
                    className="flex-1 rounded-lg bg-primary-container py-2.5 text-sm font-bold text-on-primary-container disabled:opacity-50"
                  >
                    {updating ? 'Updating…' : NEXT_STATUS[selected.fulfillmentStatus].label}
                  </button>
                  {selected.fulfillmentStatus !== 'CANCELLED' && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => updateStatus(selected.id, 'CANCELLED')}
                      className="rounded-lg border border-error/30 px-4 py-2.5 text-sm text-error hover:bg-error/10 disabled:opacity-50"
                    >
                      Cancel order
                    </button>
                  )}
                </div>
              )}

              {selected.fulfillmentStatus === 'READY_FOR_PICKUP' && (
                <div className="rounded-xl border border-primary-container/30 bg-primary-container/10 p-4 text-sm">
                  <p className="font-semibold text-primary-container">Awaiting member pickup</p>
                  <p className="mt-1 text-secondary">
                    Member can collect this order from the gym front desk. Mark as collected once handed over.
                  </p>
                </div>
              )}
            </div>
          )}
        </AppModal>
      </OwnerPageShell>
    </PageLoader>
  );
};

export default StoreOrders;
