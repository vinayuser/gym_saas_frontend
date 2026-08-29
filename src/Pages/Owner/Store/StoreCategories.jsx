import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AppModal from '../../../components/fitsphere/AppModal';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import PageLoader from '../../../components/Loader/PageLoader';

const StoreCategories = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.CATEGORIES.LIST(currentGym.id)).then((res) => {
      setCategories(res.data || []);
      setLoading(false);
    });
  };

  useEffect(load, [currentGym?.id]);

  const openCreate = () => {
    setName('');
    setModal({ mode: 'create' });
  };

  const openEdit = (cat) => {
    setName(cat.name);
    setModal({ mode: 'edit', id: cat.id });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === 'edit') {
        await putRequest(ENDPOINTS.CATEGORIES.UPDATE(currentGym.id, modal.id), { name: name.trim() });
        toast.success('Category updated');
      } else {
        await postRequest(ENDPOINTS.CATEGORIES.CREATE(currentGym.id), { name: name.trim() });
        toast.success('Category created');
      }
      setModal(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch.</GlassCard>
      </OwnerPageShell>
    );
  }

  return (
    <PageLoader show={loading} message="Loading categories...">
      <OwnerPageShell showSearch={false}>
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">Store Categories</h1>
              <p className="mt-1 text-secondary/70">Organize products into categories for your gym store.</p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="cyber-glow flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 text-sm font-bold text-on-primary-container"
            >
              <Icon name="add" size={20} />
              Add Category
            </button>
          </div>

          <GlassCard className="overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase text-secondary/60">
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Products</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-medium">{cat.name}</td>
                    <td className="px-6 py-4 text-secondary">{cat._count?.products ?? 0}</td>
                    <td className="px-6 py-4 text-secondary">
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(cat)} className="rounded-lg p-2 hover:bg-white/5">
                          <Icon name="edit" size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`Delete "${cat.name}"?`)) return;
                            await deleteRequest(ENDPOINTS.CATEGORIES.DELETE(currentGym.id, cat.id));
                            toast.success('Category deleted');
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
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-secondary">
                      No categories yet. Create one to organize your products.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </GlassCard>
        </div>

        <AppModal open={Boolean(modal)} onClose={() => setModal(null)} size="sm">
          <h2 className="mb-4 font-display text-xl font-bold">
            {modal?.mode === 'edit' ? 'Edit Category' : 'New Category'}
          </h2>
          <form onSubmit={save} className="space-y-4">
            <input
              className="input-cyber w-full rounded-lg px-3 py-2.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              autoFocus
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5">Cancel</button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-primary-container py-2.5 font-bold text-on-primary-container disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </AppModal>
      </OwnerPageShell>
    </PageLoader>
  );
};

export default StoreCategories;
