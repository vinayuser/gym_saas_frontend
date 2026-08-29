import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import GlassCard from '../../components/fitsphere/GlassCard';
import Icon from '../../components/fitsphere/Icon';
import ENDPOINTS from '../../config/apiUrls';
import axiosInstance from '../../config/axiosInstance';
import { getRequest, postRequest } from '../../config/dataApi';
import { openRazorpayCheckout } from '../../helpers/razorpayCheckout';
import { uploadMediaFile, uploadMediaFiles, filePreviewUrl } from '../../helpers/mediaUpload';
import MediaFileDrop from '../../components/fitsphere/MediaFileDrop';
import { formatCurrency, formatDate } from '../../helpers/formatUtils';

const inputClass =
  'input-cyber w-full rounded-lg border border-white/10 bg-surface-container-lowest px-3 py-2.5 text-sm';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary';

const TOTAL_STEPS = 5;

const OwnerInviteSetup = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paying, setPaying] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [invite, setInvite] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(true);

  const logoRef = useRef(null);
  const videoRef = useRef(null);
  const photosRef = useRef(null);

  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [profile, setProfile] = useState({
    businessName: '',
    description: '',
    location: '',
    city: '',
    state: '',
    postalCode: '',
    contactPhones: [''],
    supportEmails: [''],
    logoUrl: null,
    logoPreview: null,
    logoName: '',
  });
  const [media, setMedia] = useState({
    videoUrl: null,
    videoPreview: null,
    videoName: '',
    photos: [],
  });

  const plan = invite?.plan;

  const restoreOnboarding = (loaded) => {
    if (!loaded?.onboardingData) return;
    const o = loaded.onboardingData;
    setProfile((p) => ({
      ...p,
      businessName: o.businessName || loaded.businessName || p.businessName,
      description: o.description || '',
      location: o.location || '',
      city: o.city || '',
      state: o.state || '',
      postalCode: o.postalCode || '',
      contactPhones: o.contactPhones?.length ? o.contactPhones : p.contactPhones,
      supportEmails: o.supportEmails?.length ? o.supportEmails : p.supportEmails,
      logoUrl: o.logoUrl || null,
      logoPreview: o.logoUrl || null,
    }));
    setMedia((m) => ({
      ...m,
      videoUrl: o.videoUrl || null,
      videoPreview: o.videoUrl || null,
      photos: (o.photoUrls || []).map((url, i) => ({
        id: `restored-${i}`,
        url,
        preview: url,
      })),
    }));
  };

  const tryCompletePendingPayment = async () => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.INVITES.VERIFY_PAYMENT(token), {});
      return response.data;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!token) return;
    setLoadingInvite(true);
    getRequest(ENDPOINTS.INVITES.PUBLIC(token))
      .then((res) => {
        const loaded = res.data.invite;
        setInvite(loaded);
        setLoadError(null);

        if (loaded.completed) {
          setStep(6);
          return;
        }

        if (loaded.businessName) {
          setProfile((p) => ({
            ...p,
            businessName: p.businessName || loaded.businessName,
          }));
        }
        if (loaded.paymentPending) {
          restoreOnboarding(loaded);
          setStep(5);
        }
      })
      .catch((err) => {
        setLoadError(err.response?.data?.message || 'Invalid or expired invite');
        setInvite(null);
      })
      .finally(() => setLoadingInvite(false));
  }, [token]);

  useEffect(() => {
    if (!invite?.paymentPending || step !== 5 || loadingInvite) return;

    let cancelled = false;
    (async () => {
      const result = await tryCompletePendingPayment();
      if (!cancelled && result?.success) {
        toast.success('Payment confirmed — your app is ready');
        setStep(6);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [invite?.paymentPending, step, loadingInvite, token]);

  const setProfileField = (key, value) => setProfile((p) => ({ ...p, [key]: value }));

  const updateListItem = (key, index, value) => {
    setProfile((p) => {
      const list = [...p[key]];
      list[index] = value;
      return { ...p, [key]: list };
    });
  };

  const addListItem = (key, max) => {
    setProfile((p) => {
      if (p[key].length >= max) return p;
      return { ...p, [key]: [...p[key], ''] };
    });
  };

  const removeListItem = (key, index) => {
    setProfile((p) => {
      const list = p[key].filter((_, i) => i !== index);
      return { ...p, [key]: list.length ? list : [''] };
    });
  };

  const initProfileFromInvite = () => {
    if (invite?.businessName && !profile.businessName) {
      setProfileField('businessName', invite.businessName);
    }
  };

  const validatePasswords = () => {
    if (passwords.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    if (passwords.password !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateProfile = () => {
    if (!profile.businessName.trim()) {
      toast.error('Gym / business name is required');
      return false;
    }
    const phones = profile.contactPhones.map((p) => p.trim()).filter(Boolean);
    if (phones.length === 0) {
      toast.error('Add at least one contact number');
      return false;
    }
    if (!profile.location.trim()) {
      toast.error('Location / address is required');
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1) {
      initProfileFromInvite();
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!validatePasswords()) return;
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!validateProfile()) return;
      setStep(4);
      return;
    }
    if (step === 4) {
      setStep(5);
    }
  };

  const handleLogo = async (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Logo must be an image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo max 5MB');
      return;
    }
    setUploadingLogo(true);
    try {
      const localPreview = await filePreviewUrl(file);
      setProfile((p) => ({ ...p, logoPreview: localPreview, logoName: file.name }));
      const asset = await uploadMediaFile(file, {
        folder: 'gyms/logos',
        inviteToken: token,
        resourceType: 'image',
      });
      setProfile((p) => ({ ...p, logoUrl: asset.url, logoPreview: asset.url, logoName: file.name }));
      toast.success('Logo uploaded');
    } catch {
      setProfile((p) => ({ ...p, logoPreview: null, logoUrl: null, logoName: '' }));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleVideo = async (file) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video max 50MB');
      return;
    }
    setUploadingVideo(true);
    try {
      const localPreview = await filePreviewUrl(file);
      setMedia((m) => ({ ...m, videoPreview: localPreview, videoName: file.name }));
      const asset = await uploadMediaFile(file, {
        folder: 'gyms/videos',
        inviteToken: token,
        resourceType: 'video',
      });
      setMedia((m) => ({
        ...m,
        videoUrl: asset.url,
        videoPreview: asset.url,
        videoName: file.name,
      }));
      toast.success('Video uploaded');
    } catch {
      setMedia((m) => ({ ...m, videoPreview: null, videoUrl: null, videoName: '' }));
    } finally {
      setUploadingVideo(false);
    }
  };

  const handlePhotos = async (fileList) => {
    const files = Array.from(fileList || []);
    const remaining = 5 - media.photos.length;
    if (remaining <= 0) {
      toast.error('Maximum 5 photos allowed');
      return;
    }
    const toAdd = files.slice(0, remaining).filter((f) => f.type.startsWith('image/'));
    if (!toAdd.length) {
      toast.error('Photos must be images');
      return;
    }
    setUploadingPhotos(true);
    try {
      const assets = await uploadMediaFiles(toAdd, {
        folder: 'gyms/gallery',
        inviteToken: token,
      });
      setMedia((m) => ({
        ...m,
        photos: [
          ...m.photos,
          ...assets.map((a, i) => ({
            id: `${Date.now()}-${i}`,
            url: a.url,
            preview: a.url,
            name: toAdd[i]?.name,
          })),
        ],
      }));
      toast.success(`${assets.length} photo(s) uploaded`);
    } catch {
      /* toast from helper */
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (id) => {
    setMedia((m) => ({ ...m, photos: m.photos.filter((p) => p.id !== id) }));
  };

  const buildCheckoutPayload = () => {
    const payload = {
      businessName: profile.businessName.trim(),
      description: profile.description,
      contactPhones: profile.contactPhones.map((p) => p.trim()).filter(Boolean),
      supportEmails: profile.supportEmails.map((e) => e.trim()).filter(Boolean),
      location: profile.location,
      city: profile.city,
      state: profile.state,
      postalCode: profile.postalCode,
      logoUrl: profile.logoUrl || null,
      videoUrl: media.videoUrl || null,
      photoUrls: media.photos.map((p) => p.url).filter(Boolean),
    };
    if (passwords.password) {
      payload.password = passwords.password;
    }
    return payload;
  };

  const completeActivation = async (paymentPayload = {}) => {
    await postRequest(ENDPOINTS.INVITES.VERIFY_PAYMENT(token), paymentPayload);
    toast.success('Payment successful — your app is ready');
    setStep(6);
  };

  const handlePayment = async () => {
    if (!invite?.paymentPending && !validatePasswords()) return;

    setPaying(true);
    let checkout = null;

    try {
      const pending = await tryCompletePendingPayment();
      if (pending?.success) {
        toast.success('Payment confirmed — your app is ready');
        setStep(6);
        return;
      }

      const checkoutRes = await postRequest(
        ENDPOINTS.INVITES.CHECKOUT(token),
        buildCheckoutPayload()
      );
      checkout = checkoutRes.data;

      let payment;
      try {
        payment = await openRazorpayCheckout({
          keyId: checkout.keyId,
          orderId: checkout.orderId,
          amount: checkout.amount,
          currency: checkout.currency,
          description: `${checkout.planName} — first month`,
          email: checkout.inviteEmail || invite.email,
          mock: checkout.mock,
        });
      } catch (razorpayErr) {
        if (razorpayErr.message === 'Payment cancelled') {
          await completeActivation({ orderId: checkout.orderId });
          return;
        }
        throw razorpayErr;
      }

      await completeActivation(payment);
    } catch (err) {
      if (checkout?.orderId) {
        try {
          await completeActivation({ orderId: checkout.orderId });
          return;
        } catch {
          /* payment not captured yet */
        }
      }
      if (err.message !== 'Payment cancelled') {
        toast.error(err.response?.data?.message || err.message || 'Payment failed');
      }
    } finally {
      setPaying(false);
    }
  };

  if (loadingInvite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-secondary">Loading invite…</p>
      </div>
    );
  }

  if (!invite || loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <GlassCard className="max-w-md p-8 text-center">
          <Icon name="link_off" size={48} className="mx-auto text-error" />
          <h1 className="mt-4 font-display text-2xl font-bold">Invalid invite</h1>
          <p className="mt-2 text-secondary">{loadError}</p>
          <Link
            to="/auth/login"
            className="mt-6 inline-block text-sm text-primary-container hover:underline"
          >
            Go to login
          </Link>
        </GlassCard>
      </div>
    );
  }

  const amountDue = Number(plan?.priceMonthly ?? 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon">
              <Icon name="fitness_center" size={22} className="text-on-primary-fixed" />
            </div>
            <div>
              <p className="font-display font-bold text-primary-container">FitSphere Pro</p>
              <p className="text-xs text-secondary">Gym owner onboarding</p>
            </div>
          </div>
          {step <= TOTAL_STEPS && (
            <p className="text-xs text-secondary">
              Step {step} of {TOTAL_STEPS}
            </p>
          )}
        </div>
      </header>

      <main className="flex flex-1 justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          {step <= TOTAL_STEPS && (
            <div className="mb-8 flex justify-center gap-1.5">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
                <div
                  key={s}
                  title={`Step ${s}`}
                  className={`h-1.5 flex-1 max-w-12 rounded-full ${step >= s ? 'bg-primary-container' : 'bg-white/10'}`}
                />
              ))}
            </div>
          )}

          {/* Step 1 — Welcome (email from invite, no re-entry) */}
          {step === 1 && (
            <GlassCard className="p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-container">
                You&apos;re invited
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold">Set up your gym app</h1>
              <p className="mt-3 text-sm text-secondary">
                This invite is for{' '}
                <span className="font-medium text-on-surface">{invite.email}</span>
                {invite.inviteeName ? ` (${invite.inviteeName})` : ''}. You won&apos;t need to
                enter your email again.
              </p>

              {plan && (
                <div className="mt-6 rounded-xl border border-primary-container/30 bg-primary-container/10 p-5">
                  <p className="text-xs uppercase text-secondary">Assigned plan</p>
                  <p className="mt-1 text-xl font-bold text-primary-container">{plan.name}</p>
                  <p className="text-sm text-secondary">
                    {formatCurrency(plan.priceMonthly)}/month · invite expires{' '}
                    {formatDate(invite.expiresAt)}
                  </p>
                  {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <ul className="mt-4 space-y-1 text-xs text-secondary">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <Icon name="check" size={16} className="text-primary-container" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={goNext}
                className="cyber-glow mt-8 w-full rounded-lg bg-primary-container py-3 font-bold text-on-primary-container"
              >
                Get started
              </button>
            </GlassCard>
          )}

          {/* Step 2 — Password only */}
          {step === 2 && (
            <GlassCard className="p-8">
              <h1 className="font-display text-2xl font-bold">Create your password</h1>
              <p className="mt-2 text-sm text-secondary">
                Account email: <strong className="text-on-surface">{invite.email}</strong>
              </p>
              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  goNext();
                }}
              >
                <div>
                  <label className={labelClass} htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={inputClass}
                    placeholder="At least 8 characters"
                    value={passwords.password}
                    onChange={(e) => setPasswords((p) => ({ ...p, password: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="confirmPassword">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    className={inputClass}
                    placeholder="Re-enter password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="cyber-glow w-full rounded-lg bg-primary-container py-3 font-bold text-on-primary-container"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-sm text-secondary hover:text-on-surface"
                >
                  Back
                </button>
              </form>
            </GlassCard>
          )}

          {/* Step 3 — Logo, description, contacts, support, location */}
          {step === 3 && (
            <GlassCard className="space-y-6 p-8">
              <div>
                <h1 className="font-display text-2xl font-bold">Gym profile</h1>
                <p className="mt-1 text-sm text-secondary">
                  Branding and contact details for your member app.
                </p>
              </div>

              <MediaFileDrop
                label="App logo"
                hint="PNG or JPG, max 5MB — uploads to Cloudinary"
                accept="image/png,image/jpeg,image/webp"
                preview={profile.logoPreview}
                uploading={uploadingLogo}
                icon="image"
                inputRef={logoRef}
                onFile={handleLogo}
                onClear={() =>
                  setProfile((p) => ({ ...p, logoPreview: null, logoUrl: null, logoName: '' }))
                }
              />

              <div>
                <label className={labelClass} htmlFor="businessName">
                  Gym / business name
                </label>
                <input
                  id="businessName"
                  required
                  className={inputClass}
                  value={profile.businessName}
                  onChange={(e) => setProfileField('businessName', e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="description">
                  Gym description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className={inputClass}
                  placeholder="Tell members about your gym, facilities, and vibe..."
                  value={profile.description}
                  onChange={(e) => setProfileField('description', e.target.value)}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className={labelClass.replace('mb-1.5 ', '')}>Contact numbers</span>
                  <span className="text-xs text-secondary">Up to 3</span>
                </div>
                <div className="space-y-2">
                  {profile.contactPhones.map((phone, idx) => (
                    <div key={`phone-${idx}`} className="flex gap-2">
                      <input
                        type="tel"
                        className={inputClass}
                        placeholder={`Phone ${idx + 1}`}
                        value={phone}
                        onChange={(e) => updateListItem('contactPhones', idx, e.target.value)}
                      />
                      {profile.contactPhones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeListItem('contactPhones', idx)}
                          className="shrink-0 rounded-lg border border-white/10 px-3 text-secondary hover:text-error"
                        >
                          <Icon name="remove" size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {profile.contactPhones.length < 3 && (
                  <button
                    type="button"
                    onClick={() => addListItem('contactPhones', 3)}
                    className="mt-2 flex items-center gap-1 text-sm text-primary-container hover:underline"
                  >
                    <Icon name="add" size={18} />
                    Add another number
                  </button>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className={labelClass.replace('mb-1.5 ', '')}>Support emails</span>
                  <span className="text-xs text-secondary">Member support inbox</span>
                </div>
                <div className="space-y-2">
                  {profile.supportEmails.map((email, idx) => (
                    <div key={`support-${idx}`} className="flex gap-2">
                      <input
                        type="email"
                        className={inputClass}
                        placeholder="support@yourgym.com"
                        value={email}
                        onChange={(e) => updateListItem('supportEmails', idx, e.target.value)}
                      />
                      {profile.supportEmails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeListItem('supportEmails', idx)}
                          className="shrink-0 rounded-lg border border-white/10 px-3 text-secondary hover:text-error"
                        >
                          <Icon name="remove" size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {profile.supportEmails.length < 3 && (
                  <button
                    type="button"
                    onClick={() => addListItem('supportEmails', 3)}
                    className="mt-2 flex items-center gap-1 text-sm text-primary-container hover:underline"
                  >
                    <Icon name="add" size={18} />
                    Add support email
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <p className={labelClass}>Location</p>
                <input
                  className={inputClass}
                  placeholder="Street address / area"
                  value={profile.location}
                  onChange={(e) => setProfileField('location', e.target.value)}
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    className={inputClass}
                    placeholder="City"
                    value={profile.city}
                    onChange={(e) => setProfileField('city', e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="State"
                    value={profile.state}
                    onChange={(e) => setProfileField('state', e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Postal code"
                    value={profile.postalCode}
                    onChange={(e) => setProfileField('postalCode', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-lg border border-white/10 py-3 text-sm hover:bg-white/5"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="cyber-glow flex-[2] rounded-lg bg-primary-container py-3 font-bold text-on-primary-container"
                >
                  Continue
                </button>
              </div>
            </GlassCard>
          )}

          {/* Step 4 — Video + photos */}
          {step === 4 && (
            <GlassCard className="space-y-6 p-8">
              <div>
                <h1 className="font-display text-2xl font-bold">Gym media</h1>
                <p className="mt-1 text-sm text-secondary">
                  Showcase your space in the member app. Video is optional; add up to 5 photos.
                </p>
              </div>

              <MediaFileDrop
                label="Gym video (optional)"
                hint="MP4 or WebM, max 50MB — uploads to Cloudinary"
                accept="video/mp4,video/webm,video/quicktime"
                preview={media.videoPreview}
                previewType="video"
                uploading={uploadingVideo}
                icon="videocam"
                inputRef={videoRef}
                onFile={handleVideo}
                onClear={() =>
                  setMedia((m) => ({
                    ...m,
                    videoPreview: null,
                    videoUrl: null,
                    videoName: '',
                  }))
                }
              />
              {media.videoName && (
                <p className="text-xs text-secondary">Selected: {media.videoName}</p>
              )}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className={labelClass.replace('mb-1.5 ', '')}>Gym photos</span>
                  <span className="text-xs text-secondary">
                    {media.photos.length} / 5
                  </span>
                </div>
                {media.photos.length > 0 && (
                  <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {media.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-white/10"
                      >
                        <img src={photo.preview} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="absolute right-1 top-1 rounded bg-black/70 p-1 opacity-0 transition group-hover:opacity-100"
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {media.photos.length < 5 && (
                  <label
                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/10 p-6 text-center hover:border-primary-container/40 ${uploadingPhotos ? 'pointer-events-none opacity-60' : ''}`}
                  >
                    <Icon name="add_photo_alternate" size={32} className="text-secondary" />
                    <span className="text-sm">
                      {uploadingPhotos ? 'Uploading…' : 'Add photos (PNG, JPG)'}
                    </span>
                    <input
                      ref={photosRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      disabled={uploadingPhotos}
                      className="hidden"
                      onChange={(e) => handlePhotos(e.target.files)}
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-lg border border-white/10 py-3 text-sm hover:bg-white/5"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="cyber-glow flex-[2] rounded-lg bg-primary-container py-3 font-bold text-on-primary-container"
                >
                  Continue to payment
                </button>
              </div>
            </GlassCard>
          )}

          {/* Step 5 — Payment */}
          {step === 5 && plan && (
            <GlassCard className="space-y-6 p-8">
              <div>
                <h1 className="font-display text-2xl font-bold">Activate your app</h1>
                <p className="mt-1 text-sm text-secondary">
                  Pay the first month to launch <strong>{profile.businessName}</strong> on{' '}
                  {plan.name}.
                </p>
                {invite.paymentPending && (
                  <p className="mt-2 text-xs text-primary-container">
                    Payment started — if you already paid, we&apos;ll confirm automatically.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Plan</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-secondary">Billing</span>
                  <span>Monthly</span>
                </div>
                <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
                  <span className="text-secondary">Due today</span>
                  <span className="font-display text-3xl font-bold text-primary-container">
                    {formatCurrency(amountDue)}
                  </span>
                </div>
              </div>

              <p className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-secondary">
                <Icon name="lock" size={18} className="mr-2 inline align-middle text-primary-container" />
                Secure payment via Razorpay. Media is stored on Cloudinary.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={paying}
                  className="flex-1 rounded-lg border border-white/10 py-3 text-sm hover:bg-white/5 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={paying}
                  className="cyber-glow flex flex-[2] items-center justify-center gap-2 rounded-lg bg-primary-container py-3 font-bold text-on-primary-container disabled:opacity-70"
                >
                  {paying ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary-container/30 border-t-on-primary-container" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Icon name="lock" size={18} />
                      Pay {formatCurrency(amountDue)} &amp; launch app
                    </>
                  )}
                </button>
              </div>
            </GlassCard>
          )}

          {/* Step 6 — Success */}
          {step === 6 && (
            <GlassCard className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20">
                <Icon name="celebration" size={36} className="text-primary-container" />
              </div>
              <h1 className="font-display text-2xl font-bold">Your app is live!</h1>
              <p className="mt-2 text-sm text-secondary">
                <strong>{profile.businessName}</strong> is ready on the {plan?.name} plan. Sign in
                with <strong>{invite.email}</strong> and the password you created.
              </p>
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="cyber-glow mt-8 w-full rounded-lg bg-primary-container py-3 font-bold text-on-primary-container"
              >
                Sign in to FitSphere Pro
              </button>
            </GlassCard>
          )}
        </div>
      </main>
    </div>
  );
};

export default OwnerInviteSetup;
