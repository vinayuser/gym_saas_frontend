import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchFinancePayments } from '../../../helpers/financeApi';
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
import { exportPaymentLedgerCsv } from '../../../helpers/financeExportUtils';
import { formatCurrency, formatDateTime } from '../../../helpers/formatUtils';

const FinancePayments = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 350);
  const limit = 10;

  useEffect(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    fetchFinancePayments(currentGym.id, { category, page, limit, search: debouncedSearch || undefined })
      .then((res) => {
        setRows(res.items || []);
        setPagination(res.pagination || { total: 0 });
      })
      .finally(() => setLoading(false));
  }, [currentGym?.id, category, page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch, currentGym?.id]);

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

  return (
    <OwnerPageShell showSearch={false}>
      <TableShell
        title="Payment Ledger"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search payments..."
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
            disabled={rows.length === 0}
            onExportCsv={handleExportCsv}
          />
        }
        page={page}
        total={pagination.total || 0}
        limit={limit}
        loading={loading}
        onPage={setPage}
        noun="payments"
      >
        <table className={`${TABLE_CLASS} min-w-[720px]`}>
          <thead>
            <tr className={THEAD_ROW}>
              <th className={`w-12 ${TH}`}>#</th>
              <th className={TH}>Member</th>
              <th className={TH}>Source</th>
              <th className={TH}>Plan / item</th>
              <th className={TH}>Status</th>
              <th className={`${TH} text-right`}>Total received</th>
              <th className={`${TH} text-right`}>Outstanding</th>
              <th className={TH}>Last payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className={`${TD} py-12 text-center text-secondary`}>
                  No payment records for this source yet.
                </td>
              </tr>
            ) : (
              rows.map((m, i) => {
                const last = m.payments?.[0];
                return (
                  <tr key={`${m.source}-${m.id}`} className="hover:bg-white/[0.02]">
                    <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                      {tableRowNumber(page, limit, i)}
                    </td>
                    <td className={TD}>
                      <p className="font-medium">{m.memberName}</p>
                      <p className="text-xs text-secondary">{m.memberCode || '—'}</p>
                    </td>
                    <td className={TD}>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sourceBadgeClass(m.source)}`}>
                        {FINANCE_CATEGORY_LABELS[m.source]}
                      </span>
                    </td>
                    <td className={TD}>{m.planName || '—'}</td>
                    <td className={TD}>{m.status || '—'}</td>
                    <td className={`${TD} text-right font-semibold text-primary-container`}>
                      {formatCurrency(m.totalPaid)}
                    </td>
                    <td className={`${TD} text-right ${m.balance > 0 ? 'text-error' : 'text-secondary'}`}>
                      {m.balance > 0 ? formatCurrency(m.balance) : '—'}
                    </td>
                    <td className={`${TD} text-secondary`}>
                      {last ? formatDateTime(last.paidAt || last.createdAt) : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </TableShell>
    </OwnerPageShell>
  );
};

export default FinancePayments;
