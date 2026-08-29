import GlassCard from '../../components/fitsphere/GlassCard';
import Icon from '../../components/fitsphere/Icon';
import AdminPageShell from '../../components/fitsphere/AdminPageShell';

const PlaceholderAdmin = ({ title, description, icon = 'construction' }) => (
  <AdminPageShell showSearch={false}>
    <GlassCard className="flex flex-col items-center px-8 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container/10">
        <Icon name={icon} size={36} className="text-primary-container" />
      </div>
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="mt-3 max-w-md text-secondary">{description}</p>
    </GlassCard>
  </AdminPageShell>
);

export default PlaceholderAdmin;
