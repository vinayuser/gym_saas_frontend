import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import ToggleSwitch from '../../../components/fitsphere/ToggleSwitch';
import {
  NOTIFICATION_OPTIONS,
  normalizeNotificationPreferences,
  preferencesEqual,
} from '../../../constants/notificationPreferences';
import { saveNotificationPreferences } from '../../../helpers/settingsApi';
import { fetchCurrentUserProfile } from '../../../store/slices/authSlice';

const NotificationPreferencesCard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const saved = normalizeNotificationPreferences(user?.notificationPreferences);
  const [prefs, setPrefs] = useState(saved);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrefs(normalizeNotificationPreferences(user?.notificationPreferences));
  }, [user?.notificationPreferences]);

  const dirty = !preferencesEqual(prefs, saved);

  const handleToggle = (key) => {
    setPrefs((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleReset = () => setPrefs(saved);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveNotificationPreferences(prefs);
      if (res.success) {
        toast.success(res.message || 'Notification preferences saved');
        await dispatch(fetchCurrentUserProfile({ force: true }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
        <Icon name="notifications" className="text-primary-container" />
        Notifications
      </h2>
      <p className="mb-4 text-sm text-secondary">Choose how you want to hear from FitSphere.</p>

      <div className="space-y-4">
        {NOTIFICATION_OPTIONS.map((option) => (
          <div
            key={option.key}
            className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <div className="flex min-w-0 items-start gap-3">
              <Icon name={option.icon} size={20} className="mt-0.5 shrink-0 text-primary-container" />
              <div>
                <p className="text-sm font-medium">{option.label}</p>
                <p className="mt-0.5 text-xs text-secondary">{option.description}</p>
              </div>
            </div>
            <ToggleSwitch
              id={`notify-${option.key}`}
              label={option.label}
              checked={Boolean(prefs[option.key])}
              onChange={() => handleToggle(option.key)}
              disabled={saving}
            />
          </div>
        ))}
      </div>

      {dirty ? (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="neon-glow inline-flex items-center gap-2 rounded-lg bg-primary-fixed px-5 py-2.5 text-sm font-semibold text-on-primary-fixed disabled:opacity-50"
          >
            {saving ? <Icon name="progress_activity" size={18} className="animate-spin" /> : null}
            Save changes
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-secondary hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </GlassCard>
  );
};

export default NotificationPreferencesCard;
