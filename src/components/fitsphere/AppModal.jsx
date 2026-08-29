import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import GlassCard from './GlassCard';

const SIZES = {
  sm: 'w-[min(100%,24rem)]',
  md: 'w-[min(100%,28rem)]',
  lg: 'w-[min(100%,32rem)]',
  xl: 'w-[min(100%,40rem)]',
  '2xl': 'w-[min(100%,56rem)]',
};

/**
 * Portal-based modal — always renders on document.body so width is never
 * constrained by sidebar / flex parent layouts.
 */
const AppModal = ({
  open,
  onClose,
  children,
  size = 'md',
  panelClassName = '',
  scrollable = false,
  zIndex = 200,
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <GlassCard
        className={`relative z-10 shrink-0 rounded-2xl p-6 ${SIZES[size]} ${
          scrollable ? 'max-h-[90vh] overflow-y-auto' : ''
        } ${panelClassName}`}
        hover={false}
      >
        {children}
      </GlassCard>
    </div>,
    document.body
  );
};

export default AppModal;
