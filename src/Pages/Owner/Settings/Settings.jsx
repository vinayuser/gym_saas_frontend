import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import ChangePasswordModal from './ChangePasswordModal';
import TwoFactorModal from './TwoFactorModal';
import ActiveSessionsModal from './ActiveSessionsModal';
import NotificationPreferencesCard from './NotificationPreferencesCard';
import { fetchCurrentUserProfile } from '../../../store/slices/authSlice';
import { updateGym } from '../../../store/slices/gymSlice';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, postRequest } from '../../../config/dataApi';
import { toast } from 'react-toastify';
import { formatDateTime } from '../../../helpers/formatUtils';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { currentGym } = useSelector((s) => s.gym);
  const [activeModal, setActiveModal] = useState(null);
  const [gymForm, setGymForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    gstNumber: '',
    taxRate: '18',
    reminderDays: '7, 3, 1',
    inactiveAfterDays: '7',
  });
  const [savingGym, setSavingGym] = useState(false);
  const [runningReminders, setRunningReminders] = useState(false);
  const [messages, setMessages] = useState([]);

  const loadMessages = () => {
    if (!currentGym?.id) return;
    getRequest(ENDPOINTS.FINANCE.REMINDERS(currentGym.id), { params: { limit: 8 } }).then((res) =>
      setMessages(res.data || [])
    );
  };

  useEffect(() => {
    setGymForm({
      name: currentGym?.name || '',
      email: currentGym?.email || '',
      phone: currentGym?.phone || '',
      city: currentGym?.city || '',
      gstNumber: currentGym?.gstNumber || '',
      taxRate: String(currentGym?.taxRate ?? 18),
      reminderDays: (currentGym?.reminderDays || [7, 3, 1]).join(', '),
      inactiveAfterDays: String(currentGym?.inactiveAfterDays || 7),
    });
    loadMessages();
  }, [currentGym]);

  const saveGym = async (e) => {
    e.preventDefault();
    if (!currentGym?.id) return;
    setSavingGym(true);
    await dispatch(
      updateGym({
        gymId: currentGym.id,
        data: {
          name: gymForm.name,
          email: gymForm.email || undefined,
          phone: gymForm.phone || undefined,
          city: gymForm.city || undefined,
          gstNumber: gymForm.gstNumber.trim(),
          taxRate: gymForm.gstNumber.trim() ? Number(gymForm.taxRate) || 18 : 0,
          reminderDays: gymForm.reminderDays
            .split(',')
            .map((n) => Number(n.trim()))
            .filter((n) => n > 0),
          inactiveAfterDays: Number(gymForm.inactiveAfterDays) || 7,
        },
      })
    );
    setSavingGym(false);
  };

  const profileSections = [
    {
      title: 'Account',
      icon: 'person',
      fields: [
        { label: 'Name', value: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '—' },
        { label: 'Email', value: user?.email || '—' },
        { label: 'Role', value: user?.role || '—' },
      ],
    },
  ];

  const securityActions = [
    {
      id: 'password',
      label: 'Change password',
      description: 'Update your sign-in password',
      icon: 'key',
    },
    {
      id: 'twoFactor',
      label: 'Two-factor authentication',
      description: user?.twoFactorEnabled ? 'Enabled — manage authenticator app' : 'Add an extra sign-in step',
      icon: 'shield',
      badge: user?.twoFactorEnabled ? 'On' : 'Off',
    },
    {
      id: 'sessions',
      label: 'Active sessions',
      description: 'Review and sign out other devices',
      icon: 'devices',
    },
  ];

  return (
    <OwnerPageShell showSearch={false}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Settings</h1>
          <p className="mt-1 text-secondary/70">Manage your gym, account, and preferences.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Icon name="location_on" className="text-primary-container" />
              Gym Profile
            </h2>
            <form onSubmit={saveGym} className="space-y-3">
              {['name', 'email', 'phone', 'city', 'gstNumber'].map((key) => (
                <div key={key}>
                  <label className="text-xs font-semibold uppercase text-secondary">
                    {key === 'gstNumber' ? 'GSTIN' : key}
                  </label>
                  <input
                    value={gymForm[key]}
                    onChange={(e) => setGymForm({ ...gymForm, [key]: e.target.value })}
                    className="input-cyber mt-1 w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold uppercase text-secondary">GST rate %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gymForm.taxRate}
                  onChange={(e) => setGymForm({ ...gymForm, taxRate: e.target.value })}
                  className="input-cyber mt-1 w-full rounded-lg px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-secondary">Used on tax invoices when GSTIN is set. Plan prices are treated as tax-inclusive.</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-secondary">Renewal reminder days</label>
                <input
                  value={gymForm.reminderDays}
                  onChange={(e) => setGymForm({ ...gymForm, reminderDays: e.target.value })}
                  className="input-cyber mt-1 w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-secondary">Inactive after (days)</label>
                <input
                  type="number"
                  min="1"
                  value={gymForm.inactiveAfterDays}
                  onChange={(e) => setGymForm({ ...gymForm, inactiveAfterDays: e.target.value })}
                  className="input-cyber mt-1 w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={savingGym || !currentGym}
                  className="rounded-lg bg-primary-fixed px-4 py-2 text-sm font-bold text-on-primary-fixed disabled:opacity-50"
                >
                  {savingGym ? 'Saving…' : 'Save gym'}
                </button>
                <button
                  type="button"
                  disabled={runningReminders || !currentGym}
                  onClick={async () => {
                    setRunningReminders(true);
                    try {
                      const res = await postRequest(ENDPOINTS.FINANCE.REMINDERS_RUN(currentGym.id), {});
                      toast.success(`Reminders sent: ${res.data?.sent || 0}`);
                      loadMessages();
                    } finally {
                      setRunningReminders(false);
                    }
                  }}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold"
                >
                  {runningReminders ? 'Sending…' : 'Send reminders now'}
                </button>
              </div>
            </form>
            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="mb-3 text-sm font-semibold">Recent reminders</h3>
              {messages.length === 0 ? (
                <p className="text-xs text-secondary">No WhatsApp, SMS, or email reminders logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className="rounded-lg border border-white/5 px-3 py-2 text-xs">
                      <p className="font-medium">
                        {msg.type} · {msg.channel} · {msg.status}
                      </p>
                      <p className="mt-0.5 text-secondary">
                        {msg.member ? `${msg.member.firstName} ${msg.member.lastName}` : msg.to || '—'} ·{' '}
                        {formatDateTime(msg.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
          {profileSections.map((sec) => (
            <GlassCard key={sec.title} className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Icon name={sec.icon} className="text-primary-container" />
                {sec.title}
              </h2>
              <div className="space-y-3">
                {sec.fields.map((f) => (
                  <div key={f.label}>
                    <label className="text-xs font-semibold uppercase text-secondary">{f.label}</label>
                    <input
                      readOnly
                      value={f.value}
                      className="input-cyber mt-1 w-full rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}

          <NotificationPreferencesCard />

          <GlassCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Icon name="lock" className="text-primary-container" />
              Security
            </h2>
            <div className="space-y-2">
              {securityActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => setActiveModal(action.id)}
                  className="flex w-full items-center gap-3 rounded-lg border border-white/10 px-4 py-3 text-left hover:bg-white/5"
                >
                  <Icon name={action.icon} className="text-primary-container" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {action.label}
                      {action.badge ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            action.badge === 'On'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-white/10 text-secondary'
                          }`}
                        >
                          {action.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-secondary">{action.description}</span>
                  </span>
                  <Icon name="chevron_right" size={20} className="shrink-0 text-secondary" />
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {activeModal === 'password' ? (
        <ChangePasswordModal open onClose={() => setActiveModal(null)} />
      ) : null}
      {activeModal === 'twoFactor' ? (
        <TwoFactorModal
          open
          onClose={() => {
            setActiveModal(null);
            dispatch(fetchCurrentUserProfile({ force: true }));
          }}
          initialEnabled={Boolean(user?.twoFactorEnabled)}
        />
      ) : null}
      {activeModal === 'sessions' ? (
        <ActiveSessionsModal open onClose={() => setActiveModal(null)} />
      ) : null}
    </OwnerPageShell>
  );
};

export default Settings;
