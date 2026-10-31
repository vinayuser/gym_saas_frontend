import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../config/apiUrls';
import { postRequest } from '../../config/dataApi';
import AppModal from './AppModal';
import { PAYMENT_METHODS } from '../../constants/billing';
import { formatCurrency } from '../../helpers/formatUtils';

const CollectPaymentModal = ({ open, onClose, gymId, membership, onSaved }) => {
  const due = Number(membership?.balance || 0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount(due > 0 ? String(due) : '');
    setMethod('CASH');
    setNote('');
  }, [open, due]);

  const submit = async (e) => {
    e.preventDefault();
    if (!gymId || !membership?.id) return;
    setSaving(true);
    try {
      await postRequest(ENDPOINTS.FINANCE.COLLECT(gymId, membership.id), {
        amount: Number(amount),
        method,
        note: note || undefined,
      });
      toast.success('Payment recorded');
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModal open={open} onClose={onClose} size="md">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold">Collect payment</h2>
          <p className="mt-1 text-sm text-secondary">
            Outstanding {formatCurrency(due)}
            {membership?.plan?.name ? ` · ${membership.plan.name}` : ''}
          </p>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Amount (₹)</span>
          <input
            type="number"
            min="1"
            step="1"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-cyber w-full rounded-lg px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Method</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="input-cyber w-full rounded-lg px-3 py-2">
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Note</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="input-cyber w-full rounded-lg px-3 py-2" />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary-fixed px-4 py-2 text-sm font-bold text-on-primary-fixed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Record payment'}
          </button>
        </div>
      </form>
    </AppModal>
  );
};

export default CollectPaymentModal;
