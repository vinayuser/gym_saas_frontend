import AppModal from './AppModal';
import Icon from './Icon';
import { formatCurrency } from '../../helpers/formatUtils';

const parseCustomFields = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw.filter((f) => f?.label);
};

const ProductDetailModal = ({ product, onClose }) => {
  if (!product) return null;

  const customFields = parseCustomFields(product.customFields);
  const inStock = product.stockQty > 0;

  return (
    <AppModal open={Boolean(product)} onClose={onClose} size="2xl" scrollable>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-high">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="aspect-[4/3] w-full object-contain bg-black/30" />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center">
              <Icon name="inventory_2" size={64} className="text-secondary/30" />
            </div>
          )}
          {inStock && (
            <span className="absolute right-3 top-3 rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container">
              IN STOCK
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">{product.name}</h2>
            {product.category?.name && (
              <p className="mt-1 text-sm text-secondary">{product.category.name}</p>
            )}
          </div>
          <p className="font-display text-2xl font-bold text-primary-container md:text-3xl">
            {formatCurrency(product.price)}
          </p>
        </div>

        {product.description && (
          <p className="text-sm leading-relaxed text-secondary/90">{product.description}</p>
        )}

        {customFields.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {customFields.map((field, i) => (
              <div
                key={`${field.label}-${i}`}
                className="rounded-xl border border-white/10 bg-surface-container-high/60 px-4 py-3 text-center"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary/70">{field.label}</p>
                <p className="mt-1 font-display text-lg font-bold">{field.value || '—'}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm text-secondary">
          <span>{inStock ? `${product.stockQty} available` : 'Out of stock'}</span>
          {product.sku && <span>SKU: {product.sku}</span>}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-primary-container py-3.5 text-sm font-bold text-on-primary-container"
        >
          Close
        </button>
      </div>
    </AppModal>
  );
};

export default ProductDetailModal;
