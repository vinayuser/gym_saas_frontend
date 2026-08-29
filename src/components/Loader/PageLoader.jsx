import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const FADE_MS = 280;

const PageLoader = ({ show = true, message = 'Loading...', children }) => {
  const [mounted, setMounted] = useState(show);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = setTimeout(() => setMounted(false), FADE_MS);
    return () => clearTimeout(timer);
  }, [show]);

  useEffect(() => {
    if (!mounted) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  const overlay =
    mounted &&
    createPortal(
      <div
        className={`fixed inset-0 z-[300] flex items-center justify-center transition-opacity duration-300 ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[3px]" />
        <div className="relative z-10 flex flex-col items-center gap-4 rounded-2xl px-8 py-6">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-primary-fixed/25 border-t-primary-fixed" />
          <p className="text-sm font-medium tracking-wide text-secondary">{message}</p>
        </div>
      </div>,
      document.body
    );

  if (children !== undefined) {
    return (
      <>
        {children}
        {overlay}
      </>
    );
  }

  return overlay;
};

export default PageLoader;
