import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import ProductDetailModal from '../../../components/fitsphere/ProductDetailModal';
import AppModal from '../../../components/fitsphere/AppModal';
import PageLoader from '../../../components/Loader/PageLoader';
import { formatCurrency, formatDateTime } from '../../../helpers/formatUtils';

const CATEGORIES = ['All', 'Supplements', 'Gear', 'Apparel'];

const STATUS_LABELS = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for pickup',
  COLLECTED: 'Collected',
  CANCELLED: 'Cancelled',
};

const fulfillmentClass = (status) => {
  if (status === 'COLLECTED') return 'bg-emerald-500/20 text-emerald-300';
  if (status === 'READY_FOR_PICKUP') return 'bg-primary-container/20 text-primary-container';
  if (status === 'CANCELLED') return 'bg-error/20 text-error';
  return 'bg-white/10 text-secondary';
};

const MemberStore = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [tab, setTab] = useState('catalog');
  const [products, setProducts] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    Promise.all([
      getRequest(`${ENDPOINTS.PRODUCTS.LIST(currentGym.id)}?limit=50&isActive=true`),
      getRequest(ENDPOINTS.MEMBERS.LIST(currentGym.id), { params: { limit: 50 } }),
    ]).then(([prodRes, memRes]) => {
      setProducts(prodRes.data || []);
      const mems = memRes.data || [];
      setMembers(mems);
      if (mems.length && !selectedMemberId) setSelectedMemberId(mems[0].id);
      setLoading(false);
    });
  }, [currentGym?.id]);

  useEffect(() => {
    if (!currentGym?.id || !selectedMemberId || tab !== 'orders') return;
    setOrdersLoading(true);
    getRequest(ENDPOINTS.ORDERS.MEMBER_ORDERS(currentGym.id, selectedMemberId), { params: { limit: 50 } })
      .then((res) => {
        setOrders(res.data || []);
        setOrdersLoading(false);
      });
  }, [currentGym?.id, selectedMemberId, tab]);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      cat === 'All' ||
      (p.category?.name || '').toLowerCase().includes(cat.toLowerCase()) ||
      p.name.toLowerCase().includes(cat.toLowerCase());
    return matchSearch && matchCat && p.isActive;
  });

  return (
    <PageLoader show={loading} message="Loading catalog...">
      <OwnerPageShell showSearch={false}>
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">Member Store Preview</h1>
              <p className="mt-1 text-secondary/70">Preview the member app store and order pickup flow.</p>
            </div>
          </div>

          <div className="flex gap-2 border-b border-white/10 pb-1">
            {[
              { id: 'catalog', label: 'Catalog' },
              { id: 'orders', label: 'My Orders' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-t-lg px-4 py-2 text-sm font-semibold ${
                  tab === t.id
                    ? 'border-b-2 border-primary-container text-primary-container'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'catalog' && (
            <>
              <div className="relative max-w-md">
                <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search supplements, gear, apparel..."
                  className="input-cyber w-full rounded-lg py-2.5 pl-10 pr-4"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCat(c)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                      cat === c ? 'bg-primary-container text-on-primary-container' : 'border border-white/10 text-secondary'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProduct(p)}
                    className="text-left transition hover:scale-[1.02]"
                  >
                    <GlassCard className="overflow-hidden p-0">
                      <div className="aspect-square flex items-center justify-center bg-surface-container-high">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Icon name="inventory_2" size={48} className="text-secondary/40" />
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-bold">{p.name}</p>
                        <p className="mt-1 text-lg font-bold text-primary-container">{formatCurrency(p.price)}</p>
                        <p className="text-xs text-secondary">{p.stockQty > 0 ? 'In stock' : 'Out of stock'}</p>
                      </div>
                    </GlassCard>
                  </button>
                ))}
              </div>
              {filtered.length === 0 && (
                <GlassCard className="p-12 text-center text-secondary">No products in catalog.</GlassCard>
              )}
            </>
          )}

          {tab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-secondary">Preview as member:</label>
                <select
                  className="input-cyber rounded-lg px-3 py-2 text-sm"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.memberCode})
                    </option>
                  ))}
                </select>
              </div>

              {ordersLoading ? (
                <GlassCard className="p-12 text-center text-secondary">Loading orders…</GlassCard>
              ) : orders.length === 0 ? (
                <GlassCard className="p-12 text-center text-secondary">No orders for this member yet.</GlassCard>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="w-full text-left"
                    >
                      <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-4 transition hover:border-primary-container/30">
                        <div>
                          <p className="font-mono text-sm font-bold">{order.orderNumber || order.id.slice(0, 8)}</p>
                          <p className="text-xs text-secondary">{formatDateTime(order.soldAt)}</p>
                          <p className="mt-1 text-sm text-secondary">
                            {order.itemCount} item(s) · {order.fulfillmentType === 'PICKUP' ? 'Gym pickup' : 'Delivery'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary-container">{formatCurrency(order.totalAmount)}</p>
                          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${fulfillmentClass(order.fulfillmentStatus)}`}>
                            {STATUS_LABELS[order.fulfillmentStatus]}
                          </span>
                        </div>
                      </GlassCard>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />

        <AppModal open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} size="md" scrollable>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold">{selectedOrder.orderNumber || 'Order'}</h2>
                <p className="text-sm text-secondary">{formatDateTime(selectedOrder.soldAt)}</p>
              </div>

              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${fulfillmentClass(selectedOrder.fulfillmentStatus)}`}>
                {STATUS_LABELS[selectedOrder.fulfillmentStatus]}
              </span>

              {selectedOrder.fulfillmentStatus === 'READY_FOR_PICKUP' && (
                <div className="rounded-xl border border-primary-container/40 bg-primary-container/10 p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="storefront" size={24} className="text-primary-container" />
                    <div>
                      <p className="font-semibold text-primary-container">Ready to collect</p>
                      <p className="mt-1 text-sm text-secondary">
                        Visit the gym front desk with your member ID to collect this order.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder.fulfillmentStatus === 'COLLECTED' && selectedOrder.collectedAt && (
                <p className="text-sm text-emerald-300">
                  Collected on {formatDateTime(selectedOrder.collectedAt)}
                </p>
              )}

              <div className="space-y-2 border-t border-white/10 pt-4">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 text-sm">
                    <span>{item.product?.name} × {item.quantity}</span>
                    <span className="font-medium">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t border-white/10 pt-4 font-bold">
                <span>Total</span>
                <span className="text-primary-container">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          )}
        </AppModal>
      </OwnerPageShell>
    </PageLoader>
  );
};

export default MemberStore;
