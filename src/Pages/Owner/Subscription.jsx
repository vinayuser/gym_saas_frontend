import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRequest } from '../../config/dataApi';
import ENDPOINTS from '../../config/apiUrls';
import OwnerPageShell from '../../components/fitsphere/OwnerPageShell';
import GlassCard from '../../components/fitsphere/GlassCard';
import GymBillingPanel from '../../components/fitsphere/GymBillingPanel';
import { formatDate } from '../../helpers/formatUtils';

const formatInr = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(amount) || 0
  );

const Subscription = () => {
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    getRequest(ENDPOINTS.TENANT.ME)
      .then((res) => setTenant(res.data))
      .catch(() => setTenant(null));
  }, []);

  const payments = tenant?.subscription?.payments || [];

  return (
    <OwnerPageShell title="Subscription" showSearch={false}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Subscription</h1>
            <p className="mt-1 text-sm text-secondary">
              {tenant ? `${tenant.name} · ${tenant.email}` : 'Your gyms and the tools included on each one.'}
            </p>
          </div>
          <Link to="/owner/support" className="text-sm text-primary-fixed hover:underline">
            Billing help
          </Link>
        </div>

        <GymBillingPanel />

          {payments.length > 0 ? (
            <GlassCard className="overflow-hidden">
              <div className="border-b border-white/10 px-6 py-4">
                <h2 className="text-lg font-semibold">Payments</h2>
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
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-white/5 last:border-0">
                        <td className="px-6 py-3">{formatDate(payment.paidAt || payment.createdAt)}</td>
                        <td className="px-6 py-3 font-medium">{formatInr(payment.amount)}</td>
                        <td className="px-6 py-3">{payment.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          ) : null}
      </div>
    </OwnerPageShell>
  );
};

export default Subscription;
