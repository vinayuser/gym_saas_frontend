import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  createBanner,
  updateBanner,
  fetchBannerById,
  clearCurrentBanner,
} from '../../../store/slices/bannerSlice';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import PageLoader from '../../../components/Loader/PageLoader';
import {
  BANNER_CATEGORIES,
  BANNER_PLACEMENTS,
  BANNER_CTA_TYPES,
  TIME_SLOTS,
  TARGET_AUDIENCES,
  getCtaLabel,
  toDateInput,
} from '../../../helpers/bannerUtils';
import { uploadMediaFile } from '../../../helpers/mediaUpload';

const DEFAULT_PREVIEW =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCc-6ycM88BqPfBlDcmQui5SNKcDdeTFMa1fwJv6n4EeOtJmu1MyBlJ6Evv10Q_6vs2MpzLOcF3hxHva9mwca3ZVFFUgSXM-ms9l4tXK0HBOcOCbi2ZK-peQ6238IZonkJMVj118_IJctZ6zmVXS818FVLj9uV3urxDNU1SRq4wDmWD6b00CQcMWEBfuRBdstfsNntf9qjcKhuedoL9e3mKvqhoibzXRMan8hbrjtah-rz_3HivjvuOzHI1lU7ZWTEDC88zT2fONhM';

const EMPTY_FORM = {
  name: '',
  internalCode: '',
  category: 'PROMOTION',
  placement: 'GLOBAL_HOMEPAGE',
  imageUrl: '',
  startDate: '',
  endDate: '',
  timeSlots: ['morning'],
  targetAudience: ['all'],
  ctaType: 'CLASS_BOOKING',
  ctaDestination: '',
  isActive: true,
};

const FormField = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-semibold uppercase tracking-wider text-secondary">{label}</label>
    {children}
  </div>
);

const inputClass =
  'input-cyber w-full rounded-lg border border-white/10 bg-surface-container-lowest px-3 py-2.5 text-on-surface transition focus:border-primary-container focus:outline-none';

const AddEditBanner = () => {
  const { bannerId } = useParams();
  const isEdit = Boolean(bannerId);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const { currentGym } = useSelector((state) => state.gym);
  const { currentBanner, loading } = useSelector((state) => state.banner);

  const [form, setForm] = useState(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState(DEFAULT_PREVIEW);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!isEdit || !currentGym?.id || !bannerId) return;
    dispatch(fetchBannerById({ gymId: currentGym.id, bannerId }));
    return () => dispatch(clearCurrentBanner());
  }, [dispatch, isEdit, currentGym?.id, bannerId]);

  useEffect(() => {
    if (!currentBanner || !isEdit) return;
    setForm({
      name: currentBanner.name || '',
      internalCode: currentBanner.internalCode || '',
      category: currentBanner.category || 'PROMOTION',
      placement: currentBanner.placement || 'GLOBAL_HOMEPAGE',
      imageUrl: currentBanner.imageUrl || '',
      startDate: toDateInput(currentBanner.startDate),
      endDate: toDateInput(currentBanner.endDate),
      timeSlots: currentBanner.timeSlots?.length ? currentBanner.timeSlots : ['morning'],
      targetAudience: currentBanner.targetAudience?.length
        ? currentBanner.targetAudience
        : ['all'],
      ctaType: currentBanner.ctaType || 'CLASS_BOOKING',
      ctaDestination: currentBanner.ctaDestination || '',
      isActive: currentBanner.isActive !== false,
    });
    setPreviewUrl(currentBanner.imageUrl || DEFAULT_PREVIEW);
  }, [currentBanner, isEdit]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSlot = (id) => {
    setForm((prev) => {
      const slots = prev.timeSlots.includes(id)
        ? prev.timeSlots.filter((s) => s !== id)
        : [...prev.timeSlots, id];
      return { ...prev, timeSlots: slots.length ? slots : [id] };
    });
  };

  const toggleAudience = (id) => {
    setForm((prev) => {
      const next = prev.targetAudience.includes(id)
        ? prev.targetAudience.filter((a) => a !== id)
        : [...prev.targetAudience, id];
      return { ...prev, targetAudience: next.length ? next : [id] };
    });
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setUploadingImage(true);
    try {
      const asset = await uploadMediaFile(file, { folder: 'banners', resourceType: 'image' });
      setPreviewUrl(asset.url);
      setField('imageUrl', asset.url);
      toast.success('Banner image uploaded');
    } catch {
      /* toast from helper */
    } finally {
      setUploadingImage(false);
    }
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    internalCode: form.internalCode.trim() || null,
    category: form.category,
    placement: form.placement,
    imageUrl: form.imageUrl || null,
    startDate: form.startDate || null,
    endDate: form.endDate || null,
    timeSlots: form.timeSlots,
    targetAudience: form.targetAudience,
    ctaType: form.ctaType,
    ctaDestination: form.ctaDestination.trim() || null,
    isActive: form.isActive,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentGym?.id || !form.name.trim()) return;

    setSaving(true);
    const payload = buildPayload();
    const result = isEdit
      ? await dispatch(updateBanner({ gymId: currentGym.id, bannerId, data: payload }))
      : await dispatch(createBanner({ gymId: currentGym.id, data: payload }));

    setSaving(false);
    if (!result.error) navigate('/owner/banners');
  };

  if (!currentGym) {
    return (
      <div className="p-8">
        <GlassCard className="p-6 text-secondary">Select a gym branch first.</GlassCard>
      </div>
    );
  }

  if (isEdit && loading && !currentBanner) {
    return <PageLoader show message="Loading banner..." />;
  }

  const ctaButtonLabel = getCtaLabel(form.ctaType).split(' ')[0].toUpperCase();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="custom-scrollbar flex-1 overflow-y-auto p-6 pb-28 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <Link
              to="/owner/banners"
              className="mb-4 inline-flex items-center gap-1 text-sm text-secondary hover:text-primary-container"
            >
              <Icon name="arrow_back" size={18} />
              Back to banners
            </Link>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {isEdit ? 'Edit Banner Campaign' : 'Create Banner Campaign'}
            </h1>
            <p className="mt-1 text-secondary/70">
              Configure identity, scheduling, CTA, and preview how members will see it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <GlassCard className="p-6">
                <div className="mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                  <Icon name="edit_note" className="text-primary-container" />
                  <h2 className="text-xl font-semibold">Banner Identity</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Banner Name">
                      <input
                        className={inputClass}
                        value={form.name}
                        onChange={(e) => setField('name', e.target.value)}
                        placeholder="Summer Flash Sale 2024"
                        required
                      />
                    </FormField>
                    <FormField label="Internal ID">
                      <input
                        className={inputClass}
                        value={form.internalCode}
                        onChange={(e) => setField('internalCode', e.target.value)}
                        placeholder="CAM-8820-PR"
                      />
                    </FormField>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Campaign Category">
                      <select
                        className={inputClass}
                        value={form.category}
                        onChange={(e) => setField('category', e.target.value)}
                      >
                        {BANNER_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Placement">
                      <select
                        className={inputClass}
                        value={form.placement}
                        onChange={(e) => setField('placement', e.target.value)}
                      >
                        {BANNER_PLACEMENTS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                  <Icon name="calendar_today" className="text-primary-container" />
                  <h2 className="text-xl font-semibold">Scheduling &amp; Visibility</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Start Date">
                      <input
                        type="date"
                        className={inputClass}
                        value={form.startDate}
                        onChange={(e) => setField('startDate', e.target.value)}
                      />
                    </FormField>
                    <FormField label="End Date">
                      <input
                        type="date"
                        className={inputClass}
                        value={form.endDate}
                        onChange={(e) => setField('endDate', e.target.value)}
                      />
                    </FormField>
                  </div>
                  <FormField label="Active Time Slots">
                    <div className="flex flex-wrap gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => toggleSlot(slot.id)}
                          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                            form.timeSlots.includes(slot.id)
                              ? 'border-primary-container bg-primary-container/10 text-primary-container'
                              : 'border-white/10 text-secondary hover:border-white/30'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </FormField>
                  <FormField label="Target Audience">
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      {TARGET_AUDIENCES.map((aud) => (
                        <label
                          key={aud.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg bg-surface-container p-3 transition hover:bg-surface-container-high"
                        >
                          <input
                            type="checkbox"
                            checked={form.targetAudience.includes(aud.id)}
                            onChange={() => toggleAudience(aud.id)}
                            className="rounded border-white/20 bg-transparent text-primary-container focus:ring-0"
                          />
                          <span className="text-xs font-medium">{aud.label}</span>
                        </label>
                      ))}
                    </div>
                  </FormField>
                  <label className="flex items-center gap-2 text-sm text-secondary">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setField('isActive', e.target.checked)}
                      className="rounded border-white/20 bg-transparent text-primary-container"
                    />
                    Campaign is active when saved
                  </label>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                  <Icon name="ads_click" className="text-primary-container" />
                  <h2 className="text-xl font-semibold">CTA Action</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Action Type">
                    <select
                      className={inputClass}
                      value={form.ctaType}
                      onChange={(e) => setField('ctaType', e.target.value)}
                    >
                      {BANNER_CTA_TYPES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Destination">
                    <input
                      className={inputClass}
                      value={form.ctaDestination}
                      onChange={(e) => setField('ctaDestination', e.target.value)}
                      placeholder={
                        form.ctaType === 'EXTERNAL_URL'
                          ? 'https://...'
                          : 'Select class, product, or event...'
                      }
                    />
                  </FormField>
                </div>
              </GlassCard>
            </div>

            <div className="space-y-6 lg:col-span-5">
              <GlassCard className="p-6">
                <div className="mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                  <Icon name="upload_file" className="text-primary-container" />
                  <h2 className="text-xl font-semibold">Asset Creative</h2>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFile(e.dataTransfer.files?.[0]);
                  }}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 p-8 text-center transition hover:border-primary-container/50 ${uploadingImage ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <Icon name="cloud_upload" size={48} className="text-secondary" />
                  <div>
                    <p className="font-medium">
                      {uploadingImage ? 'Uploading to Cloudinary…' : 'Drag & drop your banner creative'}
                    </p>
                    <p className="mt-1 text-xs text-secondary">
                      Recommended: 1080×450. Max 5MB (PNG, JPG, WebP)
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={uploadingImage}
                    className="rounded-full border border-white/20 px-4 py-1.5 text-sm hover:bg-white/5"
                  >
                    Browse Files
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </div>
                <FormField label="Or image URL">
                  <input
                    className={`${inputClass} mt-4`}
                    value={form.imageUrl || ''}
                    onChange={(e) => {
                      setField('imageUrl', e.target.value);
                      if (e.target.value) setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://..."
                  />
                </FormField>
              </GlassCard>

              <GlassCard className="flex flex-col items-center p-6">
                <div className="mb-6 flex w-full items-center gap-2 border-b border-white/5 pb-4">
                  <Icon name="smartphone" className="text-primary-container" />
                  <h2 className="text-xl font-semibold">Live Preview</h2>
                </div>
                <div className="relative flex h-[580px] w-[280px] flex-col overflow-hidden rounded-[40px] border-[8px] border-surface-container-highest bg-black shadow-2xl">
                  <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-surface-container-highest" />
                  <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-4 pt-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-secondary">Good morning,</p>
                        <p className="text-xs font-bold text-white">Alex Johnson</p>
                      </div>
                      <Icon name="notifications" size={18} className="text-white" />
                    </div>
                    <div className="relative aspect-[1080/450] w-full overflow-hidden rounded-xl bg-surface-container-high">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-full w-full object-cover transition duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white">
                          {form.name || 'Your Banner'}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-primary-container px-3 py-1 text-[8px] font-bold text-on-primary-container">
                          {ctaButtonLabel}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-white">UPCOMING CLASSES</p>
                    <div className="flex h-16 items-center gap-3 rounded-lg border border-white/5 bg-surface-container p-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-container-highest">
                        <Icon name="timer" size={18} className="text-primary-container" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white">HIIT Warriors</p>
                        <p className="text-[8px] text-secondary">08:00 AM • Studio A</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-12 items-center justify-around border-t border-white/5 bg-surface-container px-4">
                    <Icon name="home" size={20} className="text-primary-container" />
                    <Icon name="event" size={20} className="text-secondary" />
                    <Icon name="bar_chart" size={20} className="text-secondary" />
                    <Icon name="person" size={20} className="text-secondary" />
                  </div>
                </div>
              </GlassCard>
            </div>
          </form>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-between gap-3 border-t border-white/10 bg-surface/90 px-6 py-4 backdrop-blur-md sm:flex-row md:left-[280px]">
        <div className="flex items-center gap-2 text-sm text-secondary">
          <Icon name="info" size={18} />
          Changes will take effect immediately upon saving.
        </div>
        <div className="flex gap-4">
          <Link
            to="/owner/banners"
            className="rounded-lg px-6 py-2.5 text-sm font-medium transition hover:bg-white/5"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="cyber-glow rounded-lg bg-primary-container px-6 py-2.5 text-sm font-bold text-on-primary-container transition hover:scale-[1.02] disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Banner'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AddEditBanner;
