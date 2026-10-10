import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { TableSelect } from './TableShell';
import { SUPPORT_STATUS_LABELS, getSupportCategory } from '../../constants/supportTopics';
import { formatDateTime } from '../../helpers/formatUtils';

const STATUS_CLASS = {
  OPEN: 'bg-amber-500/20 text-amber-300',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-300',
  RESOLVED: 'bg-emerald-500/20 text-emerald-300',
  CLOSED: 'bg-slate-500/20 text-slate-300',
};

const SupportTicketChat = ({
  ticket,
  loading = false,
  canManageStatus = false,
  onSend,
  onStatusChange,
  sending = false,
}) => {
  const [draft, setDraft] = useState('');
  const scroller = useRef(null);
  const messages = ticket?.messages || [];
  const closed = ticket?.status === 'CLOSED' && !canManageStatus;

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, ticket?.id]);

  if (!ticket && !loading) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-white/10 bg-surface-container px-6 text-center text-sm text-secondary">
        Select a ticket to open the conversation.
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    onSend?.(text);
    setDraft('');
  };

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-xl border border-white/10 bg-surface-container">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold">{ticket?.subject || 'Loading…'}</p>
          <p className="mt-0.5 truncate text-xs text-secondary">
            {[
              getSupportCategory(ticket?.category)?.label || ticket?.category,
              ticket?.tenant?.name,
              ticket?.senderName || ticket?.user?.name,
              ticket?.senderEmail,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canManageStatus && ticket ? (
            <TableSelect value={ticket.status} onChange={onStatusChange}>
              {Object.entries(SUPPORT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </TableSelect>
          ) : ticket ? (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                STATUS_CLASS[ticket.status] || 'bg-white/10 text-secondary'
              }`}
            >
              {SUPPORT_STATUS_LABELS[ticket.status] || ticket.status}
            </span>
          ) : null}
        </div>
      </div>

      <div ref={scroller} className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading && messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-secondary">Loading conversation…</p>
        ) : (
          messages.map((item) => {
            const adminBubble = item.authorRole === 'ADMIN';
            const mine = canManageStatus ? adminBubble : !adminBubble;
            return (
              <div key={item.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                    adminBubble
                      ? 'bg-primary-fixed text-on-primary-fixed'
                      : 'bg-surface-container-high text-on-surface'
                  }`}
                >
                  <p className={`text-[10px] font-semibold ${adminBubble ? 'text-on-primary-fixed/80' : 'text-primary-container'}`}>
                    {adminBubble ? item.authorName || 'FitSphere support' : item.authorName || 'Gym owner'}
                  </p>
                  <p className="whitespace-pre-wrap text-sm">{item.body}</p>
                  <p className={`mt-1 text-[10px] ${adminBubble ? 'text-on-primary-fixed/70' : 'text-secondary'}`}>
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={submit} className="border-t border-white/5 p-3">
        {closed ? (
          <p className="px-1 py-2 text-sm text-secondary">This ticket is closed. Open a new request if you still need help.</p>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder={canManageStatus ? 'Reply to the gym owner…' : 'Reply to support…'}
              className="input-cyber min-h-[44px] flex-1 resize-none rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-primary-fixed px-3 text-sm font-bold text-on-primary-fixed disabled:opacity-50"
            >
              <Icon name="send" size={16} />
              {sending ? 'Sending' : 'Send'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SupportTicketChat;
