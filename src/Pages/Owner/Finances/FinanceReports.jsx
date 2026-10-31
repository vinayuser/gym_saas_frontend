import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import StatCard from '../../../components/fitsphere/StatCard';
import FinanceCategoryFilter from '../../../components/fitsphere/FinanceCategoryFilter';
import FinanceExportActions from '../../../components/fitsphere/FinanceExportActions';
import SectionLoader from '../../../components/Loader/SectionLoader';
import { fetchFinanceLedger } from '../../../helpers/financeApi';
import {
  exportRevenueReportCsv,
  openFinanceReportPdf,
} from '../../../helpers/financeExportUtils';
import { formatCurrency } from '../../../helpers/formatUtils';

const FinanceReports = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [category, setCategory] = useState('ALL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.FINANCE.REPORTS(currentGym.id), { params: { category } })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [currentGym?.id, category]);

  const fetchLedgerForExport = () =>
    fetchFinanceLedger(currentGym.id, { category, exportAll: true });

  const handleExportCsv = async () => {
    if (!currentGym?.id || !data) return;
    setExporting(true);
    try {
      const ledgerEntries = await fetchLedgerForExport();
      exportRevenueReportCsv({
        gymName: currentGym.name,
        category,
        reportData: data,
        ledgerEntries,
      });
      toast.success('Revenue report exported as CSV');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!currentGym?.id || !data) return;
    setExporting(true);
    try {
      const ledgerEntries = await fetchLedgerForExport();
      openFinanceReportPdf({
        gymName: currentGym.name,
        category,
        title: 'Revenue Report',
        reportData: data,
        ledgerEntries,
      });
    } catch {
      toast.error('PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  const total = data?.breakdown?.reduce((s, b) => s + b.amount, 0) || 1;
  const hasData = (data?.breakdown || []).some((b) => b.amount > 0);

  return (
    <OwnerPageShell showSearch={false}>
      <SectionLoader show={loading}>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Reports &amp; Exports</h1>
            <p className="mt-1 text-secondary/70">
              Revenue summary with exportable CSV and PDF reports.
            </p>
          </div>
          <FinanceExportActions
            exporting={exporting}
            disabled={!hasData}
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
          />
        </div>

        <FinanceCategoryFilter value={category} onChange={setCategory} />

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total Revenue" value={formatCurrency(data?.totalRevenue)} icon="payments" accent />
          <StatCard label="Subscriptions" value={formatCurrency(data?.subscriptionRevenue)} icon="card_membership" />
          <StatCard label="Store Sales" value={formatCurrency(data?.storeRevenue)} icon="shopping_bag" />
          <StatCard label="Recorded expenses" value={formatCurrency(data?.totalExpenses)} icon="receipt_long" />
          <StatCard label="GST on invoices" value={formatCurrency(data?.vat)} icon="receipt" />
          <StatCard label="Net" value={formatCurrency(data?.netProfit)} icon="monitoring" />
        </div>

        <GlassCard className="p-6">
          <h3 className="mb-6 font-semibold">Revenue breakdown</h3>
          <div className="space-y-4">
            {(data?.breakdown || []).length === 0 ? (
              <p className="text-secondary">No revenue data for this filter.</p>
            ) : (
              data.breakdown.map((b) => (
                <div key={b.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{b.label}</span>
                    <span className="font-bold">{formatCurrency(b.amount)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-primary-container"
                      style={{ width: `${total > 0 ? (b.amount / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="mt-6 text-sm text-secondary">
            GST is the tax split from tax invoices (plan prices are tax-inclusive). Receipts without a GSTIN have ₹0 tax.
          </p>
        </GlassCard>
      </div>
      </SectionLoader>
    </OwnerPageShell>
  );
};

export default FinanceReports;
