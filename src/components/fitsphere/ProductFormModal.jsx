import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../config/apiUrls';
import { postRequest, putRequest } from '../../config/dataApi';
import { uploadMediaFile } from '../../helpers/mediaUpload';
import AppModal from './AppModal';
import Icon from './Icon';
import MediaFileDrop from './MediaFileDrop';

const inputClass = 'input-cyber w-full rounded-lg border border-white/10 bg-surface-container-lowest px-3 py-2.5 text-sm';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary';

export const EMPTY_PRODUCT_FORM = {
  name: '',
  sku: '',
  categoryId: '',
  price: '',
  stockQty: '0',
  lowStockAt: '5',
  description: '',
};

const productToForm = (p) => ({
  name: p.name || '',
  sku: p.sku || '',
  categoryId: p.categoryId || '',
  price: String(p.price ?? ''),
  stockQty: String(p.stockQty ?? 0),
  lowStockAt: String(p.lowStockAt ?? 5),
  description: p.description || '',
});

const parseCustomFields = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((f) => f && typeof f.label === 'string')
    .map((f) => ({ label: f.label, value: f.value || '' }));
};

const ProductFormModal = ({ open, onClose, mode, product, categories = [], gymId, onSaved }) => {
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);
  const [customFields, setCustomFields] = useState([]);
  const [productImageUrl, setProductImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && product) {
      setForm(productToForm(product));
      setCustomFields(parseCustomFields(product.customFields));
      setProductImageUrl(product.images?.[0] || '');
    } else {
      setForm(EMPTY_PRODUCT_FORM);
      setCustomFields([]);
      setProductImageUrl('');
    }
  }, [open, mode, product]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addCustomField = () => {
    if (customFields.length >= 20) {
      toast.error('Maximum 20 custom fields');
      return;
    }
    setCustomFields((rows) => [...rows, { label: '', value: '' }]);
  };

  const updateCustomField = (index, key, value) => {
    setCustomFields((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const removeCustomField = (index) => {
    setCustomFields((rows) => rows.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const asset = await uploadMediaFile(file, { folder: 'products', resourceType: 'image' });
      setProductImageUrl(asset.url);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast.error('Name and price are required');
      return;
    }

    const cleanedFields = customFields
      .map((f) => ({ label: f.label.trim(), value: f.value.trim() }))
      .filter((f) => f.label);

    setSaving(true);
    const body = {
      name: form.name.trim(),
      sku: form.sku || null,
      categoryId: form.categoryId || null,
      description: form.description.trim() || null,
      price: Number(form.price),
      stockQty: Number(form.stockQty || 0),
      lowStockAt: Number(form.lowStockAt || 5),
      images: productImageUrl ? [productImageUrl] : [],
      customFields: cleanedFields,
    };

    try {
      if (mode === 'edit' && product?.id) {
        await putRequest(ENDPOINTS.PRODUCTS.UPDATE(gymId, product.id), body);
        toast.success('Product updated');
      } else {
        await postRequest(ENDPOINTS.PRODUCTS.CREATE(gymId), body);
        toast.success('Product created');
      }
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModal open={open} onClose={onClose} size="2xl" scrollable>
      <h2 className="mb-1 font-display text-2xl font-bold">
        {mode === 'edit' ? 'Edit Product' : 'Add Product'}
      </h2>
      <p className="mb-6 text-sm text-secondary/70">
        Add product details, image, description, and custom fields shown in the member app.
      </p>

      <form onSubmit={save} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <MediaFileDrop
              label="Product image"
              hint="Drag & drop or browse — JPG, PNG, WebP"
              accept="image/jpeg,image/png,image/webp,image/gif"
              preview={productImageUrl || null}
              uploading={uploadingImage}
              onFile={handleImageUpload}
              onClear={() => setProductImageUrl('')}
            />

            <div>
              <label className={labelClass}>Product name{<span className="text-error"> *</span>}</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Premium Whey Isolate"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>SKU</label>
              <input className={inputClass} value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="Optional product code" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Price{<span className="text-error"> *</span>}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={labelClass}>Stock qty</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.stockQty}
                  onChange={(e) => set('stockQty', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Low stock alert at</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.lowStockAt}
                onChange={(e) => set('lowStockAt', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={`${inputClass} min-h-[140px] resize-y`}
                rows={6}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe the product — benefits, usage, ingredients, etc. Shown on the product detail page in the app."
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-surface-container-low/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Custom fields</p>
                  <p className="text-xs text-secondary/70">
                    Add stats like Protein, BCAAs, Servings — shown in a grid on the product page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-primary-container/30 px-3 py-1.5 text-xs font-semibold text-primary-container hover:bg-primary-container/10"
                >
                  <Icon name="add" size={16} />
                  Add field
                </button>
              </div>

              {customFields.length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/10 py-6 text-center text-xs text-secondary/60">
                  No custom fields yet. Click &quot;Add field&quot; to create dynamic product attributes.
                </p>
              ) : (
                <div className="space-y-2">
                  {customFields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        className={`${inputClass} flex-1`}
                        value={field.label}
                        onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                        placeholder="Label (e.g. Protein)"
                      />
                      <input
                        className={`${inputClass} flex-1`}
                        value={field.value}
                        onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                        placeholder="Value (e.g. 26G)"
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomField(index)}
                        className="rounded-lg p-2 text-error hover:bg-error/10"
                        aria-label="Remove field"
                      >
                        <Icon name="delete" size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/10 pt-4">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="flex-1 rounded-lg bg-primary-container py-2.5 text-sm font-bold text-on-primary-container disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </AppModal>
  );
};

export default ProductFormModal;
