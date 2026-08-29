import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, deleteRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import ProductFormModal from '../../../components/fitsphere/ProductFormModal';
import StatCard from '../../../components/fitsphere/StatCard';
import PageLoader from '../../../components/Loader/PageLoader';
import { formatCurrency } from '../../../helpers/formatUtils';

const StoreProducts = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');

  const load = () => {
    if (!currentGym?.id) return;
    setLoading(true);
    const productParams = { limit: 100, ...(filterCategory ? { categoryId: filterCategory } : {}) };
    Promise.all([
      getRequest(ENDPOINTS.PRODUCTS.LIST(currentGym.id), { params: productParams }),
      getRequest(ENDPOINTS.CATEGORIES.LIST(currentGym.id)),
      getRequest(ENDPOINTS.PRODUCTS.STATS(currentGym.id)),
    ]).then(([list, cats, st]) => {
      setProducts(list.data || []);
      setCategories(cats.data || []);
      setStats(st.data);
      setLoading(false);
    });
  };

  useEffect(load, [currentGym?.id, filterCategory]);

  const openCreate = () => setModal({ mode: 'create' });
  const openEdit = (p) => setModal({ mode: 'edit', product: p });

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch.</GlassCard>
      </OwnerPageShell>
    );
  }

  return (
    <PageLoader show={loading} message="Loading products...">
      <OwnerPageShell showSearch={false}>
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">Store Products</h1>
              <p className="mt-1 text-secondary/70">Manage inventory, pricing, and stock levels.</p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="cyber-glow flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 text-sm font-bold text-on-primary-container"
            >
              <Icon name="add" size={20} />
              Add Product
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Store Revenue" value={formatCurrency(stats?.totalRevenue)} icon="payments" accent />
            <StatCard label="Products" value={products.length} icon="inventory_2" />
            <StatCard label="Low Stock" value={stats?.lowStock || 0} icon="warning" sub="Needs restock" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-secondary">Filter by category:</label>
            <select
              className="input-cyber rounded-lg px-3 py-2 text-sm"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <GlassCard className="overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase text-secondary/60">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <span className="font-medium">{p.name}</span>
                          {Array.isArray(p.customFields) && p.customFields.length > 0 && (
                            <p className="text-xs text-secondary/60">{p.customFields.length} custom field(s)</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary">{p.category?.name || '—'}</td>
                    <td className="px-6 py-4 text-secondary">{p.sku || '—'}</td>
                    <td className="px-6 py-4">{p.stockQty}</td>
                    <td className="px-6 py-4">{formatCurrency(p.price)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          p.stockQty <= (p.lowStockAt || 5)
                            ? 'bg-error/20 text-error'
                            : 'bg-primary-container/20 text-primary-container'
                        }`}
                      >
                        {p.stockQty <= (p.lowStockAt || 5) ? 'LOW' : 'OK'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => openEdit(p)} className="rounded-lg p-2 hover:bg-white/5">
                          <Icon name="edit" size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm('Remove product?')) return;
                            await deleteRequest(ENDPOINTS.PRODUCTS.DELETE(currentGym.id, p.id));
                            toast.success('Product removed');
                            load();
                          }}
                          className="rounded-lg p-2 text-error hover:bg-error/10"
                        >
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-secondary">
                      No products found. Add your first product or create a category first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </GlassCard>
        </div>

        <ProductFormModal
          open={Boolean(modal)}
          onClose={() => setModal(null)}
          mode={modal?.mode}
          product={modal?.product}
          categories={categories}
          gymId={currentGym.id}
          onSaved={load}
        />
      </OwnerPageShell>
    </PageLoader>
  );
};

export default StoreProducts;
