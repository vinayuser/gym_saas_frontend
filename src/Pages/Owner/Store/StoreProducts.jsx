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
import SectionLoader from '../../../components/Loader/SectionLoader';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  TableSelect,
  tableRowNumber,
} from '../../../components/fitsphere/TableShell';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { formatCurrency } from '../../../helpers/formatUtils';

const StoreProducts = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0 });
  const debouncedSearch = useDebouncedValue(search, 350);
  const limit = 10;

  const load = () => {
    if (!currentGym?.id) return;
    setLoading(true);
    const productParams = {
      page,
      limit,
      search: debouncedSearch || undefined,
      ...(filterCategory ? { categoryId: filterCategory } : {}),
    };
    Promise.all([
      getRequest(ENDPOINTS.PRODUCTS.LIST(currentGym.id), { params: productParams }),
      getRequest(ENDPOINTS.CATEGORIES.LIST(currentGym.id), { params: { limit: 100 } }),
      getRequest(ENDPOINTS.PRODUCTS.STATS(currentGym.id)),
    ]).then(([list, cats, st]) => {
      setProducts(Array.isArray(list.data) ? list.data : []);
      setPagination(list.meta?.pagination || { total: 0 });
      setCategories(Array.isArray(cats.data) ? cats.data : []);
      setStats(st.data);
      setLoading(false);
    });
  };

  useEffect(load, [currentGym?.id, filterCategory, page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterCategory, currentGym?.id]);

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
    <SectionLoader show={loading && !products.length}>
      <OwnerPageShell showSearch={false}>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <StatCard label="Store Revenue" value={formatCurrency(stats?.totalRevenue)} icon="payments" accent />
          <StatCard label="Products" value={pagination.total || 0} icon="inventory_2" />
          <StatCard label="Low Stock" value={stats?.lowStock || 0} icon="warning" sub="Needs restock" />
        </div>

        <TableShell
          title="Store Products"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search products..."
          filters={
            <TableSelect
              value={filterCategory}
              onChange={(value) => {
                setFilterCategory(value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </TableSelect>
          }
          actions={
            <button
              type="button"
              onClick={openCreate}
              className="cyber-glow inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-3 py-2 text-xs font-bold text-on-primary-container"
            >
              <Icon name="add" size={16} />
              Add Product
            </button>
          }
          page={page}
          total={pagination.total || 0}
          limit={limit}
          loading={loading}
          onPage={setPage}
          noun="products"
        >
          <table className={`${TABLE_CLASS} min-w-[720px]`}>
            <thead>
              <tr className={THEAD_ROW}>
                <th className={`w-12 ${TH}`}>#</th>
                <th className={TH}>Product</th>
                <th className={TH}>Category</th>
                <th className={TH}>SKU</th>
                <th className={TH}>Stock</th>
                <th className={TH}>Price</th>
                <th className={TH}>Status</th>
                <th className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p, i) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                    {tableRowNumber(page, limit, i)}
                  </td>
                  <td className={TD}>
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt="" className="h-8 w-8 rounded-lg object-cover" />
                      )}
                      <div>
                        <span className="font-medium">{p.name}</span>
                        {Array.isArray(p.customFields) && p.customFields.length > 0 && (
                          <p className="text-xs text-secondary/60">{p.customFields.length} custom field(s)</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`${TD} text-secondary`}>{p.category?.name || '—'}</td>
                  <td className={`${TD} text-secondary`}>{p.sku || '—'}</td>
                  <td className={TD}>{p.stockQty}</td>
                  <td className={TD}>{formatCurrency(p.price)}</td>
                  <td className={TD}>
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
                  <td className={TD}>
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
                  <td colSpan={8} className={`${TD} py-12 text-center text-secondary`}>
                    No products found. Add your first product or create a category first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableShell>

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
    </SectionLoader>
  );
};

export default StoreProducts;
