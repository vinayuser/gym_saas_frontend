import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  createStaff,
  updateStaff,
  fetchStaffById,
  clearCurrentStaff,
} from '../../../store/slices/staffSlice';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import MediaFileDrop from '../../../components/fitsphere/MediaFileDrop';
import PageLoader from '../../../components/Loader/PageLoader';
import SuccessModal from '../../../components/fitsphere/SuccessModal';
import { uploadMediaFile } from '../../../helpers/mediaUpload';

const PREVIEW_BANNER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCIsaVC8zgojWRx10jwQ7GVLhxVjxD3WX3mbETeplbk_rYB5YTiY1i-dQ5VgwCVsHXSB6zlEQ91N9c_KnN2zCnHysi_wYH-S4DkW6hjJDvtGBp8EIu3H9iUTipIiQcZd-6jcJ5VP2I2vP4xHqN1bCT1uwGU0YG9QDejY3B61dnlmolbMO98sipWaaKQUomnkXXxsLUSgqFhX_71O37_NZ51pLQeMsHavNH5ZHHB7dZjfhZfgB4GU6bffgAPtnQRYQDz0V6ENAdVE7Q';

const ROLE_OPTIONS = [
  { value: 'trainer', label: 'Trainer' },
  { value: 'front-desk', label: 'Front Desk' },
  { value: 'manager', label: 'Manager' },
  { value: 'nutritionist', label: 'Nutritionist' },
];

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  staffRole: 'trainer',
  specializations: [],
  bio: '',
  joinedAt: new Date().toISOString().slice(0, 10),
  employmentType: 'full-time',
  baseRate: '',
  paymentFrequency: 'monthly',
  address: '',
  city: '',
  state: '',
  pincode: '',
  avatarUrl: null,
  avatarPreview: null,
  addressProofUrl: null,
  addressProofPreview: null,
  addressProofName: '',
  idProofUrl: null,
  idProofPreview: null,
  idProofName: '',
  mobileAppAccess: true,
  adminDashboardAccess: false,
  password: '',
};

const FormField = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold uppercase tracking-wider text-secondary">{label}</label>
    {children}
  </div>
);

const AddStaff = ({ mode = 'staff' }) => {
  const isTrainerMode = mode === 'trainer';
  const listPath = isTrainerMode ? '/owner/trainers' : '/owner/staff';
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const { currentGym } = useSelector((state) => state.gym);
  const { currentStaff, loading } = useSelector((state) => state.staff);

  const [form, setForm] = useState(EMPTY_FORM);
  const [skillInput, setSkillInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingAddressProof, setUploadingAddressProof] = useState(false);
  const [uploadingIdProof, setUploadingIdProof] = useState(false);

  const avatarRef = useRef(null);
  const addressProofRef = useRef(null);
  const idProofRef = useRef(null);

  useEffect(() => {
    if (editId && currentGym?.id) {
      dispatch(fetchStaffById({ gymId: currentGym.id, staffId: editId }));
    }
    return () => dispatch(clearCurrentStaff());
  }, [editId, currentGym?.id, dispatch]);

  useEffect(() => {
    if (!currentStaff || !editId) return;
    const roleMap = {
      TRAINER: 'trainer',
      RECEPTIONIST: 'front-desk',
      MANAGER: 'manager',
    };
    const avatar = currentStaff.user?.avatar || null;
    setForm({
      fullName: `${currentStaff.user?.firstName || ''} ${currentStaff.user?.lastName || ''}`.trim(),
      email: currentStaff.user?.email || '',
      phone: currentStaff.user?.phone || '',
      staffRole: isTrainerMode ? 'trainer' : roleMap[currentStaff.user?.role] || 'trainer',
      specializations: currentStaff.trainer?.specialties || [],
      bio: currentStaff.trainer?.bio || '',
      joinedAt: currentStaff.joinedAt
        ? new Date(currentStaff.joinedAt).toISOString().slice(0, 10)
        : '',
      employmentType: currentStaff.employmentType || 'full-time',
      baseRate: currentStaff.baseSalary != null ? String(currentStaff.baseSalary) : '',
      paymentFrequency: currentStaff.paymentFrequency || 'monthly',
      address: currentStaff.address || '',
      city: currentStaff.city || '',
      state: currentStaff.state || '',
      pincode: currentStaff.pincode || '',
      avatarUrl: avatar,
      avatarPreview: avatar,
      addressProofUrl: currentStaff.addressProofUrl || null,
      addressProofPreview: currentStaff.addressProofUrl || null,
      addressProofName: currentStaff.addressProofUrl ? 'Address proof on file' : '',
      idProofUrl: currentStaff.idProofUrl || null,
      idProofPreview: currentStaff.idProofUrl || null,
      idProofName: currentStaff.idProofUrl ? 'ID proof on file' : '',
      mobileAppAccess: true,
      adminDashboardAccess: isTrainerMode ? false : currentStaff.user?.role === 'MANAGER',
      password: '',
    });
  }, [currentStaff, editId, isTrainerMode]);

  const previewName = form.fullName.trim() || (isTrainerMode ? 'Trainer Preview' : 'Staff Preview');
  const previewRole = isTrainerMode
    ? 'Trainer'
    : ROLE_OPTIONS.find((r) => r.value === form.staffRole)?.label || 'Select Role';
  const previewAvatar = form.avatarPreview;

  const uploadFile = async (file, folder, setUploading, onSuccess) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be 5MB or smaller');
      return;
    }
    setUploading(true);
    try {
      const asset = await uploadMediaFile(file, {
        folder,
        ...(file.type === 'application/pdf' ? { resourceType: 'raw' } : {}),
      });
      onSuccess(asset.url, file.name, file.type);
      toast.success('File uploaded');
    } catch {
      /* toast from helper */
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = (file) =>
    uploadFile(file, 'staff/avatars', setUploadingAvatar, (url) => {
      setForm((f) => ({ ...f, avatarUrl: url, avatarPreview: url }));
    });

  const handleAddressProofUpload = (file) =>
    uploadFile(file, 'staff/address-proofs', setUploadingAddressProof, (url, name, type) => {
      const isPdf = type === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
      setForm((f) => ({
        ...f,
        addressProofUrl: url,
        addressProofPreview: isPdf ? null : url,
        addressProofName: name,
      }));
    });

  const handleIdProofUpload = (file) =>
    uploadFile(file, 'staff/id-proofs', setUploadingIdProof, (url, name, type) => {
      const isPdf = type === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
      setForm((f) => ({
        ...f,
        idProofUrl: url,
        idProofPreview: isPdf ? null : url,
        idProofName: name,
      }));
    });

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill || form.specializations.includes(skill)) return;
    setForm({ ...form, specializations: [...form.specializations, skill] });
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setForm({
      ...form,
      specializations: form.specializations.filter((s) => s !== skill),
    });
  };

  const buildPayload = () => ({
    fullName: form.fullName,
    email: form.email,
    phone: form.phone || undefined,
    avatar: form.avatarUrl || undefined,
    staffRole: isTrainerMode ? 'trainer' : form.staffRole,
    specializations: form.specializations,
    bio: form.bio || undefined,
    joinedAt: form.joinedAt || undefined,
    employmentType: form.employmentType,
    baseRate: form.baseRate ? Number(form.baseRate) : undefined,
    paymentFrequency: form.paymentFrequency,
    address: form.address || undefined,
    city: form.city || undefined,
    state: form.state || undefined,
    pincode: form.pincode || undefined,
    addressProofUrl: form.addressProofUrl || undefined,
    idProofUrl: form.idProofUrl || undefined,
    mobileAppAccess: form.mobileAppAccess,
    adminDashboardAccess: isTrainerMode ? false : form.adminDashboardAccess,
    ...(form.password ? { password: form.password } : {}),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentGym?.id) return;
    setSaving(true);

    const payload = buildPayload();
    let result;
    if (editId) {
      result = await dispatch(updateStaff({ gymId: currentGym.id, staffId: editId, data: payload }));
    } else {
      result = await dispatch(createStaff({ gymId: currentGym.id, data: payload }));
    }

    setSaving(false);

    if (createStaff.fulfilled.match(result) || updateStaff.fulfilled.match(result)) {
      if (editId) {
        navigate(listPath);
      } else {
        setShowSuccess(true);
      }
    }
  };

  if (editId && loading && !currentStaff) {
    return <PageLoader show message={isTrainerMode ? 'Loading trainer...' : 'Loading staff member...'} />;
  }

  if (!currentGym) {
    return (
      <div className="p-8">
        <GlassCard className="p-6 text-secondary">Select a gym branch first.</GlassCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-surface/80 px-6 py-3 backdrop-blur-xl md:px-8">
        <div className="flex items-center gap-4">
          <Link
            to={listPath}
            className="text-secondary transition-colors hover:text-primary-fixed"
          >
            <Icon name="arrow_back" size={24} />
          </Link>
          <h1 className="font-display text-xl font-bold md:text-2xl">
            {editId
              ? isTrainerMode
                ? 'Edit Trainer'
                : 'Edit Staff Member'
              : isTrainerMode
                ? 'Add New Trainer'
                : 'Add New Staff Member'}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-12">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {/* Professional Profile */}
            <GlassCard className="rounded-xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-primary-fixed">
                  Professional Profile
                </h2>
                <Icon name="person" className="text-secondary" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="Full Name">
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="e.g. Alexander Pierce"
                    className="fitsphere-input"
                  />
                </FormField>
                <FormField label="Email Address">
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="alex.p@fitsphere.com"
                    className="fitsphere-input"
                  />
                </FormField>
                <FormField label="Phone Number">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="fitsphere-input"
                  />
                </FormField>
                {!isTrainerMode && (
                  <FormField label="Staff Role">
                    <select
                      value={form.staffRole}
                      onChange={(e) => setForm({ ...form, staffRole: e.target.value })}
                      className="fitsphere-input"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                )}
              </div>
              <div className="mt-6 border-t border-white/5 pt-6">
                <MediaFileDrop
                  label="Profile Photo"
                  hint="PNG, JPG or WEBP — max 5MB"
                  accept="image/png,image/jpeg,image/webp"
                  preview={form.avatarPreview}
                  uploading={uploadingAvatar}
                  inputRef={avatarRef}
                  onFile={handleAvatarUpload}
                  onClear={() =>
                    setForm((f) => ({ ...f, avatarUrl: null, avatarPreview: null }))
                  }
                />
              </div>
            </GlassCard>

            {/* Specializations */}
            <GlassCard className="rounded-xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-primary-fixed">
                  Specializations & Certifications
                </h2>
                <Icon name="verified" className="text-secondary" />
              </div>
              <FormField label="Skills & Specializations">
                <div className="flex min-h-[48px] flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-surface-container-lowest p-2">
                  {form.specializations.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-1 rounded-full border border-primary-fixed/20 bg-primary-fixed/10 px-3 py-1 text-xs font-semibold text-primary-fixed"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>
                        <Icon name="close" size={14} />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Add skill"
                      className="min-w-[100px] border-0 bg-transparent px-2 py-1 text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="flex items-center gap-1 p-1 text-secondary hover:text-primary-fixed"
                    >
                      <Icon name="add" size={18} />
                      <span className="text-xs font-semibold">Add Skill</span>
                    </button>
                  </div>
                </div>
              </FormField>
              <FormField label="Professional Bio">
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder={
                    isTrainerMode
                      ? "Briefly describe the trainer's background, certifications, and coaching style..."
                      : "Briefly describe the staff member's background, training philosophy, and achievements..."
                  }
                  className="fitsphere-input resize-none"
                />
              </FormField>
            </GlassCard>

            {/* Employment & Payment */}
            <GlassCard className="rounded-xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-primary-fixed">
                  Employment & Payment
                </h2>
                <Icon name="payments" className="text-secondary" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="Date of Joining">
                  <input
                    type="date"
                    required
                    value={form.joinedAt}
                    onChange={(e) => setForm({ ...form, joinedAt: e.target.value })}
                    className="fitsphere-input"
                  />
                </FormField>
                <FormField label="Employment Type">
                  <select
                    value={form.employmentType}
                    onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                    className="fitsphere-input"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contractor">Contractor</option>
                  </select>
                </FormField>
                <FormField label="Monthly Salary (₹)">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.baseRate}
                    onChange={(e) => setForm({ ...form, baseRate: e.target.value })}
                    placeholder="25000"
                    className="fitsphere-input"
                  />
                </FormField>
                <FormField label="Payment Frequency">
                  <select
                    value={form.paymentFrequency}
                    onChange={(e) => setForm({ ...form, paymentFrequency: e.target.value })}
                    className="fitsphere-input"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </FormField>
              </div>
            </GlassCard>

            {/* Address & Proofs */}
            <GlassCard className="rounded-xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-primary-fixed">
                  Address & Documents
                </h2>
                <Icon name="home" className="text-secondary" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormField label="Street Address">
                    <textarea
                      rows={2}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="House / street, area, landmark"
                      className="fitsphere-input resize-none"
                    />
                  </FormField>
                </div>
                <FormField label="City">
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Mumbai"
                    className="fitsphere-input"
                  />
                </FormField>
                <FormField label="State">
                  <input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="fitsphere-input"
                  />
                </FormField>
                <FormField label="PIN Code">
                  <input
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    placeholder="400001"
                    className="fitsphere-input"
                  />
                </FormField>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <MediaFileDrop
                    label="Address Proof"
                    hint="Aadhaar, utility bill, or rental agreement (PDF/image)"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    preview={form.addressProofPreview}
                    icon="description"
                    uploading={uploadingAddressProof}
                    inputRef={addressProofRef}
                    onFile={handleAddressProofUpload}
                    onClear={() =>
                      setForm((f) => ({
                        ...f,
                        addressProofUrl: null,
                        addressProofPreview: null,
                        addressProofName: '',
                      }))
                    }
                  />
                  {form.addressProofUrl && !form.addressProofPreview && (
                    <a
                      href={form.addressProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary-container hover:underline"
                    >
                      <Icon name="description" size={16} />
                      {form.addressProofName || 'View address proof'}
                    </a>
                  )}
                </div>
                <div className="space-y-2">
                  <MediaFileDrop
                    label="ID Proof"
                    hint="Government ID — PAN, Aadhaar, passport (PDF/image)"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    preview={form.idProofPreview}
                    icon="badge"
                    uploading={uploadingIdProof}
                    inputRef={idProofRef}
                    onFile={handleIdProofUpload}
                    onClear={() =>
                      setForm((f) => ({
                        ...f,
                        idProofUrl: null,
                        idProofPreview: null,
                        idProofName: '',
                      }))
                    }
                  />
                  {form.idProofUrl && !form.idProofPreview && (
                    <a
                      href={form.idProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary-container hover:underline"
                    >
                      <Icon name="badge" size={16} />
                      {form.idProofName || 'View ID proof'}
                    </a>
                  )}
                </div>
              </div>
              {(form.addressProofUrl || form.idProofUrl) && (
                <p className="mt-4 text-xs text-secondary">
                  Documents are stored securely on Cloudinary and linked to this staff record.
                </p>
              )}
            </GlassCard>
          </div>

          {/* Right column */}
          <div className="space-y-6 lg:col-span-4">
            <GlassCard className="rounded-xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-primary-fixed">
                  {isTrainerMode ? 'Trainer App Access' : 'System Access'}
                </h2>
                <Icon name="lock" className="text-secondary" />
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mobile App Login</p>
                    <p className="text-sm text-secondary">
                      {isTrainerMode ? 'Allow login to the trainer mobile app' : 'Allow access to trainer app'}
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={form.mobileAppAccess}
                      onChange={(e) => setForm({ ...form, mobileAppAccess: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-surface-container-highest after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary-fixed peer-checked:after:translate-x-full" />
                  </label>
                </div>
                {!isTrainerMode && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Admin Dashboard</p>
                      <p className="text-sm text-secondary">Full system management access</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={form.adminDashboardAccess}
                        onChange={(e) =>
                          setForm({ ...form, adminDashboardAccess: e.target.checked })
                        }
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-surface-container-highest after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary-fixed peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                )}
                {!editId && (
                  <div className="space-y-2 border-t border-white/5 pt-6">
                    <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                      Temp Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Min 8 characters (default Staff@123)"
                        className="fitsphere-input pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary"
                      >
                        <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard className="overflow-hidden rounded-xl p-0">
              <div className="relative h-32">
                <img src={PREVIEW_BANNER} alt="" className="h-full w-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent" />
              </div>
              <div className="relative z-10 -mt-10 px-6 pb-6">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-surface-container-highest">
                  {previewAvatar ? (
                    <img src={previewAvatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Icon name="account_circle" size={40} className="text-secondary" />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="font-display text-xl font-semibold">{previewName}</h3>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary-fixed">
                    {previewRole}
                  </p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-secondary">
                    <span>Branch</span>
                    <span className="text-on-surface">{currentGym.name}</span>
                  </div>
                  <div className="flex justify-between text-secondary">
                    <span>Joining</span>
                    <span className="text-on-surface">{form.joinedAt || '—'}</span>
                  </div>
                  {form.baseRate && (
                    <div className="flex justify-between text-secondary">
                      <span>Salary</span>
                      <span className="text-primary-container">
                        ₹{Number(form.baseRate).toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={saving || uploadingAvatar || uploadingAddressProof || uploadingIdProof}
                className="neon-glow flex w-full items-center justify-center gap-2 rounded-lg bg-neon py-3 font-bold text-on-primary-fixed transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <Icon name="save" size={22} />
                {saving ? 'Saving...' : editId ? (isTrainerMode ? 'UPDATE TRAINER' : 'UPDATE STAFF MEMBER') : isTrainerMode ? 'SAVE TRAINER' : 'SAVE STAFF MEMBER'}
              </button>
              <Link
                to={listPath}
                className="block w-full rounded-lg border border-white/20 py-3 text-center font-semibold transition-colors hover:bg-white/5"
              >
                CANCEL
              </Link>
            </div>
          </div>
        </form>
      </div>

      <SuccessModal
        open={showSuccess}
        onClose={() => navigate(listPath)}
        title={isTrainerMode ? 'Trainer Added' : 'Staff Added'}
        message={
          isTrainerMode
            ? 'The trainer profile has been saved with specializations and employment details.'
            : 'The staff profile has been saved with employment and document details.'
        }
        actionLabel={isTrainerMode ? 'Back to Trainers' : 'Back to Staff'}
        onAction={() => navigate(listPath)}
      />
    </div>
  );
};

export default AddStaff;
