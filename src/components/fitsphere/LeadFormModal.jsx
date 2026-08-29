import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest, postRequest, putRequest } from '../../config/dataApi';
import AppModal from './AppModal';
import Icon from './Icon';
import { toDateInput } from '../../helpers/bannerUtils';

const inputClass = 'input-cyber w-full rounded-lg border border-white/10 bg-surface-container-lowest px-3 py-2.5 text-sm';
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-secondary';
const requiredMark = <span className="text-error"> *</span>;

const CYCLE_LABELS = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
};

const formatPlanPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(price) || 0
  );

export const EMPTY_LEAD_FORM = {
  name: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  occupation: '',
  source: 'walk-in',
  referralSource: '',
  interestedIn: '',
  fitnessGoal: '',
  preferredContact: '',
  budget: '',
  trialDate: '',
  followUpAt: '',
  notes: '',
  status: 'NEW',
};

export const SOURCE_OPTIONS = [
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'website', label: 'Website' },
  { value: 'phone', label: 'Phone call' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'google', label: 'Google / Search' },
  { value: 'referral', label: 'Member referral' },
  { value: 'event', label: 'Gym event' },
  { value: 'other', label: 'Other' },
];

export const CONTACT_OPTIONS = [
  { value: 'PHONE', label: 'Phone' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'SMS', label: 'SMS' },
];

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const enquiryToForm = (e) => ({
  name: e.name || '',
  lastName: e.lastName || '',
  email: e.email || '',
  phone: e.phone || '',
  gender: e.gender || '',
  dateOfBirth: e.dateOfBirth ? toDateInput(e.dateOfBirth) : '',
  address: e.address || '',
  city: e.city || '',
  state: e.state || '',
  pincode: e.pincode || '',
  occupation: e.occupation || '',
  source: e.source || 'walk-in',
  referralSource: e.referralSource || '',
  interestedIn: e.interestedIn || '',
  fitnessGoal: e.fitnessGoal || '',
  preferredContact: e.preferredContact || '',
  budget: e.budget ?? '',
  trialDate: e.trialDate ? toDateInput(e.trialDate) : '',
  followUpAt: e.followUpAt ? toDateInput(e.followUpAt) : '',
  notes: e.notes || '',
  status: e.status || 'NEW',
});

const validateRequired = (form) => {
  if (!form.name.trim()) {
    toast.error('First name is required');
    return false;
  }
  if (!form.gender) {
    toast.error('Gender is required');
    return false;
  }
  if (!form.phone.trim()) {
    toast.error('Phone is required');
    return false;
  }
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    toast.error('Enter a valid email or leave it blank');
    return false;
  }
  return true;
};

const LeadFormModal = ({ open, onClose, gymId, leadId, onSaved }) => {
  const isEdit = Boolean(leadId);
  const [form, setForm] = useState(EMPTY_LEAD_FORM);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !gymId) return;

    setPlansLoading(true);
    getRequest(`${ENDPOINTS.PLANS.LIST(gymId)}?limit=100&isActive=true`)
      .then((res) => {
        const items = (Array.isArray(res.data) ? res.data : []).filter((p) => p.isActive);
        setMembershipPlans(items);
      })
      .catch(() => setMembershipPlans([]))
      .finally(() => setPlansLoading(false));
  }, [open, gymId]);

  useEffect(() => {
    if (!open) return;
    if (isEdit && gymId) {
      setLoading(true);
      getRequest(ENDPOINTS.ENQUIRIES.BY_ID(gymId, leadId)).then((res) => {
        setForm(enquiryToForm(res.data));
        setLoading(false);
      });
      return;
    }
    setForm(EMPTY_LEAD_FORM);
  }, [open, isEdit, gymId, leadId]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!gymId) return;
    if (!validateRequired(form)) return;

    setSaving(true);
    const body = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      lastName: form.lastName.trim() || null,
      email: form.email.trim() || null,
      dateOfBirth: form.dateOfBirth || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      pincode: form.pincode || null,
      occupation: form.occupation || null,
      source: form.source || 'walk-in',
      referralSource: form.referralSource || null,
      interestedIn: form.interestedIn || null,
      fitnessGoal: form.fitnessGoal || null,
      preferredContact: form.preferredContact || null,
      budget: form.budget ? Number(form.budget) : null,
      trialDate: form.trialDate || null,
      followUpAt: form.followUpAt || null,
      notes: form.notes || null,
      status: form.status,
    };
    try {
      if (isEdit) {
        await putRequest(ENDPOINTS.ENQUIRIES.UPDATE(gymId, leadId), body);
        toast.success('Inquiry updated');
      } else {
        await postRequest(ENDPOINTS.ENQUIRIES.CREATE(gymId), body);
        toast.success('Inquiry added');
      }
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModal open={open} onClose={onClose} size="2xl" scrollable>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">{isEdit ? 'Edit Inquiry' : 'New Member Inquiry'}</h2>
            <p className="mt-0.5 text-sm text-secondary/70">Only name, gender, and phone are required.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/5" aria-label="Close">
            <Icon name="close" size={22} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container/30 border-t-primary-container" />
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Icon name="person" size={18} className="text-primary-container" /> Personal details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>First name{requiredMark}</label>
                    <input className={inputClass} value={form.name} onChange={(ev) => set('name', ev.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Last name</label>
                    <input className={inputClass} value={form.lastName} onChange={(ev) => set('lastName', ev.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Gender{requiredMark}</label>
                    <select className={inputClass} value={form.gender} onChange={(ev) => set('gender', ev.target.value)}>
                      <option value="">Select</option>
                      {GENDER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Date of birth</label>
                    <input type="date" className={inputClass} value={form.dateOfBirth} onChange={(ev) => set('dateOfBirth', ev.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Occupation</label>
                  <input className={inputClass} value={form.occupation} onChange={(ev) => set('occupation', ev.target.value)} placeholder="e.g. Software engineer" />
                </div>
              </div>

              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Icon name="contact_phone" size={18} className="text-primary-container" /> Contact
                </p>
                <div>
                  <label className={labelClass}>Phone{requiredMark}</label>
                  <input className={inputClass} value={form.phone} onChange={(ev) => set('phone', ev.target.value)} placeholder="+91..." />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" className={inputClass} value={form.email} onChange={(ev) => set('email', ev.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Preferred contact</label>
                  <select className={inputClass} value={form.preferredContact} onChange={(ev) => set('preferredContact', ev.target.value)}>
                    <option value="">Select</option>
                    {CONTACT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <input className={inputClass} value={form.address} onChange={(ev) => set('address', ev.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input className={inputClass} value={form.city} onChange={(ev) => set('city', ev.target.value)} placeholder="City" />
                  <input className={inputClass} value={form.state} onChange={(ev) => set('state', ev.target.value)} placeholder="State" />
                  <input className={inputClass} value={form.pincode} onChange={(ev) => set('pincode', ev.target.value)} placeholder="Pincode" />
                </div>
              </div>
            </div>

            <div className="grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Icon name="fitness_center" size={18} className="text-primary-container" /> Gym interest
                </p>
                <div>
                  <label className={labelClass}>Interested in</label>
                  <select
                    className={inputClass}
                    value={form.interestedIn}
                    onChange={(ev) => set('interestedIn', ev.target.value)}
                    disabled={plansLoading}
                  >
                    <option value="">
                      {plansLoading ? 'Loading plans...' : 'Select membership plan (optional)'}
                    </option>
                    {membershipPlans.map((plan) => (
                      <option key={plan.id} value={plan.name}>
                        {plan.name} — {formatPlanPrice(plan.price)} / {CYCLE_LABELS[plan.billingCycle] || plan.billingCycle}
                      </option>
                    ))}
                  </select>
                  {!plansLoading && membershipPlans.length === 0 && (
                    <p className="mt-1 text-xs text-secondary">No active plans. Add plans under Membership Plans.</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Fitness goal</label>
                  <textarea className={inputClass} rows={2} value={form.fitnessGoal} onChange={(ev) => set('fitnessGoal', ev.target.value)} placeholder="Weight loss, muscle gain, general fitness..." />
                </div>
                <div>
                  <label className={labelClass}>Budget (monthly)</label>
                  <input type="number" step="0.01" min="0" className={inputClass} value={form.budget} onChange={(ev) => set('budget', ev.target.value)} placeholder="Expected budget" />
                </div>
              </div>

              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Icon name="campaign" size={18} className="text-primary-container" /> Source & follow-up
                </p>
                <div>
                  <label className={labelClass}>Lead source</label>
                  <select className={inputClass} value={form.source} onChange={(ev) => set('source', ev.target.value)}>
                    {SOURCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>How did they hear about us?</label>
                  <input className={inputClass} value={form.referralSource} onChange={(ev) => set('referralSource', ev.target.value)} placeholder="Friend name, ad campaign, etc." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Trial / tour date</label>
                    <input type="date" className={inputClass} value={form.trialDate} onChange={(ev) => set('trialDate', ev.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Next follow-up</label>
                    <input type="date" className={inputClass} value={form.followUpAt} onChange={(ev) => set('followUpAt', ev.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea className={inputClass} rows={3} value={form.notes} onChange={(ev) => set('notes', ev.target.value)} placeholder="Conversation notes, objections, next steps..." />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
              <button type="button" onClick={onClose} className="rounded-lg px-5 py-2.5 text-sm hover:bg-white/5">Cancel</button>
              <button type="submit" disabled={saving} className="cyber-glow rounded-lg bg-primary-container px-6 py-2.5 text-sm font-bold text-on-primary-container disabled:opacity-50">
                {saving ? 'Saving...' : isEdit ? 'Update Inquiry' : 'Add Inquiry'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppModal>
  );
};

export default LeadFormModal;
