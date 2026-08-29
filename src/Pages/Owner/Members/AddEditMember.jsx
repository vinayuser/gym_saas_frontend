import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  createMember,
  updateMember,
  fetchMemberById,
  clearCurrentMember,
} from '../../../store/slices/memberSlice';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import MediaFileDrop from '../../../components/fitsphere/MediaFileDrop';
import PageLoader from '../../../components/Loader/PageLoader';
import SuccessModal from '../../../components/fitsphere/SuccessModal';
import { uploadMediaFile } from '../../../helpers/mediaUpload';

const CYCLE_LABELS = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
};

const formatPlanPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(price) || 0
  );

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'male',
  emergencyContact: '',
  emergencyPhone: '',
  isActive: true,
  profileImageUrl: null,
  profileImagePreview: null,
  planId: '',
  membershipStartDate: new Date().toISOString().slice(0, 10),
  autoPay: true,
};

const FormField = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-semibold uppercase tracking-wider text-secondary">{label}</label>
    {children}
  </div>
);

const splitName = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

const AddEditMember = () => {
  const { memberId } = useParams();
  const isEdit = Boolean(memberId);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentGym } = useSelector((state) => state.gym);
  const { currentMember, loading } = useSelector((state) => state.member);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoRef = useRef(null);

  useEffect(() => {
    if (!currentGym?.id) return;

    setPlansLoading(true);
    getRequest(`${ENDPOINTS.PLANS.LIST(currentGym.id)}?limit=100&isActive=true`)
      .then((res) => {
        const items = (Array.isArray(res.data) ? res.data : []).filter((p) => p.isActive);
        setMembershipPlans(items);
        if (!isEdit && items.length) {
          setForm((prev) => (prev.planId ? prev : { ...prev, planId: items[0].id }));
        }
      })
      .catch(() => setMembershipPlans([]))
      .finally(() => setPlansLoading(false));
  }, [currentGym?.id, isEdit]);

  useEffect(() => {
    if (isEdit && currentGym?.id && memberId) {
      dispatch(fetchMemberById({ gymId: currentGym.id, memberId }));
    }
    return () => dispatch(clearCurrentMember());
  }, [isEdit, currentGym?.id, memberId, dispatch]);

  useEffect(() => {
    if (!currentMember || !isEdit) return;

    const membership = currentMember.memberships?.[0];
    setForm({
      fullName: `${currentMember.firstName || ''} ${currentMember.lastName || ''}`.trim(),
      email: currentMember.email || '',
      phone: currentMember.phone || '',
      dateOfBirth: currentMember.dateOfBirth
        ? new Date(currentMember.dateOfBirth).toISOString().slice(0, 10)
        : '',
      gender: currentMember.gender || 'male',
      emergencyContact: currentMember.emergencyContact || '',
      emergencyPhone: currentMember.emergencyPhone || '',
      isActive: currentMember.isActive ?? true,
      profileImageUrl: currentMember.profileImage || null,
      profileImagePreview: currentMember.profileImage || null,
      planId: membership?.planId || membership?.plan?.id || '',
      membershipStartDate: membership?.startDate
        ? new Date(membership.startDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      autoPay: true,
    });
  }, [currentMember, isEdit]);

  const selectedPlan = membershipPlans.find((p) => p.id === form.planId);

  const memberCode = currentMember?.memberCode;
  const qrDisplay = memberCode ? `FP-${memberCode.replace(/^M/, '')}-${new Date().getFullYear()}` : 'Pending assignment';

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be 5MB or smaller');
      return;
    }
    setUploadingPhoto(true);
    try {
      const asset = await uploadMediaFile(file, { folder: 'members/avatars' });
      setForm((f) => ({
        ...f,
        profileImageUrl: asset.url,
        profileImagePreview: asset.url,
      }));
      toast.success('Photo uploaded');
    } catch {
      /* toast from helper */
    } finally {
      setUploadingPhoto(false);
    }
  };

  const buildPayload = () => {
    const { firstName, lastName } = splitName(form.fullName);
    return {
      firstName,
      lastName,
      email: form.email || null,
      phone: form.phone || undefined,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender,
      emergencyContact: form.emergencyContact || undefined,
      emergencyPhone: form.emergencyPhone || undefined,
      isActive: form.isActive !== false,
      ...(form.profileImageUrl ? { profileImage: form.profileImageUrl } : {}),
      ...(!isEdit && form.planId
        ? { planId: form.planId, membershipStartDate: form.membershipStartDate }
        : {}),
    };
  };

  const handleSave = async () => {
    if (!currentGym?.id) return;
    const { firstName } = splitName(form.fullName);
    if (!firstName) return;
    if (!isEdit && membershipPlans.length > 0 && !form.planId) return;

    setSaving(true);
    const payload = buildPayload();

    let result;
    if (isEdit) {
      result = await dispatch(
        updateMember({ gymId: currentGym.id, memberId, data: payload })
      );
    } else {
      result = await dispatch(createMember({ gymId: currentGym.id, data: payload }));
    }

    setSaving(false);

    if (createMember.fulfilled.match(result) || updateMember.fulfilled.match(result)) {
      if (isEdit) {
        navigate('/owner/members');
      } else {
        setShowSuccess(true);
      }
    }
  };

  if (isEdit && loading && !currentMember) {
    return <PageLoader show message="Loading member..." />;
  }

  if (!currentGym) {
    return (
      <div className="p-8">
        <GlassCard className="p-6 text-secondary">Select a gym branch to manage members.</GlassCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-surface/80 px-6 py-3 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="relative hidden max-w-md flex-1 lg:block">
            <Icon
              name="search"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
            />
            <input
              type="search"
              placeholder="Search members, assets, reports..."
              className="input-cyber w-full rounded-full py-2 pl-10 pr-4 text-sm"
            />
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            {['Overview', 'Analytics', 'Reports'].map((tab) => (
              <span key={tab} className="text-sm text-secondary">
                {tab}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button type="button" className="text-secondary hover:text-primary-fixed">
              <Icon name="notifications" size={24} />
            </button>
            <button type="button" className="hidden text-secondary hover:text-primary-fixed sm:block">
              <Icon name="apps" size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <nav className="mb-2 flex gap-2 text-xs font-semibold text-secondary">
              <Link to="/owner/members" className="hover:text-primary-fixed">
                Members
              </Link>
              <span>/</span>
              <span className="text-on-surface">
                {isEdit ? 'Edit Member' : 'Add New Member'}
              </span>
            </nav>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Member Registration
            </h1>
          </div>
          <div className="hidden gap-3 sm:flex">
            <Link
              to="/owner/members"
              className="rounded-lg border border-white/20 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploadingPhoto || (!isEdit && membershipPlans.length > 0 && !form.planId)}
              className="neon-glow rounded-lg bg-neon px-6 py-2.5 text-sm font-bold text-on-primary-fixed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Member'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Personal Information */}
          <GlassCard className="col-span-12 space-y-6 rounded-xl p-6 lg:col-span-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <Icon name="person" className="text-primary-fixed" />
              <h2 className="font-display text-xl font-semibold">Personal Information</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField label="Full Name">
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="input-cyber"
                />
              </FormField>
              <FormField label="Email Address">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alex@example.com"
                  className="input-cyber"
                />
              </FormField>
              <FormField label="Phone Number">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="input-cyber"
                />
              </FormField>
              <FormField label="Date of Birth">
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="input-cyber"
                />
              </FormField>
              <FormField label="Gender">
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="input-cyber"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </FormField>
            </div>

            <div className="border-t border-white/5 pt-6">
              <MediaFileDrop
                label="Member Photo"
                hint="PNG, JPG or WEBP — max 5MB"
                accept="image/png,image/jpeg,image/webp"
                preview={form.profileImagePreview}
                uploading={uploadingPhoto}
                inputRef={photoRef}
                onFile={handlePhotoUpload}
                onClear={() =>
                  setForm((f) => ({ ...f, profileImageUrl: null, profileImagePreview: null }))
                }
              />
              {isEdit && memberCode && (
                <p className="mt-3 font-mono text-xs text-primary-fixed">Member ID: {memberCode}</p>
              )}
            </div>
          </GlassCard>

          {/* Membership */}
          <GlassCard className="col-span-12 space-y-6 rounded-xl p-6 lg:col-span-4">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <Icon name="card_membership" className="text-primary-fixed" />
              <h2 className="font-display text-xl font-semibold">Membership</h2>
            </div>

            <FormField label="Membership Plan">
              {plansLoading ? (
                <p className="text-sm text-secondary">Loading plans…</p>
              ) : membershipPlans.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-secondary">
                  <p>No active membership plans for this gym.</p>
                  <Link
                    to="/owner/membership-plans"
                    className="mt-2 inline-flex items-center gap-1 text-primary-container hover:underline"
                  >
                    <Icon name="add" size={16} />
                    Create a plan first
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {membershipPlans.map((plan) => {
                    const selected = form.planId === plan.id;
                    return (
                      <label
                        key={plan.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                          selected
                            ? 'border-primary-fixed bg-primary-fixed/10'
                            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="planId"
                          value={plan.id}
                          checked={selected}
                          onChange={() => setForm({ ...form, planId: plan.id })}
                          className="mt-1 accent-primary-fixed"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{plan.name}</p>
                          <p className="mt-0.5 text-sm font-bold text-primary-container">
                            {formatPlanPrice(plan.price)}
                            <span className="ml-1 font-normal text-secondary">
                              · {CYCLE_LABELS[plan.billingCycle] || plan.billingCycle}
                            </span>
                          </p>
                          {plan.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-secondary">{plan.description}</p>
                          )}
                          <p className="mt-1 text-xs text-secondary/70">{plan.durationDays} days access</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              {isEdit && currentMember?.memberships?.[0]?.plan?.name && !membershipPlans.length && (
                <p className="mt-2 text-xs text-secondary">
                  Current plan: {currentMember.memberships[0].plan.name}
                </p>
              )}
            </FormField>

            {selectedPlan && (
              <div className="rounded-lg border border-primary-fixed/20 bg-primary-fixed/5 p-3 text-sm">
                <p className="font-medium text-on-surface">Selected: {selectedPlan.name}</p>
                <p className="mt-1 text-secondary">
                  {formatPlanPrice(selectedPlan.price)} · {selectedPlan.durationDays} days
                </p>
              </div>
            )}

            <FormField label="Start Date">
              <input
                type="date"
                value={form.membershipStartDate}
                onChange={(e) => setForm({ ...form, membershipStartDate: e.target.value })}
                className="input-cyber"
              />
            </FormField>

            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
              <div>
                <p className="font-medium">Membership Active</p>
                <p className="text-sm text-secondary">Toggle to freeze or cancel</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-surface-variant after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary-fixed peer-checked:after:translate-x-full" />
              </label>
            </div>
          </GlassCard>

          {/* Access & Security */}
          <GlassCard className="col-span-12 space-y-6 rounded-xl p-6 lg:col-span-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <Icon name="fingerprint" className="text-primary-fixed" />
              <h2 className="font-display text-xl font-semibold">Access & Security</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField label="Emergency Contact Name">
                <input
                  value={form.emergencyContact}
                  onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                  placeholder="Contact Person"
                  className="input-cyber"
                />
              </FormField>
              <FormField label="Emergency Phone">
                <input
                  type="tel"
                  value={form.emergencyPhone}
                  onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="input-cyber"
                />
              </FormField>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary-fixed/20 bg-primary-fixed/5 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-fixed/10">
                  <Icon name="qr_code_2" className="text-primary-fixed" />
                </div>
                <div>
                  <p className="font-medium">Biometric / QR Assignment</p>
                  <p className="text-sm text-secondary">ID: {qrDisplay}</p>
                </div>
              </div>
              <button
                type="button"
                className="border-b border-primary-fixed text-sm font-medium text-primary-fixed"
              >
                Re-assign Tag
              </button>
            </div>
          </GlassCard>

          {/* Billing & Payments */}
          <GlassCard className="col-span-12 space-y-6 rounded-xl p-6 lg:col-span-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <Icon name="account_balance_wallet" className="text-primary-fixed" />
              <h2 className="font-display text-xl font-semibold">Billing & Payments</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-white/10 p-4 transition-colors hover:bg-white/5">
                <div className="flex items-center gap-4">
                  <Icon name="credit_card" className="text-secondary" />
                  <div>
                    <p className="font-medium">Visa Ending in 4242</p>
                    <p className="text-sm text-secondary">Expires 12/26</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary-fixed">DEFAULT</span>
              </div>

              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-dashed border-white/10 px-4 py-3 text-secondary transition-colors hover:border-white/30 hover:text-on-surface"
              >
                <span className="text-sm font-medium">Add New Payment Method</span>
                <Icon name="add_circle" size={22} />
              </button>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div>
                  <p className="font-medium">Auto-pay Enrollment</p>
                  <p className="text-sm text-secondary">Deduct monthly fees automatically</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={form.autoPay}
                    onChange={(e) => setForm({ ...form, autoPay: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-surface-variant after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary-fixed peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:hidden">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploadingPhoto || (!isEdit && membershipPlans.length > 0 && !form.planId)}
            className="neon-glow w-full rounded-xl bg-neon py-3 font-bold text-on-primary-fixed disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Member'}
          </button>
          <Link
            to="/owner/members"
            className="block w-full rounded-xl border border-white/20 py-3 text-center font-semibold"
          >
            Cancel
          </Link>
        </div>
      </main>

      <SuccessModal
        open={showSuccess}
        onClose={() => navigate('/owner/members')}
        title="Member Saved"
        message="The member profile has been created and QR access is ready for gym check-in."
        actionLabel="Back to Directory"
        onAction={() => navigate('/owner/members')}
      />
    </div>
  );
};

export default AddEditMember;
