import GlassCard from './GlassCard';
import Icon from './Icon';

const StatCard = ({ label, value, icon, accent = false, sub }) => (
  <GlassCard className="flex items-center justify-between p-6">
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">{label}</p>
      <h3
        className={`mt-1 font-display text-3xl font-bold md:text-4xl ${
          accent ? 'text-primary-container' : 'text-on-surface'
        }`}
      >
        {value}
      </h3>
      {sub && <p className="mt-1 text-xs text-secondary/60">{sub}</p>}
    </div>
    {icon && (
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          accent ? 'bg-primary-container/10 text-primary-container' : 'bg-white/5 text-on-surface'
        }`}
      >
        <Icon name={icon} />
      </div>
    )}
  </GlassCard>
);

export default StatCard;
