import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import ChangePasswordModal from './ChangePasswordModal';
import TwoFactorModal from './TwoFactorModal';
import ActiveSessionsModal from './ActiveSessionsModal';
import NotificationPreferencesCard from './NotificationPreferencesCard';
import { fetchCurrentUserProfile } from '../../../store/slices/authSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { currentGym } = useSelector((s) => s.gym);
  const [activeModal, setActiveModal] = useState(null);

  const profileSections = [
    {
      title: 'Gym Profile',
      icon: 'location_on',
      fields: [
        { label: 'Gym Name', value: currentGym?.name || '—' },
        { label: 'Email', value: currentGym?.email || '—' },
        { label: 'Phone', value: currentGym?.phone || '—' },
        { label: 'City', value: currentGym?.city || '—' },
      ],
    },
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
