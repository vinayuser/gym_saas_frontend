import GlassCard from '../../components/fitsphere/GlassCard';
import Icon from '../../components/fitsphere/Icon';
import OwnerPageShell from '../../components/fitsphere/OwnerPageShell';

const PlaceholderPage = ({ title, description, icon = 'construction' }) => (
  <OwnerPageShell title={title} showSearch={false}>
    <GlassCard className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed/10">
        <Icon name={icon} size={36} className="text-primary-fixed" />
      </div>
      <h1 className="font-display text-2xl font-bold text-on-surface">{title}</h1>
      <p className="mt-3 max-w-md text-secondary">
        {description ||
          'This module is part of your FitSphere Pro plan. Backend integration is coming in the next phase.'}
      </p>
      <span className="mt-6 rounded-full border border-primary-fixed/30 bg-primary-fixed/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-fixed">
        Coming soon
      </span>
    </GlassCard>
  </OwnerPageShell>
);

export default PlaceholderPage;
