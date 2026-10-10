import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, postRequest, deleteRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import AppModal from '../../../components/fitsphere/AppModal';
import StatCard from '../../../components/fitsphere/StatCard';
import SectionLoader from '../../../components/Loader/SectionLoader';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  tableRowNumber,
} from '../../../components/fitsphere/TableShell';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { formatCurrency } from '../../../helpers/formatUtils';
import { uploadMediaFile } from '../../../helpers/mediaUpload';

const Inventory = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [productImageUrl, setProductImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0 });
  const debouncedSearch = useDebouncedValue(search, 350);
  const limit = 10;

  const load = () => {
    if (!currentGym?.id) return;
    setLoading(true);
    Promise.all([
      getRequest(ENDPOINTS.PRODUCTS.LIST(currentGym.id), {
        params: { page, limit, search: debouncedSearch || undefined },
      }),
      getRequest(ENDPOINTS.PRODUCTS.STATS(currentGym.id)),
    ]).then(([list, st]) => {
      setProducts(Array.isArray(list.data) ? list.data : []);
      setPagination(list.meta?.pagination || { total: 0 });
      setStats(st.data);
      setLoading(false);
    });
  };

  useEffect(load, [currentGym?.id, page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, currentGym?.id]);

  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      name: fd.get('name'),
      sku: fd.get('sku'),
      price: Number(fd.get('price')),
      stockQty: Number(fd.get('stockQty')),
      lowStockAt: Number(fd.get('lowStockAt') || 5),
      images: productImageUrl ? [productImageUrl] : [],
    };
    await postRequest(ENDPOINTS.PRODUCTS.CREATE(currentGym.id), body);
    toast.success('Product saved');
    setModal(null);
    setProductImageUrl('');
    load();
  };

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
          title="Inventory"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search products..."
          actions={
            <button
              type="button"
              onClick={() => {
                setProductImageUrl('');
                setModal({});
              }}
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
                <th className={TH}>SKU</th>
                <th className={TH}>Stock</th>
                <th className={TH}>Price</th>
                <th className={TH}>Status</th>
                <th className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`${TD} py-12 text-center text-secondary`}>
                    No products yet.
                  </td>
                </tr>
              ) : (
                products.map((p, i) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                      {tableRowNumber(page, limit, i)}
                    </td>
                    <td className={`${TD} font-medium`}>{p.name}</td>
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
                    <td className={`${TD} text-right`}>
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm('Remove product?')) {
                            await deleteRequest(ENDPOINTS.PRODUCTS.DELETE(currentGym.id, p.id));
                            load();
                          }
                        }}
                        className="text-error"
                      >
                        <Icon name="delete" size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>
      </OwnerPageShell>

      <AppModal open={Boolean(modal)} onClose={() => setModal(null)} size="sm">
        <h2 className="mb-4 font-bold">Add Product</h2>
        <form onSubmit={save} className="space-y-3">
          <input name="name" required placeholder="Name" className="input-cyber w-full rounded-lg px-3 py-2" />
          <input name="sku" placeholder="SKU" className="input-cyber w-full rounded-lg px-3 py-2" />
          <input name="price" type="number" step="0.01" required placeholder="Price" className="input-cyber w-full rounded-lg px-3 py-2" />
          <input name="stockQty" type="number" defaultValue={0} placeholder="Stock qty" className="input-cyber w-full rounded-lg px-3 py-2" />
          <input name="lowStockAt" type="number" defaultValue={5} className="input-cyber w-full rounded-lg px-3 py-2" />
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-secondary">Product image</label>
            {productImageUrl && (
              <img src={productImageUrl} alt="" className="mb-2 h-24 w-24 rounded-lg object-cover" />
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={uploadingImage}
              className="w-full text-sm text-secondary"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingImage(true);
                try {
                  const asset = await uploadMediaFile(file, {
                    folder: 'products',
                    resourceType: 'image',
                  });
                  setProductImageUrl(asset.url);
                } catch {
                  /* toast */
                } finally {
                  setUploadingImage(false);
                  e.target.value = '';
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setModal(null)} className="flex-1 py-2">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-lg bg-primary-container py-2 font-bold text-on-primary-container">
              Save
            </button>
          </div>
        </form>
      </AppModal>
    </SectionLoader>
  );
};

export default Inventory;
