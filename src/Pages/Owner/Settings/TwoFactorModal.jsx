import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import AppModal from '../../../components/fitsphere/AppModal';
import Icon from '../../../components/fitsphere/Icon';
import {
  disableTwoFactor,
  fetchTwoFactorStatus,
  setupTwoFactor,
  verifyTwoFactorSetup,
} from '../../../helpers/securityApi';
import { fetchCurrentUserProfile } from '../../../store/slices/authSlice';

const TwoFactorModal = ({ open, onClose, initialEnabled = false }) => {
  const dispatch = useDispatch();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [step, setStep] = useState('status');
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEnabled(initialEnabled);
    setStep(initialEnabled ? 'disable' : 'status');
    setSetup(null);
    setCode('');
    setPassword('');
  }, [open, initialEnabled]);

  const refreshProfile = () => dispatch(fetchCurrentUserProfile({ force: true }));

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const res = await setupTwoFactor();
      if (res.success) {
        setSetup(res.data);
        setStep('setup');
      }
    } catch {
      // handled by API
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyTwoFactorSetup(code);
      if (res.success) {
        toast.success('Two-factor authentication enabled');
        setEnabled(true);
        setStep('status');
        await refreshProfile();
      }
    } catch {
      // handled by API
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await disableTwoFactor({ password, code });
      if (res.success) {
        toast.success('Two-factor authentication disabled');
        setEnabled(false);
        setStep('status');
        await refreshProfile();
      }
    } catch {
      // handled by API
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    setLoading(true);
    try {
      const res = await fetchTwoFactorStatus();
      if (res.success) {
        setEnabled(Boolean(res.data.enabled));
        setStep(res.data.enabled ? 'disable' : 'status');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) handleOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <AppModal open={open} onClose={onClose} size="md" scrollable>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Two-factor authentication</h2>
          <p className="mt-1 text-sm text-secondary">
            Add an extra layer of security using an authenticator app.
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-secondary hover:text-on-surface">
          <Icon name="close" size={22} />
        </button>
      </div>

      {loading && step === 'status' && !setup ? (
        <div className="flex justify-center py-10">
          <Icon name="progress_activity" size={28} className="animate-spin text-primary-fixed" />
        </div>
      ) : null}

      {!enabled && step === 'status' && !loading ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-secondary">
            Scan a QR code with Google Authenticator, Authy, or a similar app when you sign in.
          </div>
          <button
            type="button"
            onClick={handleStartSetup}
            disabled={loading}
            className="neon-glow w-full rounded-lg bg-primary-fixed py-3 font-semibold text-on-primary-fixed disabled:opacity-50"
          >
            Set up authenticator app
          </button>
        </div>
      ) : null}

      {step === 'setup' && setup ? (
        <form onSubmit={handleVerifySetup} className="space-y-4">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <img src={setup.qrCodeDataUrl} alt="Authenticator QR code" className="rounded-lg bg-white p-2" />
            <p className="text-center text-xs text-secondary">Or enter this key manually:</p>
            <code className="break-all rounded bg-black/30 px-3 py-2 text-xs text-primary-fixed">{setup.secret}</code>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary">
              6-digit code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input-cyber w-full rounded-lg px-3 py-2.5 text-center text-lg tracking-[0.4em]"
              placeholder="000000"
            />
          </div>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="neon-glow w-full rounded-lg bg-primary-fixed py-3 font-semibold text-on-primary-fixed disabled:opacity-50"
          >
            Verify and enable
          </button>
        </form>
      ) : null}

      {enabled && step === 'disable' ? (
        <form onSubmit={handleDisable} className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <Icon name="verified_user" size={20} />
            Two-factor authentication is enabled on your account.
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-cyber w-full rounded-lg px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary">
              Authenticator code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input-cyber w-full rounded-lg px-3 py-2.5 text-center text-lg tracking-[0.4em]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border border-error-container/40 py-3 text-sm font-semibold text-error hover:bg-error-container/10 disabled:opacity-50"
          >
            Disable two-factor authentication
          </button>
        </form>
      ) : null}
    </AppModal>
  );
};

export default TwoFactorModal;
