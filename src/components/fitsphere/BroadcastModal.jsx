import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AppModal from './AppModal';
import Icon from './Icon';
import { createBroadcast, removeBroadcast } from '../../store/slices/broadcastSlice';

const BroadcastModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const current = useSelector((state) => state.broadcast.current);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const close = () => {
    setMessage('');
    onClose();
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) {
      toast.error('Enter a broadcast message');
      return;
    }
    setSaving(true);
    try {
      const result = await dispatch(createBroadcast(text));
      if (!result.error) {
        toast.success('Broadcast is live for every gym owner');
        close();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      const result = await dispatch(removeBroadcast());
      if (!result.error) toast.success('Broadcast removed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModal open={open} onClose={close} size="md">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-xl font-bold">Create Broadcast Message</h2>
        <button
          type="button"
          onClick={close}
          className="rounded-lg p-1 text-secondary hover:bg-white/10 hover:text-on-surface"
          aria-label="Close"
        >
          <Icon name="close" size={20} />
        </button>
      </div>

      {current?.message ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary">Live now</p>
          <p className="mt-1 text-sm text-on-surface">{current.message}</p>
          <button
            type="button"
            disabled={saving}
            onClick={handleRemove}
            className="mt-3 rounded-lg border border-error/30 px-3 py-1.5 text-xs font-semibold text-error hover:bg-error/10 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ) : null}

      <form onSubmit={handleBroadcast} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={280}
            placeholder="Enter your broadcast message here..."
            className="input-cyber min-h-[96px] resize-y"
            autoFocus
          />
          <p className="mt-1 text-right text-[11px] text-secondary/70">{message.length}/280</p>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-secondary hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !message.trim()}
            className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container disabled:opacity-50"
          >
            {saving ? 'Sending…' : 'Broadcast'}
          </button>
        </div>
      </form>
    </AppModal>
  );
};

export default BroadcastModal;
