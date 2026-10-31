import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  tableRowNumber,
} from '../../../components/fitsphere/TableShell';
import { formatCurrency, formatDateTime } from '../../../helpers/formatUtils';

const FinanceRefunds = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.FINANCE.REFUNDS(currentGym.id), { params: { page, limit } })
      .then((res) => {
        setRows(res.data || []);
        setPagination(res.meta?.pagination || { total: 0 });
      })
      .finally(() => setLoading(false));
  }, [currentGym?.id, page]);

  return (
    <OwnerPageShell showSearch={false}>
      <TableShell
        title="Refunds"
        page={page}
        total={pagination.total || 0}
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
              <th className={TH}>Amount</th>
              <th className={TH}>Method</th>
              <th className={TH}>Note</th>
              <th className={TH}>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className={`${TD} py-12 text-center text-secondary`}>
                  No refunds issued yet. Refund a payment from the member profile.
                </td>
              </tr>
            ) : (
              rows.map((m, i) => (
                <tr key={m.id} className="hover:bg-white/[0.02]">
                  <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                    {tableRowNumber(page, limit, i)}
                  </td>
                  <td className={TD}>
                    <p className="font-medium">
                      {m.member ? `${m.member.firstName} ${m.member.lastName}` : '—'}
                    </p>
                    <p className="text-xs text-secondary">{m.member?.memberCode || '—'}</p>
                  </td>
                  <td className={`${TD} font-semibold text-error`}>{formatCurrency(Math.abs(m.amount))}</td>
                  <td className={`${TD} text-secondary`}>{m.method || '—'}</td>
                  <td className={`${TD} text-secondary`}>{m.note || '—'}</td>
                  <td className={`${TD} text-secondary`}>{formatDateTime(m.paidAt || m.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableShell>
    </OwnerPageShell>
  );
};

export default FinanceRefunds;
