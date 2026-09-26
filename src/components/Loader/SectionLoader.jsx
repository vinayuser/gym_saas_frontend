/** Spinner that covers only this block, not the sidebar or the rest of the app. */
const SectionLoader = ({ show = false, children, className = '' }) => (
  <div className={`relative ${show ? 'min-h-32' : ''} ${className}`}>
    {children}
    {show ? (
      <div
        className="absolute inset-0 z-10 flex items-center justify-center bg-background/55"
        role="status"
        aria-live="polite"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-fixed/25 border-t-primary-fixed" />
      </div>
    ) : null}
  </div>
);

export default SectionLoader;
