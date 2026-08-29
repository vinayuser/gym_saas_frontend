import { useState } from 'react';
import { toast } from 'react-toastify';
import AppModal from '../../../components/fitsphere/AppModal';
import Icon from '../../../components/fitsphere/Icon';
import { changePassword } from '../../../helpers/securityApi';

const ChangePasswordModal = ({ open, onClose }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, next: false });
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShow({ current: false, next: false });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      if (res.success) {
        toast.success(res.message || 'Password updated');
        handleClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal open={open} onClose={handleClose} size="md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Change password</h2>
          <p className="mt-1 text-sm text-secondary">Other active sessions will be signed out.</p>
        </div>
        <button type="button" onClick={handleClose} className="text-secondary hover:text-on-surface">
          <Icon name="close" size={22} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'currentPassword', label: 'Current password', showKey: 'current' },
          { key: 'newPassword', label: 'New password', showKey: 'next' },
        ].map(({ key, label, showKey }) => (
          <div key={key}>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary">
              {label}
            </label>
            <div className="relative">
              <input
                type={show[showKey] ? 'text' : 'password'}
                required
                minLength={key === 'newPassword' ? 8 : 1}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="input-cyber w-full rounded-lg px-3 py-2.5 pr-11 text-sm"
              />
              <button
                type="button"
                onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary"
              >
                <Icon name={show[showKey] ? 'visibility_off' : 'visibility'} size={20} />
              </button>
            </div>
          </div>
        ))}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary">
            Confirm new password
          </label>
          <input
            type="password"
            required
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            className="input-cyber w-full rounded-lg px-3 py-2.5 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="neon-glow mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-fixed py-3 font-semibold text-on-primary-fixed disabled:opacity-50"
        >
          {loading ? <Icon name="progress_activity" size={20} className="animate-spin" /> : 'Update password'}
        </button>
      </form>
    </AppModal>
  );
};

export default ChangePasswordModal;
