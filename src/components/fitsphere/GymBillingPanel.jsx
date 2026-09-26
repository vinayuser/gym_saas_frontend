import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import GlassCard from './GlassCard';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest, patchRequest } from '../../config/dataApi';

const inr = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(amount) || 0
  );

const GymBillingPanel = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    getRequest(ENDPOINTS.PLATFORM_BILLING.MINE)
      .then((res) => setAccount(res.data))
      .catch(() => {
        setAccount(null);
        setError('Could not load your gym bill. Refresh the page.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const saveDayPass = async (gym, dayPassPrice) => {
    setSavingId(gym.id);
    try {
      const res = await patchRequest(ENDPOINTS.GYMS.BILLING(gym.id), { dayPassPrice });
      setAccount(res.data);
      toast.success('Day-pass price saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update the day-pass price');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <GlassCard className="p-8 text-sm text-secondary">Loading your gym bill…</GlassCard>;
  }

  if (!account?.catalog) {
    return (
      <GlassCard className="space-y-3 p-6">
        <p className="text-sm text-secondary">{error || 'Your gym bill is not available yet.'}</p>
        <button
          type="button"
          onClick={load}
          className="rounded-lg bg-primary-fixed px-4 py-2 text-sm font-bold text-on-primary-fixed"
        >
          Try again
        </button>
      </GlassCard>
    );
  }

  const { catalog, gyms, quote } = account;
  const activeAddons = catalog.addons.filter((addon) => addon.isActive);
  const toolsOn = gyms.reduce(
    (sum, gym) => sum + activeAddons.filter((addon) => gym.addons[addon.key]).length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
        <GlassCard className="bg-primary-fixed/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-fixed">This month</p>
          <p className="mt-2 font-display text-4xl font-bold text-primary-fixed">{inr(quote?.total || 0)}</p>
          <p className="mt-1 text-sm text-secondary">
            First gym {inr(catalog.basePriceMonthly)} · extra gym {inr(catalog.extraGymPriceMonthly)}
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Gyms</p>
          <p className="mt-2 font-display text-4xl font-bold">{gyms.length}</p>
          <p className="mt-1 text-sm text-secondary">Locations on this account</p>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Tools on</p>
          <p className="mt-2 font-display text-4xl font-bold">{toolsOn}</p>
          <p className="mt-1 text-sm text-secondary">Set by the platform team</p>
        </GlassCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {gyms.map((gym) => {
          const gymLines = (quote?.lines || []).filter((line) => line.gymId === gym.id);
          const gymTotal = gymLines.reduce((sum, line) => sum + line.amount, 0);
          return (
            <GlassCard key={gym.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
                    {gym.isBase ? 'First gym' : 'Extra gym'}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold">{gym.name}</h2>
                </div>
                <p className="font-display text-xl font-bold text-primary-fixed">{inr(gymTotal)}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {activeAddons.map((addon) => {
                  const on = Boolean(gym.addons[addon.key]);
                  return (
                    <span
                      key={addon.key}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        on
                          ? 'border-primary-fixed/40 bg-primary-fixed/15 text-primary-fixed'
                          : 'border-white/10 text-secondary'
                      }`}
                    >
                      {addon.name} · {on ? 'On' : 'Off'}
                    </span>
                  );
                })}
              </div>
              {gym.addons.day_pass ? (
                <label className="mt-4 block text-sm">
                  <span className="mb-1 block text-xs font-semibold uppercase text-secondary">
                    Day-pass price (₹)
                  </span>
                  <input
                    type="number"
                    min="0"
                    disabled={savingId === gym.id}
                    defaultValue={gym.dayPassPrice ?? ''}
                    key={`${gym.id}-${gym.dayPassPrice}`}
                    onBlur={(e) => {
                      const next = e.target.value === '' ? null : Number(e.target.value);
                      if (next === gym.dayPassPrice) return;
                      saveDayPass(gym, next);
                    }}
                    className="input-cyber w-40 rounded-lg px-3 py-2"
                  />
                </label>
              ) : null}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default GymBillingPanel;
