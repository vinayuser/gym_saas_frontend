import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import StatCard from '../../../components/fitsphere/StatCard';
import FinanceCategoryFilter from '../../../components/fitsphere/FinanceCategoryFilter';
import SectionLoader from '../../../components/Loader/SectionLoader';
import { formatCurrency } from '../../../helpers/formatUtils';

const FinancePnL = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [category, setCategory] = useState('ALL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.FINANCE.EXPENSES(currentGym.id), { params: { category } })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [currentGym?.id, category]);

  const revenue = data?.revenue || 0;
  const expenses = data?.totalExpenses || 0;
  const profit = revenue - expenses;
  const expensePct = revenue > 0 ? Math.round((expenses / revenue) * 100) : 0;

  return (
    <OwnerPageShell showSearch={false}>
      <SectionLoader show={loading}>
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Profit &amp; Loss</h1>
            <p className="mt-1 text-secondary/70">Revenue versus estimated operating expenses.</p>
          </div>

          <FinanceCategoryFilter value={category} onChange={setCategory} />

          <div className="grid gap-6 md:grid-cols-3">
            <StatCard label="Revenue" value={formatCurrency(revenue)} icon="payments" accent />
            <StatCard label="Expenses (est.)" value={formatCurrency(expenses)} icon="receipt_long" />
            <StatCard
              label="Net profit (est.)"
              value={formatCurrency(profit)}
              icon="monitoring"
              sub={`${data?.netMargin || 0}% margin`}
            />
          </div>

          <GlassCard className="p-6">
            <h3 className="mb-4 font-semibold">Revenue vs Expenses</h3>
            <div className="flex h-40 items-end gap-4">
              <div className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-primary-container"
                  style={{ height: revenue ? '80%' : '8%' }}
                />
                <span className="text-xs text-secondary">Revenue {formatCurrency(revenue)}</span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-error/60"
                  style={{ height: revenue ? `${Math.min(expensePct, 100)}%` : '8%' }}
                />
                <span className="text-xs text-secondary">Expenses {formatCurrency(expenses)}</span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t ${profit >= 0 ? 'bg-emerald-400/70' : 'bg-error/60'}`}
                  style={{
                    height: revenue ? `${Math.min(Math.abs(Math.round((profit / revenue) * 100)), 100)}%` : '8%',
                  }}
                />
                <span className="text-xs text-secondary">Net {formatCurrency(profit)}</span>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Equipment', data?.expenses?.equipment],
              ['Salaries', data?.expenses?.salaries],
              ['Rent & Utilities', data?.expenses?.rent],
              ['Vendors', data?.expenses?.vendors],
            ].map(([label, amount]) => (
              <GlassCard key={label} className="p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-secondary">{label}</p>
                <p className="mt-2 text-xl font-bold">{formatCurrency(amount)}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </SectionLoader>
    </OwnerPageShell>
  );
};

export default FinancePnL;
