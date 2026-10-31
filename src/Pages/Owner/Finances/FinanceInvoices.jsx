import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, postRequest } from '../../../config/dataApi';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import AppModal from '../../../components/fitsphere/AppModal';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  tableRowNumber,
} from '../../../components/fitsphere/TableShell';
import { formatCurrency, formatDate } from '../../../helpers/formatUtils';

const FinanceInvoices = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const limit = 10;

  const load = () => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.FINANCE.INVOICES(currentGym.id), { params: { page, limit } })
      .then((res) => {
        setRows(res.data || []);
        setPagination(res.meta?.pagination || { total: 0 });
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [currentGym?.id, page]);

  const open = async (id) => {
    const res = await getRequest(ENDPOINTS.FINANCE.INVOICE(currentGym.id, id));
    setInvoice(res.data);
  };

  const send = async (id) => {
    await postRequest(ENDPOINTS.FINANCE.INVOICE_SEND(currentGym.id, id), {});
    toast.success('Invoice sent');
  };

  return (
    <OwnerPageShell showSearch={false}>
      <TableShell
        title="Invoices"
        page={page}
        total={pagination.total || 0}
        limit={limit}
        loading={loading}
        onPage={setPage}
        noun="invoices"
      >
        <table className={`${TABLE_CLASS} min-w-[800px]`}>
          <thead>
            <tr className={THEAD_ROW}>
              <th className={`w-12 ${TH}`}>#</th>
              <th className={TH}>Number</th>
              <th className={TH}>Type</th>
              <th className={TH}>Member</th>
              <th className={TH}>Date</th>
              <th className={`${TH} text-right`}>Total</th>
              <th className={`${TH} text-right`}>Due</th>
              <th className={TH}>Status</th>
              <th className={`${TH} text-right`}> </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className={`${TD} py-12 text-center text-secondary`}>
                  Invoices are created when you add or renew a membership.
                </td>
              </tr>
            ) : (
              rows.map((inv, i) => (
                <tr key={inv.id}>
                  <td className={`${TD} text-xs text-secondary`}>{tableRowNumber(page, limit, i)}</td>
                  <td className={`${TD} font-medium`}>{inv.invoiceNumber}</td>
                  <td className={`${TD} text-secondary`}>
                    {inv.documentType === 'TAX_INVOICE' ? 'Tax invoice' : 'Receipt'}
                  </td>
                  <td className={TD}>
                    {inv.member ? `${inv.member.firstName} ${inv.member.lastName}` : '—'}
                  </td>
                  <td className={`${TD} text-secondary`}>{formatDate(inv.issuedAt || inv.createdAt)}</td>
                  <td className={`${TD} text-right`}>{formatCurrency(inv.totalAmount)}</td>
                  <td className={`${TD} text-right ${inv.balance > 0 ? 'text-error' : 'text-secondary'}`}>
                    {inv.balance > 0 ? formatCurrency(inv.balance) : '—'}
                  </td>
                  <td className={TD}>{inv.status}</td>
                  <td className={`${TD} text-right`}>
                    <button type="button" onClick={() => open(inv.id)} className="mr-2 text-xs font-semibold hover:underline">
                      View
                    </button>
                    <button type="button" onClick={() => send(inv.id)} className="text-xs font-semibold text-primary-fixed hover:underline">
                      Send
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableShell>

      <AppModal open={Boolean(invoice)} onClose={() => setInvoice(null)} size="lg" scrollable>
        {invoice ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-secondary">
              {invoice.documentType === 'TAX_INVOICE' ? 'Tax invoice' : 'Receipt'}
            </p>
            <h2 className="font-display text-xl font-bold">{invoice.invoiceNumber}</h2>
            {invoice.seller?.gstin ? <p className="text-sm">GSTIN {invoice.seller.gstin}</p> : null}
            <p className="text-sm">{invoice.buyer?.name}</p>
            {(invoice.items || []).map((item, i) => (
              <p key={i} className="text-sm">
                {item.description}
                {item.sacCode ? ` · SAC ${item.sacCode}` : ''} · {formatCurrency(item.amount)}
              </p>
            ))}
            {invoice.taxAmount ? (
              <div className="text-sm text-secondary">
                <p>Taxable {formatCurrency(invoice.amount)}</p>
                <p>
                  CGST {formatCurrency(invoice.cgst)} · SGST {formatCurrency(invoice.sgst)}
                  {invoice.taxRate ? ` (${invoice.taxRate}%)` : ''}
                </p>
              </div>
            ) : (
              <p className="text-sm text-secondary">No GST — gym GSTIN is not set.</p>
            )}
            <p className="text-lg font-bold">{formatCurrency(invoice.totalAmount)}</p>
            <p className="text-sm text-secondary">
              Paid {formatCurrency(invoice.amountPaid)} · Due {formatCurrency(invoice.balance)}
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs"
            >
              Print
            </button>
          </div>
        ) : null}
      </AppModal>
    </OwnerPageShell>
  );
};

export default FinanceInvoices;
