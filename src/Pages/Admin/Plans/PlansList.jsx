import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import AppModal from '../../../components/fitsphere/AppModal';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, patchRequest } from '../../../config/dataApi';
import { formatCurrency } from '../../../helpers/formatUtils';

const TYPE_LABELS = {
  SINGLE_GYM: 'Single Gym',
  TWO_GYMS: '2 Gyms',
  FIVE_GYMS: '5 Gyms',
  UNLIMITED: 'Unlimited',
};

const gymLimitLabel = (limit) => (limit === -1 ? 'Unlimited' : String(limit));

const PlansList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    priceMonthly: '',
    priceYearly: '',
    gymLimit: '',
    isActive: true,
  });
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRequest(ENDPOINTS.SAAS_PLANS.LIST);
      setPlans(res.data?.plans || []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (plan) => {
    setEditPlan(plan);
    setForm({
      name: plan.name || '',
      priceMonthly: String(plan.priceMonthly ?? ''),
      priceYearly: String(plan.priceYearly ?? ''),
      gymLimit: String(plan.gymLimit ?? ''),
      isActive: plan.isActive !== false,
    });
  };

  const closeEdit = () => {
    setEditPlan(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editPlan) return;
    setSaving(true);
    try {
      await patchRequest(ENDPOINTS.SAAS_PLANS.UPDATE(editPlan.id), {
        name: form.name.trim(),
        priceMonthly: Number(form.priceMonthly),
        priceYearly: Number(form.priceYearly),
        gymLimit: Number(form.gymLimit),
        isActive: form.isActive,
      });
      toast.success('Plan updated');
      closeEdit();
      load();
    } catch {
      /* toast from api */
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (plan) => {
    setBusyId(plan.id);
    try {
      await patchRequest(ENDPOINTS.SAAS_PLANS.UPDATE(plan.id), { isActive: !plan.isActive });
      toast.success(plan.isActive ? 'Plan deactivated' : 'Plan activated');
      load();
    } catch {
      /* toast from api */
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <AdminPageShell showSearch={false}>
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">SaaS Plans</h1>
            <p className="mt-1 text-secondary/70">
              Platform subscription tiers used when inviting gym owners.
            </p>
          </div>

          {loading ? (
            <GlassCard className="p-8 text-center text-secondary">Loading plans…</GlassCard>
          ) : plans.length === 0 ? (
            <GlassCard className="p-8 text-center text-secondary">
              No plans found. Run the database seed to create default SaaS plans.
            </GlassCard>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => (
                <GlassCard key={plan.id} className="flex flex-col p-5">
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
                        {TYPE_LABELS[plan.type] || plan.type}
                      </p>
                      <h2 className="font-display text-xl font-bold text-on-surface">{plan.name}</h2>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                        plan.isActive
                          ? 'border-primary-container/30 bg-primary-container/15 text-primary-container'
                          : 'border-white/10 bg-white/5 text-secondary'
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="font-display text-3xl font-bold text-primary-container">
                    {formatCurrency(plan.priceMonthly)}
                    <span className="text-sm font-medium text-secondary">/mo</span>
                  </p>
                  <p className="mt-1 text-sm text-secondary">
                    {formatCurrency(plan.priceYearly)}/yr · {gymLimitLabel(plan.gymLimit)} gym
                    {plan.gymLimit === 1 ? '' : 's'}
                  </p>

                  <div className="mt-4 flex gap-4 text-xs text-secondary">
                    <span>
                      <strong className="text-on-surface">{plan.subscriptionCount}</strong> subs
                    </span>
                    <span>
                      <strong className="text-on-surface">{plan.inviteCount}</strong> invites
                    </span>
                  </div>

                  <div className="mt-auto flex gap-2 pt-5">
                    <button
                      type="button"
                      onClick={() => openEdit(plan)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/5"
                    >
                      <Icon name="edit" size={16} />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busyId === plan.id}
                      onClick={() => toggleActive(plan)}
                      className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-secondary hover:bg-white/5 disabled:opacity-50"
                    >
                      {plan.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          <GlassCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-widest text-secondary/60">
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3">Gym limit</th>
                    <th className="px-6 py-3">Monthly</th>
                    <th className="px-6 py-3">Yearly</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {plans.map((plan, index) => (
                    <tr key={plan.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-xs text-secondary">{index + 1}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-xs text-secondary">{plan.type}</p>
                      </td>
                      <td className="px-6 py-4">{gymLimitLabel(plan.gymLimit)}</td>
                      <td className="px-6 py-4 text-primary-container">
                        {formatCurrency(plan.priceMonthly)}
                      </td>
                      <td className="px-6 py-4">{formatCurrency(plan.priceYearly)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                            plan.isActive
                              ? 'border-primary-container/30 bg-primary-container/15 text-primary-container'
                              : 'border-white/10 bg-white/5 text-secondary'
                          }`}
                        >
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(plan)}
                          className="rounded p-2 text-secondary hover:bg-white/10 hover:text-on-surface"
                          title="Edit plan"
                        >
                          <Icon name="edit" size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </AdminPageShell>

      <AppModal open={Boolean(editPlan)} onClose={closeEdit} size="md">
        <h2 className="font-display text-xl font-bold">Edit plan</h2>
        <p className="mt-1 text-sm text-secondary">
          {editPlan ? TYPE_LABELS[editPlan.type] || editPlan.type : ''}
        </p>
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
              Display name
            </label>
            <input
              className="input-cyber"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
                Monthly price
              </label>
              <input
                type="number"
                min="0"
                step="1"
                className="input-cyber"
                value={form.priceMonthly}
                onChange={(e) => setForm((f) => ({ ...f, priceMonthly: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
                Yearly price
              </label>
              <input
                type="number"
                min="0"
                step="1"
                className="input-cyber"
                value={form.priceYearly}
                onChange={(e) => setForm((f) => ({ ...f, priceYearly: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
              Gym limit (−1 = unlimited)
            </label>
            <input
              type="number"
              className="input-cyber"
              value={form.gymLimit}
              onChange={(e) => setForm((f) => ({ ...f, gymLimit: e.target.value }))}
              required
            />
          </div>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 px-4 py-3">
            <span className="text-sm font-medium">Active (available for invites)</span>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 accent-primary-container"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeEdit}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-secondary hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </AppModal>
    </>
  );
};

export default PlansList;
