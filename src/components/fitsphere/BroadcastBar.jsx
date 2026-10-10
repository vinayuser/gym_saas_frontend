import Icon from './Icon';

const BroadcastBar = ({ message, onRemove, removing = false }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-3 border-b border-primary-container/30 bg-surface-container-high px-4 py-2 md:px-8">
      <Icon name="campaign" size={18} className="shrink-0 text-primary-container" />
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-on-surface">{message}</p>
      {onRemove ? (
        <button
          type="button"
          disabled={removing}
          onClick={onRemove}
          className="shrink-0 rounded-lg border border-error/30 px-3 py-1 text-xs font-semibold text-error hover:bg-error/10 disabled:opacity-50"
        >
          {removing ? 'Removing…' : 'Remove'}
        </button>
      ) : null}
    </div>
  );
};

export default BroadcastBar;
