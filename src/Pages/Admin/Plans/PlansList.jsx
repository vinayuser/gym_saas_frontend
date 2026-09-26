import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import GlassCard from '../../../components/fitsphere/GlassCard';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, patchRequest, putRequest } from '../../../config/dataApi';

const inr = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(amount) || 0
  );

const emptyToNull = (value) => (value === '' ? null : Number(value));

const limitFields = (prefix, limits) => ({
  [`${prefix}MaxStaff`]: limits?.staff ?? '',
  [`${prefix}MaxTrainers`]: limits?.trainers ?? '',
  [`${prefix}MaxMembers`]: limits?.members ?? '',
  [`${prefix}MaxPlans`]: limits?.plans ?? '',
});

const LimitInputs = ({ prefix, form, setForm }) => {
  const fields = [
    ['MaxStaff', 'Max staff'],
    ['MaxTrainers', 'Max trainers'],
    ['MaxMembers', 'Max members'],
    ['MaxPlans', 'Max membership plans'],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map(([key, label]) => (
        <label key={key} className="text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase text-secondary">{label}</span>
          <input
            type="number"
            min="1"
            placeholder="Unlimited"
            value={form[`${prefix}${key}`]}
            onChange={(e) => setForm((current) => ({ ...current, [`${prefix}${key}`]: e.target.value }))}
            className="input-cyber w-full rounded-lg px-3 py-2"
          />
        </label>
      ))}
    </div>
  );
};

const PlansList = () => {
  const [catalog, setCatalog] = useState(null);
  const [form, setForm] = useState(null);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await getRequest(ENDPOINTS.PLATFORM_BILLING.CATALOG);
      const next = res.data?.catalog;
      if (!next) {
        setLoadError('Plan catalog was empty.');
        setForm(null);
        return;
      }
      setCatalog(next);
      setAddons(next.addons || []);
      setForm({
        baseName: next.baseName,
        baseDescription: next.baseDescription,
        basePriceMonthly: next.basePriceMonthly,
        basePriceYearly: next.basePriceYearly,
        extraGymPriceMonthly: next.extraGymPriceMonthly,
        extraGymPriceYearly: next.extraGymPriceYearly,
        extraUseBaseLimits: next.extraUseBaseLimits,
        ...limitFields('base', next.baseLimits),
        ...limitFields('extra', next.extraLimits),
      });
    } catch {
      setCatalog(null);
      setForm(null);
      setLoadError('Could not load the plan. Refresh and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveCatalog = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await putRequest(ENDPOINTS.PLATFORM_BILLING.CATALOG, {
        baseName: form.baseName,
        baseDescription: form.baseDescription,
        basePriceMonthly: Number(form.basePriceMonthly),
        basePriceYearly: Number(form.basePriceYearly),
        extraGymPriceMonthly: Number(form.extraGymPriceMonthly),
        extraGymPriceYearly: Number(form.extraGymPriceYearly),
        extraUseBaseLimits: form.extraUseBaseLimits,
        baseMaxStaff: emptyToNull(form.baseMaxStaff),
        baseMaxTrainers: emptyToNull(form.baseMaxTrainers),
        baseMaxMembers: emptyToNull(form.baseMaxMembers),
        baseMaxPlans: emptyToNull(form.baseMaxPlans),
        extraMaxStaff: emptyToNull(form.extraMaxStaff),
        extraMaxTrainers: emptyToNull(form.extraMaxTrainers),
        extraMaxMembers: emptyToNull(form.extraMaxMembers),
        extraMaxPlans: emptyToNull(form.extraMaxPlans),
      });
      toast.success('Plan saved');
      load();
    } catch {
      /* toast from api */
    } finally {
      setSaving(false);
    }
  };

  const saveAddon = async (addon) => {
    try {
      const res = await patchRequest(ENDPOINTS.PLATFORM_BILLING.ADDON(addon.key), {
        name: addon.name,
        description: addon.description,
        pricePerGymMonthly: Number(addon.pricePerGymMonthly),
        pricePerGymYearly: Number(addon.pricePerGymYearly),
        isActive: addon.isActive,
      });
      setAddons(res.data?.catalog?.addons || addons);
      toast.success(`${addon.name} updated`);
    } catch {
      /* toast from api */
    }
  };

  if (loading) {
    return (
      <AdminPageShell showSearch={false}>
        <GlassCard className="p-8 text-center text-secondary">Loading plan…</GlassCard>
      </AdminPageShell>
    );
  }

  if (!form) {
    return (
      <AdminPageShell showSearch={false}>
        <GlassCard className="space-y-4 p-8 text-center">
          <p className="text-secondary">{loadError || 'Plan is not available.'}</p>
          <button
            type="button"
            onClick={load}
            className="rounded-lg bg-primary-fixed px-4 py-2 text-sm font-bold text-on-primary-fixed"
          >
            Try again
          </button>
        </GlassCard>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell showSearch={false}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Plans</h1>
        <p className="mt-1 text-secondary">
          One base gym, a price for each extra gym, and optional modules. Owners are billed from these numbers.
        </p>
      </div>

      <form onSubmit={saveCatalog} className="space-y-6">
        <GlassCard className="space-y-4 p-6">
          <h2 className="font-display text-xl font-bold">Base gym</h2>
          <p className="text-sm text-secondary">Charged once for the first gym. Empty limits mean unlimited.</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Name</span>
              <input
                required
                value={form.baseName}
                onChange={(e) => setForm({ ...form, baseName: e.target.value })}
                className="input-cyber w-full rounded-lg px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Monthly price (₹)</span>
              <input
                required
                type="number"
                min="0"
                value={form.basePriceMonthly}
                onChange={(e) => setForm({ ...form, basePriceMonthly: e.target.value })}
                className="input-cyber w-full rounded-lg px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Yearly price (₹)</span>
              <input
                required
                type="number"
                min="0"
                value={form.basePriceYearly}
                onChange={(e) => setForm({ ...form, basePriceYearly: e.target.value })}
                className="input-cyber w-full rounded-lg px-3 py-2"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Description</span>
            <textarea
              rows={2}
              value={form.baseDescription}
              onChange={(e) => setForm({ ...form, baseDescription: e.target.value })}
              className="input-cyber w-full rounded-lg px-3 py-2"
            />
          </label>
          <LimitInputs prefix="base" form={form} setForm={setForm} />
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <h2 className="font-display text-xl font-bold">Each extra gym</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Monthly price (₹)</span>
              <input
                required
                type="number"
                min="0"
                value={form.extraGymPriceMonthly}
                onChange={(e) => setForm({ ...form, extraGymPriceMonthly: e.target.value })}
                className="input-cyber w-full rounded-lg px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Yearly price (₹)</span>
              <input
                required
                type="number"
                min="0"
                value={form.extraGymPriceYearly}
                onChange={(e) => setForm({ ...form, extraGymPriceYearly: e.target.value })}
                className="input-cyber w-full rounded-lg px-3 py-2"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.extraUseBaseLimits}
              onChange={(e) => setForm({ ...form, extraUseBaseLimits: e.target.checked })}
            />
            Use the same limits as the first gym
          </label>
          {!form.extraUseBaseLimits ? <LimitInputs prefix="extra" form={form} setForm={setForm} /> : null}
        </GlassCard>

        <button
          type="submit"
          disabled={saving}
          className="neon-glow rounded-lg bg-primary-fixed px-6 py-3 font-bold text-on-primary-fixed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save plan'}
        </button>
      </form>

      <div className="mt-10 space-y-4">
        <h2 className="font-display text-xl font-bold">Add-ons</h2>
        <p className="text-sm text-secondary">
          Charged per gym when the owner turns the module on. Current base price is {inr(catalog?.basePriceMonthly)}.
        </p>
        {addons.map((addon, index) => (
          <GlassCard key={addon.key} className="grid gap-3 p-5 md:grid-cols-[1fr_140px_140px_auto] md:items-end">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase text-secondary">{addon.key}</span>
              <input
                value={addon.name}
                onChange={(e) => {
                  const next = [...addons];
                  next[index] = { ...addon, name: e.target.value };
                  setAddons(next);
                }}
                className="input-cyber mb-2 w-full rounded-lg px-3 py-2"
              />
              <input
                value={addon.description}
                onChange={(e) => {
                  const next = [...addons];
                  next[index] = { ...addon, description: e.target.value };
                  setAddons(next);
                }}
                className="input-cyber w-full rounded-lg px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase text-secondary">₹ / gym / month</span>
              <input
                type="number"
                min="0"
                value={addon.pricePerGymMonthly}
                onChange={(e) => {
                  const next = [...addons];
                  next[index] = { ...addon, pricePerGymMonthly: e.target.value };
                  setAddons(next);
                }}
                className="input-cyber w-full rounded-lg px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase text-secondary">₹ / gym / year</span>
              <input
                type="number"
                min="0"
                value={addon.pricePerGymYearly ?? ''}
                onChange={(e) => {
                  const next = [...addons];
                  next[index] = { ...addon, pricePerGymYearly: e.target.value };
                  setAddons(next);
                }}
                className="input-cyber w-full rounded-lg px-3 py-2"
              />
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={addon.isActive}
                  onChange={(e) => {
                    const next = [...addons];
                    next[index] = { ...addon, isActive: e.target.checked };
                    setAddons(next);
                  }}
                />
                Active
              </label>
              <button
                type="button"
                onClick={() => saveAddon(addons[index])}
                className="rounded-lg bg-primary-fixed px-4 py-2 text-sm font-bold text-on-primary-fixed"
              >
                Save
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </AdminPageShell>
  );
};

export default PlansList;
