const Switch = ({ on }) => (
  <span
    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
      on ? 'bg-primary-container' : 'bg-white/15'
    }`}
  >
    <span
      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
        on ? 'left-4' : 'left-0.5'
      }`}
    />
  </span>
);

const CHANNELS = [
  { key: 'banners', label: 'Banners' },
  { key: 'video', label: 'Video' },
  { key: 'audio', label: 'Audio' },
];

const AppAdToggles = ({ ads, disabled, savingKey, onToggle, compact = false, layout = 'stack' }) => {
  if (layout === 'row') {
    return (
      <div className="flex items-center gap-3">
        {CHANNELS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            disabled={disabled || savingKey === key}
            onClick={() => onToggle(key)}
            className="flex flex-col items-center gap-1 disabled:opacity-40"
          >
            <span className="text-[10px] font-medium leading-none text-secondary">{label}</span>
            <Switch on={Boolean(ads?.[key])} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={compact ? 'min-w-[132px] space-y-1.5' : 'space-y-3'}>
      {CHANNELS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          disabled={disabled || savingKey === key}
          onClick={() => onToggle(key)}
          className="flex w-full items-center justify-between gap-3 text-left disabled:opacity-40"
        >
          <span className={compact ? 'text-[11px] text-secondary' : 'text-sm text-on-surface'}>{label}</span>
          <Switch on={Boolean(ads?.[key])} />
        </button>
      ))}
    </div>
  );
};

export default AppAdToggles;
