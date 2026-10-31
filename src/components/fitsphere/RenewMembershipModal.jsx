import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest, postRequest } from '../../config/dataApi';
import AppModal from './AppModal';
import { PAYMENT_METHODS } from '../../constants/billing';
import { formatCurrency } from '../../helpers/formatUtils';

const RenewMembershipModal = ({ open, onClose, gymId, memberId, current, onSaved }) => {
  const [plans, setPlans] = useState([]);
  const [planId, setPlanId] = useState('');
  const [startMode, setStartMode] = useState('after_current');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [discount, setDiscount] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !gymId) return;
    getRequest(`${ENDPOINTS.PLANS.LIST(gymId)}?limit=100&isActive=true`).then((res) => {
      const items = (res.data || []).filter((p) => p.isActive);
      setPlans(items);
      const next = current?.planId || current?.plan?.id || items[0]?.id || '';
      setPlanId(next);
      const selected = items.find((p) => p.id === next);
      setAmount(selected ? String(selected.price) : '');
    });
    setStartMode('after_current');
    setMethod('CASH');
    setDiscount('0');
  }, [open, gymId, current]);

  useEffect(() => {
    const selected = plans.find((p) => p.id === planId);
    if (selected) setAmount(String(Math.max(0, selected.price - Number(discount || 0))));
  }, [planId, discount, plans]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await postRequest(ENDPOINTS.MEMBERS.RENEW(gymId, memberId), {
        planId,
        startMode,
        amount: Number(amount),
        method,
        discount: Number(discount) || 0,
      });
      toast.success('Membership renewed');
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const selected = plans.find((p) => p.id === planId);

  return (
    <AppModal open={open} onClose={onClose} size="md" scrollable>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold">Renew membership</h2>
          <p className="mt-1 text-sm text-secondary">Creates a new invoice for the next period.</p>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Plan</span>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="input-cyber w-full rounded-lg px-3 py-2">
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {formatCurrency(p.price)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Start</span>
          <select value={startMode} onChange={(e) => setStartMode(e.target.value)} className="input-cyber w-full rounded-lg px-3 py-2">
            <option value="after_current">After current end date</option>
            <option value="today">Start today (replace current)</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Discount (₹)</span>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="input-cyber w-full rounded-lg px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Collect now (₹)</span>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-cyber w-full rounded-lg px-3 py-2"
            />
          </label>
        </div>
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
        {selected ? (
          <p className="text-xs text-secondary">
            {selected.durationDays} days · collect 0 to leave the amount as due.
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !planId}
            className="rounded-lg bg-primary-fixed px-4 py-2 text-sm font-bold text-on-primary-fixed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Renew'}
          </button>
        </div>
      </form>
    </AppModal>
  );
};

export default RenewMembershipModal;
