import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchFinanceLedger } from '../../../helpers/financeApi';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import FinanceExportActions from '../../../components/fitsphere/FinanceExportActions';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  TableSelect,
  tableRowNumber,
} from '../../../components/fitsphere/TableShell';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { FINANCE_CATEGORIES, FINANCE_CATEGORY_LABELS, sourceBadgeClass } from '../../../constants/financeCategories';
import {
  exportGeneralLedgerCsv,
  openGeneralLedgerPdf,
} from '../../../helpers/financeExportUtils';
import { formatCurrency, formatDate } from '../../../helpers/formatUtils';

const FinanceLedger = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 350);
  const limit = 10;

  useEffect(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    fetchFinanceLedger(currentGym.id, { category, page, limit, search: debouncedSearch || undefined })
      .then((res) => {
        setEntries(res.items || []);
        setPagination(res.pagination || { total: 0 });
      })
      .finally(() => setLoading(false));
  }, [currentGym?.id, category, page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch, currentGym?.id]);

  const fetchAllEntries = () => fetchFinanceLedger(currentGym.id, { category, exportAll: true });

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

  return (
    <OwnerPageShell showSearch={false}>
      <TableShell
        title="General Ledger"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search ledger..."
        filters={
          <TableSelect
            value={category}
            onChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
          >
            {FINANCE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </TableSelect>
        }
        actions={
          <FinanceExportActions
            exporting={exporting}
            disabled={entries.length === 0}
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
          />
        }
        page={page}
        total={pagination.total || 0}
        limit={limit}
        loading={loading}
        onPage={setPage}
        noun="entries"
      >
        <table className={`${TABLE_CLASS} min-w-[900px]`}>
          <thead>
            <tr className={THEAD_ROW}>
              <th className={`w-12 ${TH}`}>#</th>
              <th className={TH}>Date</th>
              <th className={TH}>Source</th>
              <th className={TH}>Narration</th>
              <th className={TH}>Ref ID</th>
              <th className={`${TH} text-right`}>Debit</th>
              <th className={`${TH} text-right`}>Credit</th>
              <th className={`${TH} text-right`}>GST</th>
              <th className={TH}>Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={9} className={`${TD} py-12 text-center text-secondary`}>
                  No ledger entries for this source.
                </td>
              </tr>
            ) : (
              entries.map((e, i) => (
                <tr key={e.id} className="hover:bg-white/[0.02]">
                  <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                    {tableRowNumber(page, limit, i)}
                  </td>
                  <td className={TD}>{formatDate(e.date)}</td>
                  <td className={TD}>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sourceBadgeClass(e.category)}`}>
                      {FINANCE_CATEGORY_LABELS[e.category]}
                    </span>
                  </td>
                  <td className={TD}>{e.narration}</td>
                  <td className={`${TD} font-mono text-xs`}>{e.refId}</td>
                  <td className={`${TD} text-right`}>{e.debit ? formatCurrency(e.debit) : '—'}</td>
                  <td className={`${TD} text-right text-primary-container`}>
                    {e.credit ? formatCurrency(e.credit) : '—'}
                  </td>
                  <td className={`${TD} text-right`}>{formatCurrency(e.gst)}</td>
                  <td className={TD}>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-xs">{e.method}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableShell>
    </OwnerPageShell>
  );
};

export default FinanceLedger;
