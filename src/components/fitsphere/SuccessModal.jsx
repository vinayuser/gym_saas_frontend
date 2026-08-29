import Icon from './Icon';
import AppModal from './AppModal';

const SuccessModal = ({
  open,
  onClose,
  title,
  message,
  actionLabel = 'Continue',
  onAction,
  icon = 'check_circle',
}) => (
  <AppModal open={open} onClose={onClose} size="md" panelClassName="!p-0">
    <div className="p-8 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed/20">
        <Icon name={icon} size={48} className="text-primary-fixed" />
      </div>
      <h2 className="font-display text-2xl font-bold text-on-surface">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-secondary">{message}</p>
      <button
        type="button"
        onClick={onAction || onClose}
        className="neon-glow mt-8 w-full rounded-lg bg-neon py-3 font-bold text-on-primary-fixed transition-transform hover:scale-[1.02] active:scale-95"
      >
        {actionLabel}
      </button>
    </div>
  </AppModal>
);

export default SuccessModal;
