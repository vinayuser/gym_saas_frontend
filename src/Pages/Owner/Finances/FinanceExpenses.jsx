import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, postRequest, putRequest, deleteRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import StatCard from '../../../components/fitsphere/StatCard';
import AppModal from '../../../components/fitsphere/AppModal';
import SectionLoader from '../../../components/Loader/SectionLoader';
import TableShell, { TABLE_CLASS, TD, TH, THEAD_ROW, tableRowNumber } from '../../../components/fitsphere/TableShell';
import { formatCurrency, formatDate } from '../../../helpers/formatUtils';
import { EXPENSE_CATEGORIES, expenseLabel, PAYMENT_METHODS } from '../../../constants/billing';

const emptyForm = {
  category: 'RENT',
  amount: '',
  spentOn: new Date().toISOString().slice(0, 10),
  vendor: '',
  note: '',
  paymentMethod: 'CASH',
};

const FinanceExpenses = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const limit = 10;

  const load = () => {
    if (!currentGym?.id) return;
    setLoading(true);
    Promise.all([
      getRequest(ENDPOINTS.FINANCE.EXPENSES(currentGym.id)),
      getRequest(ENDPOINTS.FINANCE.EXPENSE_LIST(currentGym.id), { params: { page, limit } }),
    ])
      .then(([sum, list]) => {
        setSummary(sum.data);
        setRows(list.data || []);
        setPagination(list.meta?.pagination || { total: 0 });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [currentGym?.id, page]);

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ mode: 'create' });
  };

  const openEdit = (row) => {
    setForm({
      category: row.category,
      amount: String(row.amount),
      spentOn: row.spentOn ? new Date(row.spentOn).toISOString().slice(0, 10) : emptyForm.spentOn,
      vendor: row.vendor || '',
      note: row.note || '',
      paymentMethod: row.paymentMethod || 'CASH',
    });
    setModal({ mode: 'edit', id: row.id });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        amount: Number(form.amount),
        vendor: form.vendor || undefined,
        note: form.note || undefined,
      };
      if (modal.mode === 'edit') {
        await putRequest(ENDPOINTS.FINANCE.EXPENSE(currentGym.id, modal.id), body);
        toast.success('Expense updated');
      } else {
        await postRequest(ENDPOINTS.FINANCE.EXPENSE_LIST(currentGym.id), body);
        toast.success('Expense recorded');
      }
      setModal(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm('Remove this expense?')) return;
    await deleteRequest(ENDPOINTS.FINANCE.EXPENSE(currentGym.id, row.id));
    toast.success('Expense removed');
    load();
  };

  const revenue = summary?.revenue || 0;
  const totalExpenses = summary?.totalExpenses || 0;

  return (
    <OwnerPageShell showSearch={false}>
      <SectionLoader show={loading && !summary}>
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">Expenses</h1>
              <p className="mt-1 text-secondary/70">Rent, salaries, electricity, equipment, and other gym costs you enter.</p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="rounded-lg bg-primary-fixed px-4 py-2 text-sm font-bold text-on-primary-fixed"
            >
              Add expense
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Revenue" value={formatCurrency(revenue)} icon="payments" accent />
            <StatCard label="Expenses" value={formatCurrency(totalExpenses)} icon="receipt_long" />
            <StatCard label="Net" value={formatCurrency(revenue - totalExpenses)} icon="monitoring" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {EXPENSE_CATEGORIES.map((cat) => (
              <GlassCard key={cat.value} className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">{cat.label}</p>
                <p className="mt-1 text-lg font-bold">{formatCurrency(summary?.expenses?.[cat.value] || 0)}</p>
              </GlassCard>
            ))}
          </div>

          <TableShell
            title="Expense log"
            page={page}
            total={pagination.total || 0}
            limit={limit}
            loading={loading}
            onPage={setPage}
            noun="expenses"
          >
            <table className={`${TABLE_CLASS} min-w-[720px]`}>
              <thead>
                <tr className={THEAD_ROW}>
                  <th className={`w-12 ${TH}`}>#</th>
                  <th className={TH}>Date</th>
                  <th className={TH}>Category</th>
                  <th className={TH}>Vendor</th>
                  <th className={`${TH} text-right`}>Amount</th>
                  <th className={`${TH} text-right`}> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={`${TD} py-10 text-center text-secondary`}>
                      No expenses recorded yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, i) => (
                    <tr key={row.id}>
                      <td className={`${TD} text-xs text-secondary`}>{tableRowNumber(page, limit, i)}</td>
                      <td className={TD}>{formatDate(row.spentOn)}</td>
                      <td className={TD}>{expenseLabel(row.category)}</td>
                      <td className={`${TD} text-secondary`}>{row.vendor || row.note || '—'}</td>
                      <td className={`${TD} text-right font-medium`}>{formatCurrency(row.amount)}</td>
                      <td className={`${TD} text-right`}>
                        <button type="button" onClick={() => openEdit(row)} className="mr-2 text-xs font-semibold hover:underline">
                          Edit
                        </button>
                        <button type="button" onClick={() => remove(row)} className="text-xs font-semibold text-error hover:underline">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>
        </div>
      </SectionLoader>

      <AppModal open={Boolean(modal)} onClose={() => setModal(null)} size="md" scrollable>
        <form onSubmit={save} className="space-y-4">
          <h2 className="font-display text-xl font-bold">{modal?.mode === 'edit' ? 'Edit expense' : 'Add expense'}</h2>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-cyber w-full rounded-lg px-3 py-2"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Amount (₹)</span>
              <input
                type="number"
                min="1"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input-cyber w-full rounded-lg px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Date</span>
              <input
                type="date"
                value={form.spentOn}
                onChange={(e) => setForm({ ...form, spentOn: e.target.value })}
                className="input-cyber w-full rounded-lg px-3 py-2"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Paid by</span>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="input-cyber w-full rounded-lg px-3 py-2"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Vendor</span>
            <input
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              className="input-cyber w-full rounded-lg px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-secondary">Note</span>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="input-cyber w-full rounded-lg px-3 py-2" />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-lg border border-white/10 px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-fixed px-4 py-2 text-sm font-bold text-on-primary-fixed disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </AppModal>
    </OwnerPageShell>
  );
};

export default FinanceExpenses;
