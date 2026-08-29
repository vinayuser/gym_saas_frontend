import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import StatCard from '../../../components/fitsphere/StatCard';
import FinanceCategoryFilter from '../../../components/fitsphere/FinanceCategoryFilter';
import PageLoader from '../../../components/Loader/PageLoader';
import { FINANCE_CATEGORY_LABELS, sourceBadgeClass } from '../../../constants/financeCategories';
import { formatCurrency, formatDateTime } from '../../../helpers/formatUtils';

const FinanceOverview = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [category, setCategory] = useState('ALL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.FINANCE.OVERVIEW(currentGym.id), { params: { category } })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [currentGym?.id, category]);

  return (
    <PageLoader show={loading} message="Loading finances...">
      <OwnerPageShell showSearch={false}>
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Financial Overview</h1>
            <p className="mt-1 text-secondary/70">
              Revenue from subscriptions, store orders, and billing — filtered by source.
            </p>
          </div>

          <FinanceCategoryFilter value={category} onChange={setCategory} />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Revenue" value={formatCurrency(data?.totalRevenue)} icon="payments" accent />
            <StatCard label="Subscriptions" value={formatCurrency(data?.subscriptionRevenue)} icon="card_membership" sub="Membership payments" />
            <StatCard label="Store Sales" value={formatCurrency(data?.storeRevenue)} icon="shopping_bag" sub={`${data?.orderCount || 0} orders`} />
            <StatCard label="Pending" value={formatCurrency(data?.pendingAmount)} icon="hourglass_empty" sub={`${data?.pendingCount || 0} open items`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <GlassCard className="p-6 lg:col-span-2">
              <h3 className="mb-4 font-semibold">Revenue trend (last 8 weeks)</h3>
              {(data?.trend || []).every((t) => t.amount === 0) ? (
                <p className="text-sm text-secondary">No revenue recorded for this source yet.</p>
              ) : (
                <div className="flex h-48 items-end gap-2">
                  {(data?.trend || []).map((t) => (
                    <div key={t.label} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-primary-container/70"
                        style={{ height: `${Math.max(t.pct, 4)}%` }}
                        title={formatCurrency(t.amount)}
                      />
                      <span className="text-[10px] text-secondary">{t.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
            <GlassCard className="p-6">
              <h3 className="mb-4 font-semibold">Quick links</h3>
              <Link
                to="/owner/finances/payments"
                className="mb-3 flex w-full items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm hover:bg-white/5"
              >
                <Icon name="account_balance_wallet" size={20} />
                Payment ledger
              </Link>
              <Link
                to="/owner/finances/ledger"
                className="flex w-full items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm hover:bg-white/5"
              >
                <Icon name="menu_book" size={20} />
                General ledger
              </Link>
            </GlassCard>
          </div>

          <GlassCard className="p-6">
            <h3 className="mb-4 font-semibold">Recent activity</h3>
            <ul className="space-y-3">
              {(data?.recent || []).length === 0 ? (
                <li className="text-secondary">No transactions for this filter.</li>
              ) : (
                data.recent.map((item) => (
                  <li key={item.id} className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.label}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sourceBadgeClass(item.source)}`}>
                          {FINANCE_CATEGORY_LABELS[item.source]}
                        </span>
                      </div>
                      <p className="text-xs text-secondary">{formatDateTime(item.at)} · {item.status}</p>
                    </div>
                    <span className="font-bold text-primary-container">{formatCurrency(item.amount)}</span>
                  </li>
                ))
              )}
            </ul>
          </GlassCard>
        </div>
      </OwnerPageShell>
    </PageLoader>
  );
};

export default FinanceOverview;
