const MarketingSectionHeader = ({ eyebrow, title, subtitle, center = true, className = '' }) => (
  <div className={`${center ? 'text-center' : ''} ${className}`}>
    {eyebrow && (
      <span
        className={`mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-primary-container ${
          center ? '' : 'block'
        }`}
      >
        {eyebrow}
      </span>
    )}
    <h2 className="font-display text-3xl font-bold md:text-4xl">{title}</h2>
    {subtitle && (
      <p className={`mt-3 text-secondary ${center ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>{subtitle}</p>
    )}
  </div>
);

export default MarketingSectionHeader;
