import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { clearCurrentMember, fetchMemberById } from '../../../store/slices/memberSlice';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, postRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import SectionLoader from '../../../components/Loader/SectionLoader';
import CollectPaymentModal from '../../../components/fitsphere/CollectPaymentModal';
import RenewMembershipModal from '../../../components/fitsphere/RenewMembershipModal';
import AppModal from '../../../components/fitsphere/AppModal';
import { formatCurrency, formatDate, formatDateTime } from '../../../helpers/formatUtils';

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{label}</p>
    <p className="mt-1 text-sm text-on-surface">{value || '—'}</p>
  </div>
);

const MemberView = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentGym } = useSelector((s) => s.gym);
  const { currentMember, loading } = useSelector((s) => s.member);
  const [billing, setBilling] = useState(null);
  const [collectFor, setCollectFor] = useState(null);
  const [renewOpen, setRenewOpen] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [refundingId, setRefundingId] = useState(null);

  const loadBilling = () => {
    if (!currentGym?.id || !memberId) return;
    getRequest(ENDPOINTS.MEMBERS.BILLING(currentGym.id, memberId)).then((res) => setBilling(res.data));
  };

  useEffect(() => {
    if (currentGym?.id && memberId) {
      dispatch(fetchMemberById({ gymId: currentGym.id, memberId }));
      loadBilling();
    }
    return () => dispatch(clearCurrentMember());
  }, [currentGym?.id, memberId, dispatch]);

  const m = currentMember;
  const memberships = billing?.memberships || m?.memberships || [];
  const current = memberships[0];
  const due = Number(billing?.due || current?.balance || 0);

  const openInvoice = async (id) => {
    const res = await getRequest(ENDPOINTS.FINANCE.INVOICE(currentGym.id, id));
    setInvoice(res.data);
  };

  const sendInvoice = async (id) => {
    await postRequest(ENDPOINTS.FINANCE.INVOICE_SEND(currentGym.id, id), {});
    toast.success('Invoice sent to the member');
  };

  const refundPayment = async (payment) => {
    const raw = window.prompt('Refund amount (₹)', String(Math.abs(payment.amount)));
    if (raw == null) return;
    const amount = Number(raw);
    if (!amount) return;
    setRefundingId(payment.id);
    try {
      await postRequest(ENDPOINTS.FINANCE.REFUND(currentGym.id, payment.id), { amount });
      toast.success('Refund recorded');
      loadBilling();
    } finally {
      setRefundingId(null);
    }
  };

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch.</GlassCard>
      </OwnerPageShell>
    );
  }

  return (
    <SectionLoader show={loading && !m}>
      <OwnerPageShell showSearch={false}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/owner/members')}
            className="inline-flex items-center gap-1 text-sm text-secondary hover:text-on-surface"
          >
            <Icon name="arrow_back" size={18} />
            Members
          </button>
          {m ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRenewOpen(true)}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/5"
              >
                Renew
              </button>
              {due > 0 && current ? (
                <button
                  type="button"
                  onClick={() => setCollectFor(current)}
                  className="rounded-lg bg-primary-fixed px-3 py-2 text-xs font-bold text-on-primary-fixed"
                >
                  Collect {formatCurrency(due)}
                </button>
              ) : null}
              <Link
                to={`/owner/members/${m.id}/plans`}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/5"
              >
                Workout & diet
              </Link>
              <Link
                to={`/owner/members/${m.id}/edit`}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/5"
              >
                Edit
              </Link>
            </div>
          ) : null}
        </div>

        {!m && !loading ? (
          <GlassCard className="p-8 text-center text-secondary">Member not found.</GlassCard>
        ) : m ? (
          <div className="space-y-4">
            <GlassCard className="p-6">
              <div className="flex flex-wrap items-start gap-4">
                <img
                  src={
                    m.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      `${m.firstName}+${m.lastName}`
                    )}&background=2a2a2a&color=e5e2e1`
                  }
                  alt=""
                  className="h-20 w-20 rounded-full border border-white/10 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-2xl font-bold">
                    {m.firstName} {m.lastName}
                  </h1>
                  <p className="mt-1 text-sm text-secondary">{m.memberCode}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        m.isActive
                          ? 'bg-primary-container/15 text-primary-fixed'
                          : 'bg-secondary-container/20 text-secondary'
                      }`}
                    >
                      {m.isActive ? 'Active' : 'Lapsed'}
                    </span>
                    {due > 0 ? (
                      <span className="inline-flex rounded-full bg-error/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-error">
                        Due {formatCurrency(due)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="grid gap-4 lg:grid-cols-2">
              <GlassCard className="space-y-4 p-5">
                <h2 className="text-sm font-semibold">Contact</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email" value={m.email} />
                  <Field label="Phone" value={m.phone} />
                  <Field label="Gender" value={m.gender} />
                  <Field label="Date of birth" value={formatDate(m.dateOfBirth)} />
                </div>
              </GlassCard>

              <GlassCard className="space-y-4 p-5">
                <h2 className="text-sm font-semibold">Emergency</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact name" value={m.emergencyContact} />
                  <Field label="Contact phone" value={m.emergencyPhone} />
                </div>
              </GlassCard>
            </div>

            <GlassCard className="p-5">
              <h2 className="mb-4 text-sm font-semibold">Memberships</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="text-left text-xs uppercase text-secondary">
                    <tr>
                      <th className="pb-2">Plan</th>
                      <th className="pb-2">Period</th>
                      <th className="pb-2">Billed</th>
                      <th className="pb-2">Paid</th>
                      <th className="pb-2">Due</th>
                      <th className="pb-2 text-right"> </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {memberships.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-secondary">
                          No membership yet.
                        </td>
                      </tr>
                    ) : (
                      memberships.map((row) => (
                        <tr key={row.id}>
                          <td className="py-3">
                            <p className="font-medium">{row.plan?.name || '—'}</p>
                            <p className="text-xs text-secondary">{row.status}</p>
                          </td>
                          <td className="py-3 text-secondary">
                            {formatDate(row.startDate)} – {formatDate(row.endDate)}
                          </td>
                          <td className="py-3">{formatCurrency(row.totalAmount)}</td>
                          <td className="py-3">{formatCurrency(row.amountPaid)}</td>
                          <td className={`py-3 ${row.balance > 0 ? 'text-error' : 'text-secondary'}`}>
                            {row.balance > 0 ? formatCurrency(row.balance) : '—'}
                          </td>
                          <td className="py-3 text-right">
                            {row.balance > 0 ? (
                              <button
                                type="button"
                                onClick={() => setCollectFor(row)}
                                className="rounded-lg border border-white/10 px-2 py-1 text-xs font-semibold hover:bg-white/5"
                              >
                                Collect
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            <div className="grid gap-4 lg:grid-cols-2">
              <GlassCard className="p-5">
                <h2 className="mb-4 text-sm font-semibold">Payments</h2>
                <div className="space-y-2">
                  {(billing?.payments || []).length === 0 ? (
                    <p className="text-sm text-secondary">No payments yet.</p>
                  ) : (
                    billing.payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">
                            {formatCurrency(Math.abs(p.amount))} · {p.method || '—'}
                          </p>
                          <p className="text-xs text-secondary">
                            {p.kind === 'REFUND' ? 'Refund' : 'Payment'} · {formatDateTime(p.paidAt)}
                            {p.receiptNumber ? ` · ${p.receiptNumber}` : ''}
                          </p>
                        </div>
                        {p.kind !== 'REFUND' && p.status === 'COMPLETED' ? (
                          <button
                            type="button"
                            disabled={refundingId === p.id}
                            onClick={() => refundPayment(p)}
                            className="text-xs font-semibold text-error hover:underline"
                          >
                            Refund
                          </button>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <h2 className="mb-4 text-sm font-semibold">Invoices</h2>
                <div className="space-y-2">
                  {(billing?.invoices || []).length === 0 ? (
                    <p className="text-sm text-secondary">No invoices yet.</p>
                  ) : (
                    billing.invoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2">
                        <button type="button" onClick={() => openInvoice(inv.id)} className="text-left">
                          <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                          <p className="text-xs text-secondary">
                            {inv.status} · {formatCurrency(inv.totalAmount)} · due {formatCurrency(inv.balance)}
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => sendInvoice(inv.id)}
                          className="text-xs font-semibold text-primary-fixed hover:underline"
                        >
                          Send
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        ) : null}
      </OwnerPageShell>

      <CollectPaymentModal
        open={Boolean(collectFor)}
        onClose={() => setCollectFor(null)}
        gymId={currentGym.id}
        membership={collectFor}
        onSaved={() => {
          loadBilling();
          dispatch(fetchMemberById({ gymId: currentGym.id, memberId }));
        }}
      />
      <RenewMembershipModal
        open={renewOpen}
        onClose={() => setRenewOpen(false)}
        gymId={currentGym.id}
        memberId={memberId}
        current={current}
        onSaved={() => {
          loadBilling();
          dispatch(fetchMemberById({ gymId: currentGym.id, memberId }));
        }}
      />
      <AppModal open={Boolean(invoice)} onClose={() => setInvoice(null)} size="lg" scrollable>
        {invoice ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-secondary">
                  {invoice.documentType === 'TAX_INVOICE' ? 'Tax invoice' : 'Receipt'}
                </p>
                <h2 className="font-display text-xl font-bold">{invoice.invoiceNumber}</h2>
              </div>
              <button type="button" onClick={() => window.print()} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs">
                Print
              </button>
            </div>
            {invoice.seller?.gstin ? <p className="text-sm text-secondary">GSTIN {invoice.seller.gstin}</p> : null}
            <p className="text-sm">{invoice.buyer?.name}</p>
            {(invoice.items || []).map((item, i) => (
              <p key={i} className="text-sm">
                {item.description} · {formatCurrency(item.amount)}
              </p>
            ))}
            {invoice.taxAmount ? (
              <div className="text-sm text-secondary">
                <p>Taxable {formatCurrency(invoice.amount)}</p>
                <p>
                  CGST {formatCurrency(invoice.cgst)} · SGST {formatCurrency(invoice.sgst)}
                </p>
              </div>
            ) : null}
            <p className="text-lg font-bold">Total {formatCurrency(invoice.totalAmount)}</p>
            <p className="text-sm text-secondary">
              Paid {formatCurrency(invoice.amountPaid)} · Balance {formatCurrency(invoice.balance)}
            </p>
          </div>
        ) : null}
      </AppModal>
    </SectionLoader>
  );
};

export default MemberView;
