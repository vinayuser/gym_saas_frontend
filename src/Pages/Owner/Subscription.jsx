import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRequest } from '../../config/dataApi';
import ENDPOINTS from '../../config/apiUrls';
import OwnerPageShell from '../../components/fitsphere/OwnerPageShell';
import GymBillingPanel from '../../components/fitsphere/GymBillingPanel';
import TableShell, { TABLE_CLASS, TD, TH, THEAD_ROW, tableRowNumber } from '../../components/fitsphere/TableShell';
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

          <TableShell title="Payments">
            <table className={`${TABLE_CLASS} min-w-[720px]`}>
              <thead>
                <tr className={THEAD_ROW}>
                  <th className={`w-12 ${TH}`}>#</th>
                  <th className={TH}>Date</th>
                  <th className={TH}>Amount</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Provider</th>
                  <th className={TH}>Reference</th>
                  <th className={TH}>Currency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`${TD} py-10 text-center text-secondary`}>
                      No subscription payments yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, i) => (
                    <tr key={payment.id} className="hover:bg-white/[0.02]">
                      <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                        {tableRowNumber(1, payments.length, i)}
                      </td>
                      <td className={TD}>{formatDate(payment.paidAt || payment.createdAt)}</td>
                      <td className={`${TD} font-medium`}>{formatInr(payment.amount)}</td>
                      <td className={TD}>
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-semibold">
                          {payment.status || '—'}
                        </span>
                      </td>
                      <td className={`${TD} text-secondary`}>{payment.provider || '—'}</td>
                      <td className={`${TD} font-mono text-xs text-secondary`}>
                        {payment.providerRef || payment.id?.slice(0, 8) || '—'}
                      </td>
                      <td className={`${TD} text-secondary`}>{payment.currency || 'INR'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>
      </div>
    </OwnerPageShell>
  );
};

export default Subscription;
