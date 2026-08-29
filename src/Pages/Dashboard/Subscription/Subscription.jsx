import { useEffect, useState } from 'react';
import { getRequest } from '../../../config/dataApi';
import ENDPOINTS from '../../../config/apiUrls';
import PageLoader from '../../../components/Loader/PageLoader';
import { SUBSCRIPTION_PLANS } from '../../../constants';

const Subscription = () => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRequest(ENDPOINTS.TENANT.ME)
      .then((res) => setTenant(res.data))
      .finally(() => setLoading(false));
  }, []);

  const plan = tenant?.subscription?.plan;
  const usage = tenant?.usage;

  return (
    <PageLoader show={loading}>
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription</h1>
      <p className="text-slate-500">Manage your SaaS plan and usage</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Current Plan</h2>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {plan ? SUBSCRIPTION_PLANS[plan.type] || plan.name : 'No Plan'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Status: <span className="font-medium">{tenant?.subscription?.status}</span>
          </p>
          {tenant?.subscription?.currentPeriodEnd && (
            <p className="mt-1 text-sm text-slate-500">
              Renews: {new Date(tenant.subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Usage</h2>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>Gyms</span>
              <span className="font-medium">
                {usage?.gyms ?? 0} / {usage?.gymLimit === -1 ? '∞' : usage?.gymLimit ?? 1}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${Math.min(100, ((usage?.gyms ?? 0) / (usage?.gymLimit || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, label]) => (
          <div
            key={key}
            className={`rounded-xl border p-4 ${
              plan?.type === key
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <h3 className="font-semibold">{label}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {key === 'UNLIMITED' ? 'Unlimited gyms' : `${key.split('_')[0]} gym(s)`}
            </p>
          </div>
        ))}
      </div>
    </div>
    </PageLoader>
  );
};

export default Subscription;
