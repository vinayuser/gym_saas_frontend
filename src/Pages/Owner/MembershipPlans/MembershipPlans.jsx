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
import { formatCurrency } from '../../../helpers/formatUtils';

const CYCLE_LABELS = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
};

const StatCard = ({ label, value, icon, accent }) => (
  <GlassCard className="rounded-xl p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-secondary">{label}</p>
        <h3 className={`mt-2 font-display text-4xl font-bold ${accent ? 'text-primary-container' : ''}`}>
          {value}
        </h3>
      </div>
      <div className={`rounded-lg p-2 ${accent ? 'bg-primary-fixed/10' : 'bg-white/5'}`}>
        <Icon name={icon} className={accent ? 'text-primary-fixed' : 'text-secondary'} />
      </div>
    </div>
  </GlassCard>
);

const PlanFormModal = ({ open, plan, onClose, onSave }) => (
  <AppModal open={open} onClose={onClose} size="md">
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-xl font-bold">{plan?.id ? 'Edit Plan' : 'New Plan'}</h2>
        <p className="mt-1 text-sm text-secondary">
          {plan?.id ? 'Update pricing and billing details.' : 'Create a membership tier for your gym.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-2 text-secondary transition-colors hover:bg-white/10 hover:text-on-surface"
      >
        <Icon name="close" size={22} />
      </button>
    </div>

    <form onSubmit={onSave} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-secondary">Plan name</label>
        <input
          name="name"
          defaultValue={plan?.name || ''}
          required
          placeholder="e.g. Elite Monthly"
          className="fitsphere-input"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-secondary">Description</label>
        <textarea
          name="description"
          defaultValue={plan?.description || ''}
          placeholder="What's included in this plan?"
          className="fitsphere-input min-h-[80px] resize-none"
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-secondary">Billing cycle</label>
          <select
            name="billingCycle"
            defaultValue={plan?.billingCycle || 'MONTHLY'}
            className="fitsphere-input"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-secondary">Price (₹)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={plan?.price ?? ''}
            required
            placeholder="999"
            className="fitsphere-input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-secondary">Duration (days)</label>
        <input
          name="durationDays"
          type="number"
          min="1"
          defaultValue={plan?.durationDays || 30}
          required
          placeholder="30"
          className="fitsphere-input"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={plan?.isActive !== false}
          className="h-4 w-4 accent-primary-fixed"
        />
        <span className="text-sm font-medium">Active — visible when assigning memberships</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-white/20 py-2.5 text-sm font-semibold transition-colors hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="neon-glow flex-1 rounded-lg bg-neon py-2.5 text-sm font-bold text-on-primary-fixed"
        >
          {plan?.id ? 'Save Changes' : 'Create Plan'}
        </button>
      </div>
    </form>
  </AppModal>
);

const MembershipPlans = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);

  const load = async () => {
    if (!currentGym?.id) return;
    setLoading(true);
    try {
      const res = await getRequest(`${ENDPOINTS.PLANS.LIST(currentGym.id)}?limit=100`);
      const items = Array.isArray(res.data) ? res.data : [];
      setPlans(items);
    } catch {
      toast.error('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [currentGym?.id]);

  const filteredPlans =
    filter === 'active'
      ? plans.filter((p) => p.isActive)
      : filter === 'archived'
        ? plans.filter((p) => !p.isActive)
        : plans;

  const savePlan = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      name: fd.get('name'),
      description: fd.get('description'),
      billingCycle: fd.get('billingCycle'),
      price: Number(fd.get('price')),
      durationDays: Number(fd.get('durationDays')),
      isActive: fd.get('isActive') === 'on',
    };
    try {
      if (modal?.id) {
        await putRequest(ENDPOINTS.PLANS.UPDATE(currentGym.id, modal.id), body);
        toast.success('Plan updated');
      } else {
        await postRequest(ENDPOINTS.PLANS.CREATE(currentGym.id), body);
        toast.success('Plan created');
      }
      setModal(null);
      load();
    } catch {
      toast.error('Failed to save plan');
    }
  };

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch to manage membership plans.</GlassCard>
      </OwnerPageShell>
    );
  }

  const activeCount = plans.filter((p) => p.isActive).length;
  const archivedCount = plans.filter((p) => !p.isActive).length;
  const totalMembers = plans.reduce((sum, p) => sum + (p._count?.memberships ?? 0), 0);

  const filters = [
    ['all', `All Plans (${plans.length})`],
    ['active', `Active (${activeCount})`],
    ['archived', `Archived (${archivedCount})`],
  ];

  return (
    <PageLoader show={loading && !plans.length} message="Loading plans...">
      <OwnerPageShell showSearch={false}>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Membership &amp; Plans
              </h1>
              <p className="mt-1 text-secondary/70">
                Configure pricing tiers and billing cycles for your members.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModal({})}
              className="neon-glow flex items-center justify-center gap-2 rounded-lg bg-neon px-6 py-2.5 text-sm font-bold text-on-primary-fixed transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Icon name="add" size={20} />
              Create New Plan
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard label="Total Plans" value={plans.length} icon="card_membership" accent />
            <StatCard label="Active Plans" value={activeCount} icon="verified" />
            <StatCard label="Members on Plans" value={totalMembers} icon="groups" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filters.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  filter === value
                    ? 'bg-primary-container text-on-primary-container'
                    : 'border border-white/10 text-secondary hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Plans table */}
          <GlassCard className="overflow-hidden rounded-xl p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    {['Plan Name', 'Price', 'Billing', 'Duration', 'Members', 'Status', ''].map((col) => (
                      <th
                        key={col || 'actions'}
                        className={`px-6 py-3 text-xs font-semibold uppercase tracking-widest text-secondary ${
                          col === '' ? 'text-right' : ''
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPlans.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-secondary">
                        {filter === 'all' ? (
                          <>
                            <p>No membership plans found.</p>
                            <button
                              type="button"
                              onClick={() => setModal({})}
                              className="mt-2 text-sm text-primary-container hover:underline"
                            >
                              Create your first plan
                            </button>
                          </>
                        ) : (
                          <>
                            <p>No {filter} plans found.</p>
                            <button
                              type="button"
                              onClick={() => setFilter('all')}
                              className="mt-2 text-sm text-primary-container hover:underline"
                            >
                              View all plans
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan) => (
                      <tr key={plan.id} className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-6 py-4">
                          <p className="font-semibold">{plan.name}</p>
                          <p className="mt-0.5 max-w-xs truncate text-xs text-secondary">
                            {plan.description || 'No description'}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-display text-lg font-bold text-primary-container">
                          {formatCurrency(plan.price)}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary">
                          {CYCLE_LABELS[plan.billingCycle] || plan.billingCycle}
                        </td>
                        <td className="px-6 py-4 text-sm text-secondary">{plan.durationDays} days</td>
                        <td className="px-6 py-4 text-sm">{plan._count?.memberships ?? 0}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              plan.isActive
                                ? 'bg-primary-container/20 text-primary-container'
                                : 'bg-white/10 text-secondary'
                            }`}
                          >
                            {plan.isActive ? 'Active' : 'Archived'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setModal(plan)}
                              className="rounded-lg p-2 text-secondary transition-colors hover:bg-white/5 hover:text-primary-fixed"
                              aria-label="Edit plan"
                            >
                              <Icon name="edit" size={20} />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    'Archive this plan? Existing memberships will not be affected.'
                                  )
                                ) {
                                  try {
                                    await deleteRequest(ENDPOINTS.PLANS.DELETE(currentGym.id, plan.id));
                                    toast.success('Plan archived');
                                    load();
                                  } catch {
                                    toast.error('Failed to archive plan');
                                  }
                                }
                              }}
                              className="rounded-lg p-2 text-secondary transition-colors hover:bg-error/10 hover:text-error"
                              aria-label="Archive plan"
                            >
                              <Icon name="archive" size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </OwnerPageShell>

      <PlanFormModal
        open={modal !== null}
        plan={modal?.id ? modal : null}
        onClose={() => setModal(null)}
        onSave={savePlan}
      />
    </PageLoader>
  );
};

export default MembershipPlans;
