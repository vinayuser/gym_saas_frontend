import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchFinancePayments } from '../../../helpers/financeApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import FinanceCategoryFilter from '../../../components/fitsphere/FinanceCategoryFilter';
import FinanceExportActions from '../../../components/fitsphere/FinanceExportActions';
import PageLoader from '../../../components/Loader/PageLoader';
import { FINANCE_CATEGORY_LABELS, sourceBadgeClass } from '../../../constants/financeCategories';
import { exportPaymentLedgerCsv } from '../../../helpers/financeExportUtils';
import { formatCurrency, formatDateTime } from '../../../helpers/formatUtils';

const FinancePayments = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [category, setCategory] = useState('ALL');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    fetchFinancePayments(currentGym.id, { category })
      .then(setRows)
      .finally(() => setLoading(false));
  }, [currentGym?.id, category]);

  const handleExportCsv = async () => {
    if (!currentGym?.id || rows.length === 0) return;
    setExporting(true);
    try {
      const allRows = await fetchFinancePayments(currentGym.id, { category, exportAll: true });
      exportPaymentLedgerCsv({
        gymName: currentGym.name,
        category,
        rows: allRows,
      });
      toast.success('Payment ledger exported as CSV');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <PageLoader show message="Loading payment ledger..." />;

  return (
    <OwnerPageShell showSearch={false}>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Payment Ledger</h1>
            <p className="mt-1 text-secondary/70">
              Membership payments and store order revenue by member.
            </p>
          </div>
          <FinanceExportActions
            exporting={exporting}
            disabled={rows.length === 0}
            onExportCsv={handleExportCsv}
          />
        </div>

        <FinanceCategoryFilter value={category} onChange={setCategory} />

        <div className="space-y-4">
          {rows.length === 0 ? (
            <GlassCard className="p-12 text-center text-secondary">
              No payment records for this source yet.
            </GlassCard>
          ) : (
            rows.map((m) => (
              <GlassCard key={`${m.source}-${m.id}`} className="p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold">{m.memberName}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sourceBadgeClass(m.source)}`}>
                        {FINANCE_CATEGORY_LABELS[m.source]}
                      </span>
                    </div>
                    <p className="text-sm text-secondary">
                      {m.memberCode || '—'} · {m.planName} · {m.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-secondary">Total received</p>
                    <p className="text-2xl font-bold text-primary-container">{formatCurrency(m.totalPaid)}</p>
                    {m.balance > 0 && (
                      <p className="text-sm text-error">Outstanding {formatCurrency(m.balance)}</p>
                    )}
                  </div>
                </div>
                {m.payments?.length > 0 && (
                  <table className="mt-4 w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase text-secondary/60">
                        <th className="py-2">Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.payments.map((p) => (
                        <tr key={p.id} className="border-t border-white/5">
                          <td className="py-2">{formatDateTime(p.paidAt || p.createdAt)}</td>
                          <td>{formatCurrency(p.amount)}</td>
                          <td>{p.status}</td>
                          <td>{p.method || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </OwnerPageShell>
  );
};

export default FinancePayments;
