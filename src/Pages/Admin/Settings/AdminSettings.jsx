import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import ChangePasswordModal from '../../Owner/Settings/ChangePasswordModal';
import TwoFactorModal from '../../Owner/Settings/TwoFactorModal';
import ActiveSessionsModal from '../../Owner/Settings/ActiveSessionsModal';
import NotificationPreferencesCard from '../../Owner/Settings/NotificationPreferencesCard';
import { fetchCurrentUserProfile } from '../../../store/slices/authSlice';

const PLATFORM_LINKS = [
  {
    to: '/admin/invites',
    icon: 'mail',
    title: 'Gym invites',
    description: 'Create and manage owner onboarding invites',
  },
  {
    to: '/admin/gym-owners',
    icon: 'groups',
    title: 'Gym owners',
    description: 'Activate or suspend onboarded tenants',
  },
  {
    to: '/admin/plans',
    icon: 'workspace_premium',
    title: 'SaaS plans',
    description: 'Pricing and gym limits for subscription tiers',
  },
  {
    to: '/admin/transactions',
    icon: 'payments',
    title: 'Transactions',
    description: 'Review SaaS payment history',
  },
  {
    to: '/admin/support',
    icon: 'support_agent',
    title: 'Support',
    description: 'Handle platform support tickets',
  },
  {
    to: '/admin/tenants',
    icon: 'domain',
    title: 'Tenants',
    description: 'Browse onboarded gym businesses',
  },
];

const ADMIN_NOTIFICATION_OPTIONS = [
  {
    key: 'emailAlerts',
    label: 'Email alerts',
    description: 'Invite activity, payments, and critical platform events',
    icon: 'mail',
  },
  {
    key: 'smsReminders',
    label: 'SMS alerts',
    description: 'Urgent account and billing notifications via text',
    icon: 'sms',
  },
  {
    key: 'pushNotifications',
    label: 'Push notifications',
    description: 'Real-time browser alerts while you are signed in',
    icon: 'notifications_active',
  },
  {
    key: 'weeklyDigest',
    label: 'Weekly digest',
    description: 'Summary of invites, owners, and revenue every Monday',
    icon: 'calendar_month',
  },
];

const AdminSettings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [activeModal, setActiveModal] = useState(null);

  const fullName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—'
    : '—';

  const securityActions = [
    {
      id: 'password',
      label: 'Change password',
      description: 'Update your super admin sign-in password',
      icon: 'key',
    },
    {
      id: 'twoFactor',
      label: 'Two-factor authentication',
      description: user?.twoFactorEnabled
        ? 'Enabled — manage authenticator app'
        : 'Add an extra sign-in step for this account',
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
    <>
      <AdminPageShell showSearch={false}>
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Settings</h1>
            <p className="mt-1 text-secondary/70">
              Manage your super admin account, security, and platform shortcuts.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Icon name="admin_panel_settings" className="text-primary-container" />
                Super admin account
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Name', value: fullName },
                  { label: 'Email', value: user?.email || '—' },
                  { label: 'Role', value: user?.role || 'SUPER_ADMIN' },
                ].map((f) => (
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

            <NotificationPreferencesCard
              title="Notifications"
              description="Choose how you want to hear about platform activity."
              options={ADMIN_NOTIFICATION_OPTIONS}
            />

            <GlassCard className="p-6">
              <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
                <Icon name="hub" className="text-primary-container" />
                Platform
              </h2>
              <p className="mb-4 text-sm text-secondary">
                Jump to core super admin tools. Email templates and global branding config will be
                added here later.
              </p>
              <div className="space-y-2">
                {PLATFORM_LINKS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 rounded-lg border border-white/10 px-4 py-3 hover:bg-white/5"
                  >
                    <Icon name={item.icon} className="text-primary-container" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{item.title}</span>
                      <span className="mt-0.5 block text-xs text-secondary">{item.description}</span>
                    </span>
                    <Icon name="chevron_right" size={20} className="shrink-0 text-secondary" />
                  </Link>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </AdminPageShell>

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
    </>
  );
};

export default AdminSettings;
