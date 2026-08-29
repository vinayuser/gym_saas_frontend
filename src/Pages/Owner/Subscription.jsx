import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRequest } from '../../config/dataApi';
import ENDPOINTS from '../../config/apiUrls';
import PageLoader from '../../components/Loader/PageLoader';
import { SUBSCRIPTION_PLANS } from '../../constants';
import { getPlanByType } from '../../constants/saasPlans';
import { SUPPORT_EMAIL, buildPlanChangeMessage } from '../../constants/supportTopics';
import GlassCard from '../../components/fitsphere/GlassCard';
import Icon from '../../components/fitsphere/Icon';
import OwnerPageShell from '../../components/fitsphere/OwnerPageShell';
import { formatDate } from '../../helpers/formatUtils';

const formatInr = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(amount) || 0
  );

const STATUS_META = {
  TRIAL: { label: 'Trial', className: 'bg-amber-500/20 text-amber-300' },
  ACTIVE: { label: 'Active', className: 'bg-emerald-500/20 text-emerald-300' },
  EXPIRED: { label: 'Expired', className: 'bg-red-500/20 text-red-300' },
  CANCELLED: { label: 'Cancelled', className: 'bg-slate-500/20 text-slate-300' },
  PAST_DUE: { label: 'Past due', className: 'bg-orange-500/20 text-orange-300' },
};

const PAYMENT_STATUS_META = {
  COMPLETED: 'text-emerald-300',
  PENDING: 'text-amber-300',
  FAILED: 'text-red-300',
  REFUNDED: 'text-slate-300',
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b border-white/5 py-3 last:border-0">
    <span className="text-sm text-secondary">{label}</span>
    <span className="text-right text-sm font-medium text-on-surface">{value}</span>
  </div>
);

const Subscription = () => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRequest(ENDPOINTS.TENANT.ME)
      .then((res) => setTenant(res.data))
      .finally(() => setLoading(false));
  }, []);

  const subscription = tenant?.subscription;
  const plan = subscription?.plan;
  const usage = tenant?.usage;
  const statusMeta = STATUS_META[subscription?.status] || {
    label: subscription?.status || 'Unknown',
    className: 'bg-white/10 text-secondary',
  };

  const planMeta = useMemo(() => (plan?.type ? getPlanByType(plan.type) : null), [plan?.type]);

  const features = useMemo(() => {
    if (Array.isArray(plan?.features) && plan.features.length) return plan.features;
    return planMeta?.features || [];
  }, [plan?.features, planMeta]);

  const gymLimitLabel =
    plan?.gymLimit === -1 || usage?.gymLimit === -1
      ? 'Unlimited locations'
      : `${plan?.gymLimit ?? usage?.gymLimit ?? 1} gym location(s)`;

  const changePlanSupportLink = useMemo(() => {
    const planName = plan ? SUBSCRIPTION_PLANS[plan.type] || plan.name : '—';
    return {
      pathname: '/owner/support',
      state: {
        category: 'PLAN_CHANGE',
        subject: `Plan change request — ${tenant?.name || 'My gym'}`,
        message: buildPlanChangeMessage({
          tenantName: tenant?.name,
          tenantEmail: tenant?.email,
          planName,
          planStatus: subscription?.status,
        }),
      },
    };
  }, [tenant, plan, subscription?.status]);

  return (
    <PageLoader show={loading} message="Loading subscription...">
      <OwnerPageShell title="Subscription" showSearch={false}>
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Subscription</h1>
            <p className="mt-1 text-secondary/70">Your FitSphere Pro platform plan and gym location limits.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <GlassCard className="p-6 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-secondary">Current plan</p>
                  <h2 className="mt-1 font-display text-3xl font-bold text-primary-fixed">
                    {plan ? SUBSCRIPTION_PLANS[plan.type] || plan.name : 'No plan assigned'}
                  </h2>
                  <p className="mt-2 text-sm text-secondary">{planMeta?.description || gymLimitLabel}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusMeta.className}`}>
                  {statusMeta.label}
                </span>
              </div>

              <div className="mt-6 divide-y divide-white/5 rounded-xl border border-white/10 px-4">
                <DetailRow label="Gym locations included" value={gymLimitLabel} />
                <DetailRow
                  label="Monthly price"
                  value={plan?.priceMonthly != null ? `${formatInr(plan.priceMonthly)} / month` : '—'}
                />
                <DetailRow
                  label="Yearly price"
                  value={plan?.priceYearly != null ? `${formatInr(plan.priceYearly)} / year` : '—'}
                />
                {subscription?.currentPeriodStart && (
                  <DetailRow label="Current period start" value={formatDate(subscription.currentPeriodStart)} />
                )}
                {subscription?.currentPeriodEnd && (
                  <DetailRow label="Current period end" value={formatDate(subscription.currentPeriodEnd)} />
                )}
                {subscription?.status === 'TRIAL' && subscription?.trialEndsAt && (
                  <DetailRow label="Trial ends" value={formatDate(subscription.trialEndsAt)} />
                )}
                {subscription?.cancelledAt && (
                  <DetailRow label="Cancelled on" value={formatDate(subscription.cancelledAt)} />
                )}
                <DetailRow label="Business name" value={tenant?.name || '—'} />
                <DetailRow label="Billing email" value={tenant?.email || '—'} />
              </div>

              {features.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">Plan includes</h3>
                  <ul className="mt-3 space-y-2">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-on-surface">
                        <Icon name="check_circle" size={18} className="mt-0.5 shrink-0 text-primary-container" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold">Usage</h2>
              <p className="mt-1 text-sm text-secondary">Gym locations under this account</p>
              <p className="mt-4 font-display text-4xl font-bold text-on-surface">
                {usage?.gyms ?? 0}
                <span className="text-lg font-normal text-secondary">
                  {' '}
                  / {usage?.gymLimit === -1 ? '∞' : usage?.gymLimit ?? 1}
                </span>
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-primary-fixed transition-all"
                  style={{
                    width: `${
                      usage?.gymLimit === -1
                        ? Math.min(100, (usage?.gyms ?? 0) * 10)
                        : Math.min(100, ((usage?.gyms ?? 0) / (usage?.gymLimit || 1)) * 100)
                    }%`,
                  }}
                />
              </div>
              <Link
                to={changePlanSupportLink}
                className="mt-5 inline-flex items-center gap-2 text-sm text-primary-container hover:underline"
              >
                <Icon name="support_agent" size={18} />
                Request more locations
              </Link>
            </GlassCard>
          </div>

          {(subscription?.payments?.length ?? 0) > 0 && (
            <GlassCard className="overflow-hidden">
              <div className="border-b border-white/10 px-6 py-4">
                <h2 className="text-lg font-semibold">Recent platform payments</h2>
                <p className="mt-1 text-sm text-secondary">SaaS subscription charges for your owner account</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="border-b border-white/10 text-secondary">
                    <tr>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscription.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-white/5 last:border-0">
                        <td className="px-6 py-3">{formatDate(payment.paidAt || payment.createdAt)}</td>
                        <td className="px-6 py-3 font-medium">{formatInr(payment.amount)}</td>
                        <td className={`px-6 py-3 font-medium ${PAYMENT_STATUS_META[payment.status] || 'text-secondary'}`}>
                          {payment.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <Icon name="support_agent" size={28} className="shrink-0 text-primary-container" />
              <h2 className="text-lg font-semibold">Need to change your plan?</h2>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-secondary">
              Upgrades, downgrades, and billing cycle changes are handled by our support team so your gym
              locations and access stay in sync. Contact us with your current plan and the plan you want to move to.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={changePlanSupportLink}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-fixed px-5 py-3 text-sm font-semibold text-on-primary-fixed transition hover:opacity-90"
              >
                <Icon name="mail" size={18} />
                Request plan change
              </Link>
              <Link
                to="/owner/support"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-medium hover:bg-white/5"
              >
                <Icon name="help" size={18} />
                Visit support page
              </Link>
            </div>
            <p className="mt-5 text-sm text-secondary">
              Or email directly:{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary-container hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </GlassCard>
        </div>
      </OwnerPageShell>
    </PageLoader>
  );
};

export default Subscription;
