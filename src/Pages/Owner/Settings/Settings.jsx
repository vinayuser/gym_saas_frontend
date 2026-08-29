import { useSelector } from 'react-redux';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';

const Settings = () => {
  const { user } = useSelector((s) => s.auth);
  const { currentGym } = useSelector((s) => s.gym);

  const sections = [
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
    {
      title: 'Notifications',
      icon: 'notifications',
      toggles: ['Email alerts', 'SMS reminders', 'Push notifications', 'Weekly digest'],
    },
    {
      title: 'Security',
      icon: 'lock',
      actions: ['Change password', 'Two-factor authentication', 'Active sessions'],
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
          {sections.map((sec) => (
            <GlassCard key={sec.title} className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Icon name={sec.icon} className="text-primary-container" />
                {sec.title}
              </h2>
              {sec.fields && (
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
              )}
              {sec.toggles && (
                <div className="space-y-3">
                  {sec.toggles.map((t) => (
                    <label key={t} className="flex items-center justify-between">
                      <span className="text-sm">{t}</span>
                      <input type="checkbox" defaultChecked className="rounded text-primary-container" />
                    </label>
                  ))}
                </div>
              )}
              {sec.actions && (
                <div className="space-y-2">
                  {sec.actions.map((a) => (
                    <button
                      key={a}
                      type="button"
                      className="w-full rounded-lg border border-white/10 py-2.5 text-left px-4 text-sm hover:bg-white/5"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </OwnerPageShell>
  );
};

export default Settings;
