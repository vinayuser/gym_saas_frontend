import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import StatCard from '../../../components/fitsphere/StatCard';
import FinanceCategoryFilter from '../../../components/fitsphere/FinanceCategoryFilter';
import PageLoader from '../../../components/Loader/PageLoader';
import { formatCurrency } from '../../../helpers/formatUtils';

const FinanceExpenses = () => {
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

  if (loading) return <PageLoader show message="Loading P&L..." />;

  const items = [
    { key: 'equipment', label: 'Equipment', icon: 'fitness_center' },
    { key: 'salaries', label: 'Salaries', icon: 'groups' },
    { key: 'rent', label: 'Rent & Utilities', icon: 'home' },
    { key: 'vendors', label: 'Vendors', icon: 'local_shipping' },
  ];

  const expensePct = data?.revenue > 0 ? Math.round((data.totalExpenses / data.revenue) * 100) : 0;

  return (
    <OwnerPageShell showSearch={false}>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Expenses &amp; P&amp;L</h1>
            <p className="mt-1 text-secondary/70">
              Revenue from real gym data; expense buckets are estimated ratios.
            </p>
          </div>
        </div>

        <FinanceCategoryFilter value={category} onChange={setCategory} />

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard label="Total Revenue" value={formatCurrency(data?.revenue)} icon="payments" accent />
          <StatCard label="Subscriptions" value={formatCurrency(data?.subscriptionRevenue)} icon="card_membership" />
          <StatCard label="Store Sales" value={formatCurrency(data?.storeRevenue)} icon="shopping_bag" />
        </div>

        <StatCard label="Net Profit Margin (est.)" value={`${data?.netMargin || 0}%`} icon="monitoring" accent />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <GlassCard key={item.key} className="p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">{item.label}</p>
              <p className="mt-2 text-2xl font-bold">{formatCurrency(data?.expenses?.[item.key])}</p>
              <p className="mt-1 text-xs text-secondary">Estimated</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-6">
          <h3 className="mb-4 font-semibold">Revenue vs Expenses</h3>
          <div className="flex h-40 items-end gap-4">
            <div className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-primary-container"
                style={{ height: data?.revenue ? '80%' : '8%' }}
              />
              <span className="text-xs text-secondary">Revenue {formatCurrency(data?.revenue)}</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-error/60"
                style={{ height: data?.revenue ? `${Math.min(expensePct, 100)}%` : '8%' }}
              />
              <span className="text-xs text-secondary">Expenses {formatCurrency(data?.totalExpenses)}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </OwnerPageShell>
  );
};

export default FinanceExpenses;
