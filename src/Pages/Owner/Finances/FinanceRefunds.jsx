import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchFinancePayments } from '../../../helpers/financeApi';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
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
import { formatCurrency, formatDateTime } from '../../../helpers/formatUtils';

const isRefundRow = (row) => {
  const status = String(row.status || '').toUpperCase();
  if (status.includes('REFUND')) return true;
  return (row.payments || []).some((p) => String(p.status || '').toUpperCase().includes('REFUND'));
};

const FinanceRefunds = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebouncedValue(search, 350);
  const limit = 10;

  useEffect(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    fetchFinancePayments(currentGym.id, {
      category,
      exportAll: true,
      search: debouncedSearch || undefined,
    })
      .then((res) => {
        const all = Array.isArray(res) ? res : res.items || [];
        setRows(all.filter(isRefundRow));
      })
      .finally(() => setLoading(false));
  }, [currentGym?.id, category, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch, currentGym?.id]);

  const pageRows = rows.slice((page - 1) * limit, page * limit);

  return (
    <OwnerPageShell showSearch={false}>
      <TableShell
        title="Refunds"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search refunds..."
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
        page={page}
        total={rows.length}
        limit={limit}
        loading={loading}
        onPage={setPage}
        noun="refunds"
      >
        <table className={`${TABLE_CLASS} min-w-[720px]`}>
          <thead>
            <tr className={THEAD_ROW}>
              <th className={`w-12 ${TH}`}>#</th>
              <th className={TH}>Member</th>
              <th className={TH}>Source</th>
              <th className={TH}>Plan / item</th>
              <th className={TH}>Status</th>
              <th className={`${TH} text-right`}>Amount</th>
              <th className={TH}>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={7} className={`${TD} py-12 text-center text-secondary`}>
                  No refunds found for this filter.
                </td>
              </tr>
            ) : (
              pageRows.map((m, i) => {
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
                    <td className={`${TD} text-right font-semibold text-error`}>
                      {formatCurrency(m.totalPaid || last?.amount)}
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

export default FinanceRefunds;
