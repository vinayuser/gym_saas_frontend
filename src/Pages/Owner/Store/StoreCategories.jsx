import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AppModal from '../../../components/fitsphere/AppModal';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import SectionLoader from '../../../components/Loader/SectionLoader';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  tableRowNumber,
} from '../../../components/fitsphere/TableShell';
import useDebouncedValue from '../../../hooks/useDebouncedValue';

const StoreCategories = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0 });
  const debouncedSearch = useDebouncedValue(search, 350);
  const limit = 10;

  const load = () => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.CATEGORIES.LIST(currentGym.id), {
      params: { page, limit, search: debouncedSearch || undefined },
    }).then((res) => {
      setCategories(Array.isArray(res.data) ? res.data : []);
      setPagination(res.meta?.pagination || { total: 0 });
      setLoading(false);
    });
  };

  useEffect(load, [currentGym?.id, page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, currentGym?.id]);

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
    <SectionLoader show={loading && !categories.length}>
      <OwnerPageShell showSearch={false}>
        <TableShell
          title="Store Categories"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search categories..."
          actions={
            <button
              type="button"
              onClick={openCreate}
              className="cyber-glow inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-3 py-2 text-xs font-bold text-on-primary-container"
            >
              <Icon name="add" size={16} />
              Add Category
            </button>
          }
          page={page}
          total={pagination.total || 0}
          limit={limit}
          loading={loading}
          onPage={setPage}
          noun="categories"
        >
          <table className={`${TABLE_CLASS} min-w-[720px]`}>
            <thead>
              <tr className={THEAD_ROW}>
                <th className={`w-12 ${TH}`}>#</th>
                <th className={TH}>Category</th>
                <th className={TH}>Products</th>
                <th className={TH}>Created</th>
                <th className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((cat, i) => (
                <tr key={cat.id} className="hover:bg-white/[0.02]">
                  <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                    {tableRowNumber(page, limit, i)}
                  </td>
                  <td className={`${TD} font-medium`}>{cat.name}</td>
                  <td className={`${TD} text-secondary`}>{cat._count?.products ?? 0}</td>
                  <td className={`${TD} text-secondary`}>{new Date(cat.createdAt).toLocaleDateString()}</td>
                  <td className={TD}>
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
                  <td colSpan={5} className={`${TD} py-12 text-center text-secondary`}>
                    No categories yet. Create one to organize your products.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableShell>

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
              <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5">
                Cancel
              </button>
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
    </SectionLoader>
  );
};

export default StoreCategories;
