const GlassCard = ({ children, className = '', hover = true }) => (
  <div className={`glass-card rounded-xl ${hover ? 'transition-all duration-200' : ''} ${className}`}>
    {children}
  </div>
);

export default GlassCard;
