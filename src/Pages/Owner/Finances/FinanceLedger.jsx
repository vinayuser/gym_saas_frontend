import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchFinanceLedger } from '../../../helpers/financeApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import FinanceCategoryFilter from '../../../components/fitsphere/FinanceCategoryFilter';
import FinanceExportActions from '../../../components/fitsphere/FinanceExportActions';
import PageLoader from '../../../components/Loader/PageLoader';
import { FINANCE_CATEGORY_LABELS, sourceBadgeClass } from '../../../constants/financeCategories';
import {
  exportGeneralLedgerCsv,
  openGeneralLedgerPdf,
} from '../../../helpers/financeExportUtils';
import { formatCurrency, formatDate } from '../../../helpers/formatUtils';

const FinanceLedger = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [category, setCategory] = useState('ALL');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    fetchFinanceLedger(currentGym.id, { category })
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [currentGym?.id, category]);

  const fetchAllEntries = () =>
    fetchFinanceLedger(currentGym.id, { category, exportAll: true });

  const handleExportCsv = async () => {
    if (!currentGym?.id) return;
    setExporting(true);
    try {
      const allEntries = await fetchAllEntries();
      exportGeneralLedgerCsv({
        gymName: currentGym.name,
        category,
        entries: allEntries,
      });
      toast.success('General ledger exported as CSV');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!currentGym?.id) return;
    setExporting(true);
    try {
      const allEntries = await fetchAllEntries();
      openGeneralLedgerPdf({
        gymName: currentGym.name,
        category,
        entries: allEntries,
      });
    } catch {
      toast.error('PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <PageLoader show message="Loading ledger..." />;

  return (
    <OwnerPageShell showSearch={false}>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">General Ledger</h1>
            <p className="mt-1 text-secondary/70">
              Debits, credits, GST, and running balance — export in standard accounting format.
            </p>
          </div>
          <FinanceExportActions
            exporting={exporting}
            disabled={entries.length === 0}
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
          />
        </div>

        <FinanceCategoryFilter value={category} onChange={setCategory} />

        <GlassCard className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase text-secondary/60">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Narration</th>
                <th className="px-6 py-3">Ref ID</th>
                <th className="px-6 py-3 text-right">Debit</th>
                <th className="px-6 py-3 text-right">Credit</th>
                <th className="px-6 py-3 text-right">GST</th>
                <th className="px-6 py-3">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-secondary">
                    No ledger entries for this source.
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">{formatDate(e.date)}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sourceBadgeClass(e.category)}`}>
                        {FINANCE_CATEGORY_LABELS[e.category]}
                      </span>
                    </td>
                    <td className="px-6 py-4">{e.narration}</td>
                    <td className="px-6 py-4 font-mono text-xs">{e.refId}</td>
                    <td className="px-6 py-4 text-right">{e.debit ? formatCurrency(e.debit) : '—'}</td>
                    <td className="px-6 py-4 text-right text-primary-container">
                      {e.credit ? formatCurrency(e.credit) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">{formatCurrency(e.gst)}</td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-white/10 px-2 py-0.5 text-xs">{e.method}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </OwnerPageShell>
  );
};

export default FinanceLedger;
