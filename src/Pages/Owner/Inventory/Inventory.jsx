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
import PageLoader from '../../../components/Loader/PageLoader';
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

  const load = () => {
    if (!currentGym?.id) return;
    Promise.all([
      getRequest(ENDPOINTS.PRODUCTS.LIST(currentGym.id)),
      getRequest(ENDPOINTS.PRODUCTS.STATS(currentGym.id)),
    ]).then(([list, st]) => {
      setProducts(list.data || []);
      setStats(st.data);
      setLoading(false);
    });
  };

  useEffect(load, [currentGym?.id]);

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
    if (modal?.id) {
      await postRequest(ENDPOINTS.PRODUCTS.CREATE(currentGym.id), body);
    } else {
      await postRequest(ENDPOINTS.PRODUCTS.CREATE(currentGym.id), body);
    }
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
    <PageLoader show={loading} message="Loading inventory...">
    <OwnerPageShell showSearch={false}>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Inventory &amp; Sales</h1>
            <p className="mt-1 text-secondary/70">Products, stock levels, and retail performance.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setProductImageUrl('');
              setModal({});
            }}
            className="cyber-glow flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 text-sm font-bold text-on-primary-container"
          >
            <Icon name="add" size={20} />
            Add Product
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard label="Store Revenue" value={formatCurrency(stats?.totalRevenue)} icon="payments" accent />
          <StatCard label="Products" value={products.length} icon="inventory_2" />
          <StatCard label="Low Stock" value={stats?.lowStock || 0} icon="warning" sub="Needs restock" />
        </div>

        <GlassCard className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase text-secondary/60">
                <th className="px-6 py-3">Product</th>
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
                  <td className="px-6 py-4 font-medium">{p.name}</td>
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
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>

      <AppModal open={Boolean(modal)} onClose={() => setModal(null)} size="sm">
        <h2 className="mb-4 font-bold">Add Product</h2>
        <form onSubmit={save} className="space-y-3">
          <input name="name" required placeholder="Name" className="input-cyber w-full rounded-lg px-3 py-2" />
          <input name="sku" placeholder="SKU" className="input-cyber w-full rounded-lg px-3 py-2" />
          <input name="price" type="number" step="0.01" required placeholder="Price" className="input-cyber w-full rounded-lg px-3 py-2" />
          <input name="stockQty" type="number" defaultValue={0} placeholder="Stock qty" className="input-cyber w-full rounded-lg px-3 py-2" />
          <input name="lowStockAt" type="number" defaultValue={5} className="input-cyber w-full rounded-lg px-3 py-2" />
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-secondary">
              Product image
            </label>
            {productImageUrl && (
              <img
                src={productImageUrl}
                alt=""
                className="mb-2 h-24 w-24 rounded-lg object-cover"
              />
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
            <button type="button" onClick={() => setModal(null)} className="flex-1 py-2">Cancel</button>
            <button type="submit" className="flex-1 rounded-lg bg-primary-container py-2 font-bold text-on-primary-container">Save</button>
          </div>
        </form>
      </AppModal>
    </OwnerPageShell>
    </PageLoader>
  );
};

export default Inventory;
