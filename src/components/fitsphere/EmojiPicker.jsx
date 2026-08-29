import { useEffect, useRef } from 'react';

const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😊', '😍', '🥳', '💪', '🔥', '👏',
  '🎉', '✅', '⭐', '❤️', '👍', '🙏', '😎', '🤝', '💯', '🏋️',
  '🏃', '🥇', '🎯', '⚡', '🍎', '💧', '😅', '😤', '🤩', '😇',
  '👋', '🙌', '💬', '📸', '🎬', '📌', '🚀', '✨', '🙂', '😢',
];

const EmojiPicker = ({ open, onClose, onSelect }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border border-white/10 bg-surface-container-high p-3 shadow-xl"
    >
      <p className="mb-2 text-xs font-semibold uppercase text-secondary">Emoji</p>
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="rounded-lg p-1.5 text-lg hover:bg-white/10"
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
