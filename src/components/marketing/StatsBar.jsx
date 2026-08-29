const StatsBar = ({ stats, className = '' }) => (
  <div
    className={`mx-auto grid max-w-6xl gap-6 border-y border-white/10 py-10 sm:grid-cols-2 lg:grid-cols-4 ${className}`}
  >
    {stats.map((s) => (
      <div key={s.label} className="text-center lg:text-left">
        <p className="font-display text-3xl font-bold text-primary-container md:text-4xl">{s.value}</p>
        <p className="mt-1 text-sm font-semibold text-on-surface">{s.label}</p>
        {s.sub && <p className="mt-0.5 text-xs text-secondary">{s.sub}</p>}
      </div>
    ))}
  </div>
);

export default StatsBar;
