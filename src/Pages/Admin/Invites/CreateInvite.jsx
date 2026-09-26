import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, postRequest, patchRequest } from '../../../config/dataApi';

const inr = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(amount) || 0
  );

const inputClass = 'input-cyber w-full rounded-lg border border-white/10 bg-surface-container-lowest px-3 py-2.5';

const CreateInvite = () => {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    inviteeName: '',
    businessName: '',
    note: '',
    expiryDays: '14',
  });
  const [createdInvite, setCreatedInvite] = useState(null);
  const [createdLink, setCreatedLink] = useState('');

  useEffect(() => {
    getRequest(ENDPOINTS.PLATFORM_BILLING.CATALOG)
      .then((res) => setCatalog(res.data?.catalog || null))
      .catch(() => toast.error('Failed to load pricing'));
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await postRequest(ENDPOINTS.INVITES.CREATE, {
        email: form.email,
        inviteeName: form.inviteeName,
        businessName: form.businessName,
        note: form.note,
        expiryDays: Number(form.expiryDays),
      });
      setCreatedInvite(res.data.invite);
      setCreatedLink(res.data.link || `${window.location.origin}/setup/${res.data.invite.token}`);
      toast.success('Invite created');
    } catch {
      /* toast from api */
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyAndSend = async () => {
    if (!createdInvite) return;
    try {
      await patchRequest(ENDPOINTS.INVITES.MARK_SENT(createdInvite.id));
      navigator.clipboard.writeText(createdLink);
      toast.success('Link copied and marked as sent');
      navigate('/admin/invites');
    } catch {
      /* api */
    }
  };

  if (createdInvite) {
    return (
      <AdminPageShell showSearch={false}>
        <GlassCard className="mx-auto max-w-lg p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20">
            <Icon name="mark_email_read" size={32} className="text-primary-container" />
          </div>
          <h1 className="font-display text-2xl font-bold">Invite ready</h1>
          <p className="mt-2 text-sm text-secondary">
            Share this link with <strong className="text-on-surface">{createdInvite.email}</strong> so
            they can set up the gym and pay the first month.
          </p>
          <div className="mt-6 break-all rounded-lg border border-white/10 bg-black/30 p-3 text-left text-xs font-mono text-secondary">
            {createdLink}
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(createdLink);
                toast.success('Copied');
              }}
              className="rounded-lg border border-white/10 px-6 py-2.5 text-sm hover:bg-white/5"
            >
              Copy link
            </button>
            <button
              type="button"
              onClick={handleCopyAndSend}
              className="cyber-glow rounded-lg bg-primary-container px-6 py-2.5 text-sm font-bold text-on-primary-container"
            >
              Mark sent &amp; go to list
            </button>
          </div>
        </GlassCard>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell showSearch={false}>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <Link
            to="/admin/invites"
            className="mb-4 inline-flex items-center gap-1 text-sm text-secondary hover:text-primary-container"
          >
            <Icon name="arrow_back" size={18} />
            Back to invites
          </Link>
          <h1 className="font-display text-3xl font-bold">Create Gym Invite</h1>
          <p className="mt-1 text-secondary/70">
            The owner pays the first month for their gym, then signs in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <GlassCard className="space-y-4 p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Icon name="person" className="text-primary-container" />
              Invitee details
            </h2>
            <input
              type="email"
              required
              className={inputClass}
              placeholder="Owner email *"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Contact name (optional)"
                value={form.inviteeName}
                onChange={(e) => set('inviteeName', e.target.value)}
              />
              <input
                required
                className={inputClass}
                placeholder="Gym / business name"
                value={form.businessName}
                onChange={(e) => set('businessName', e.target.value)}
              />
            </div>
            <textarea
              className={inputClass}
              rows={2}
              placeholder="Internal note (optional)"
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
            />
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-secondary">
                Link expires in
              </label>
              <select
                className={inputClass}
                value={form.expiryDays}
                onChange={(e) => set('expiryDays', e.target.value)}
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
          </GlassCard>

          <div>
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Icon name="workspace_premium" className="text-primary-fixed" />
              What this invite starts with
            </h2>
            <GlassCard className="p-5 text-sm text-secondary">
              {catalog ? (
                <>
                  <p className="text-on-surface">
                    First gym: <strong>{inr(catalog.basePriceMonthly)}</strong> / month
                    ({catalog.baseName})
                  </p>
                  <p className="mt-2">
                    Each extra gym the owner adds later: {inr(catalog.extraGymPriceMonthly)} / month.
                  </p>
                  <p className="mt-2">
                    Attendance, member store, and day pass are optional and billed per gym after setup.
                  </p>
                </>
              ) : (
                <p>Loading pricing…</p>
              )}
            </GlassCard>
          </div>

          <div className="flex justify-end gap-3">
            <Link to="/admin/invites" className="rounded-lg px-6 py-2.5 hover:bg-white/5">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="cyber-glow rounded-lg bg-primary-container px-6 py-2.5 font-bold text-on-primary-container disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create invite'}
            </button>
          </div>
        </form>
      </div>
    </AdminPageShell>
  );
};

export default CreateInvite;
