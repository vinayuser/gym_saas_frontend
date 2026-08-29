import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, postRequest, patchRequest, deleteRequest } from '../../../config/dataApi';
import { uploadMediaFile } from '../../../helpers/mediaUpload';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import EmojiPicker from '../../../components/fitsphere/EmojiPicker';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import PageLoader from '../../../components/Loader/PageLoader';
import { ROLES } from '../../../constants';
import { formatDateTime } from '../../../helpers/formatUtils';

const ROLE_LABELS = {
  GYM_OWNER: 'Gym Owner',
  MANAGER: 'Manager',
  TRAINER: 'Trainer',
  RECEPTIONIST: 'Front Desk',
  SUPER_ADMIN: 'Admin',
};

const canModerate = (role) => role === ROLES.GYM_OWNER || role === ROLES.SUPER_ADMIN;

const ChatMessage = ({
  message,
  isOwner,
  onEdit,
  onDelete,
  onPin,
}) => {
  const showActions = isOwner || message.isOwn;

  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`group relative max-w-[85%] rounded-2xl px-4 py-2 ${
          message.isOwn ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high'
        } ${message.isPinned ? 'ring-2 ring-primary-container/50' : ''}`}
      >
        {message.isPinned && (
          <div className={`mb-1 flex items-center gap-1 text-[10px] font-semibold ${message.isOwn ? 'text-on-primary-container/80' : 'text-primary-container'}`}>
            <Icon name="push_pin" size={12} />
            Pinned{message.pinnedBy?.name ? ` by ${message.pinnedBy.name}` : ''}
          </div>
        )}

        {!message.isOwn && message.sender && (
          <p className="text-xs font-bold text-primary-container">
            {message.sender.name}
            {message.sender.role && (
              <span className="ml-1 font-normal text-secondary">
                · {ROLE_LABELS[message.sender.role] || message.sender.role}
              </span>
            )}
          </p>
        )}

        {message.mediaUrl && message.mediaType === 'IMAGE' && (
          <a href={message.mediaUrl} target="_blank" rel="noreferrer" className="mb-2 block">
            <img src={message.mediaUrl} alt="" className="max-h-64 rounded-lg object-cover" />
          </a>
        )}

        {message.mediaUrl && message.mediaType === 'VIDEO' && (
          <video src={message.mediaUrl} controls className="mb-2 max-h-64 w-full rounded-lg bg-black" />
        )}

        {message.content && <p className="whitespace-pre-wrap text-sm">{message.content}</p>}

        <p className={`mt-1 text-[10px] ${message.isOwn ? 'text-on-primary-container/70' : 'text-secondary'}`}>
          {formatDateTime(message.createdAt)}
          {message.editedAt && ' · edited'}
        </p>

        {showActions && (
          <div className={`absolute -top-3 ${message.isOwn ? 'left-0' : 'right-0'} hidden gap-1 group-hover:flex`}>
            {isOwner && (
              <button
                type="button"
                title={message.isPinned ? 'Unpin' : 'Pin message'}
                onClick={() => onPin(message)}
                className="rounded-lg bg-surface-container-high p-1.5 shadow hover:bg-white/10"
              >
                <Icon name="push_pin" size={14} />
              </button>
            )}
            {(message.isOwn || isOwner) && message.content && (
              <button
                type="button"
                title="Edit message"
                onClick={() => onEdit(message)}
                className="rounded-lg bg-surface-container-high p-1.5 shadow hover:bg-white/10"
              >
                <Icon name="edit" size={14} />
              </button>
            )}
            <button
              type="button"
              title="Delete message"
              onClick={() => onDelete(message)}
              className="rounded-lg bg-surface-container-high p-1.5 text-error shadow hover:bg-error/10"
            >
              <Icon name="delete" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CommunityChat = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const { user } = useSelector((s) => s.auth);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const scrollRef = useRef(null);
  const mediaInputRef = useRef(null);
  const isOwner = canModerate(user?.role);

  const loadMessages = useCallback(async () => {
    if (!currentGym?.id) return;
    try {
      const res = await getRequest(ENDPOINTS.CHAT.MESSAGES(currentGym.id), { params: { limit: 200 } });
      setMessages(res.data?.messages || []);
    } finally {
      setLoading(false);
    }
  }, [currentGym?.id]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 8000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const sendMessage = async (payload) => {
    if (!currentGym?.id) return;
    setSending(true);
    try {
      await postRequest(ENDPOINTS.CHAT.MESSAGES(currentGym.id), payload);
      setText('');
      await loadMessages();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
      throw err;
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    await sendMessage({ content });
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !currentGym?.id) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      toast.error('Only images and videos are allowed');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File must be 25MB or smaller');
      return;
    }

    setUploadingMedia(true);
    try {
      const asset = await uploadMediaFile(file, {
        folder: 'gym-chat',
        resourceType: isVideo ? 'video' : 'image',
      });
      await sendMessage({
        content: text.trim() || null,
        mediaUrl: asset.url,
        mediaType: isVideo ? 'VIDEO' : 'IMAGE',
      });
      setText('');
    } catch {
      /* uploadMediaFile / sendMessage already toast */
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleEdit = async (message) => {
    const next = window.prompt('Edit message', message.content || '');
    if (next === null || !next.trim()) return;
    try {
      await patchRequest(ENDPOINTS.CHAT.MESSAGE(currentGym.id, message.id), { content: next.trim() });
      toast.success('Message updated');
      loadMessages();
    } catch {
      toast.error('Could not edit message');
    }
  };

  const handleDelete = async (message) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteRequest(ENDPOINTS.CHAT.MESSAGE(currentGym.id, message.id));
      toast.success('Message deleted');
      loadMessages();
    } catch {
      toast.error('Could not delete message');
    }
  };

  const handlePin = async (message) => {
    try {
      await patchRequest(ENDPOINTS.CHAT.PIN(currentGym.id, message.id), {
        isPinned: !message.isPinned,
      });
      toast.success(message.isPinned ? 'Message unpinned' : 'Message pinned');
      loadMessages();
    } catch {
      toast.error('Only the gym owner can pin messages');
    }
  };

  const pinned = messages.filter((m) => m.isPinned);
  const regular = messages.filter((m) => !m.isPinned);

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch to open community chat.</GlassCard>
      </OwnerPageShell>
    );
  }

  return (
    <PageLoader show={loading} message="Loading chat...">
      <OwnerPageShell showSearch={false} className="!p-0">
        <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-white/10">
          <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container/20">
              <Icon name="forum" className="text-primary-container" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold">{currentGym.name} Community</h1>
              <p className="text-xs text-secondary">Single gym chat · members & staff</p>
            </div>
          </div>

          <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <GlassCard className="p-8 text-center text-secondary">
                No messages yet. Start the conversation for your gym community.
              </GlassCard>
            ) : (
              <>
                {pinned.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase text-secondary">Pinned</p>
                    {pinned.map((m) => (
                      <ChatMessage
                        key={m.id}
                        message={m}
                        isOwner={isOwner}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onPin={handlePin}
                      />
                    ))}
                  </div>
                )}
                {regular.map((m) => (
                  <ChatMessage
                    key={m.id}
                    message={m}
                    isOwner={isOwner}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPin={handlePin}
                  />
                ))}
              </>
            )}
          </div>

          <form onSubmit={handleSend} className="border-t border-white/5 p-4">
            <div className="relative flex items-end gap-2 rounded-xl border border-white/10 bg-surface-container-lowest px-3 py-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setEmojiOpen((o) => !o)}
                  className="rounded-lg p-2 text-secondary hover:bg-white/5 hover:text-on-surface"
                  aria-label="Add emoji"
                >
                  <Icon name="mood" size={22} />
                </button>
                <EmojiPicker
                  open={emojiOpen}
                  onClose={() => setEmojiOpen(false)}
                  onSelect={(emoji) => setText((t) => t + emoji)}
                />
              </div>

              <button
                type="button"
                disabled={uploadingMedia || sending}
                onClick={() => mediaInputRef.current?.click()}
                className="rounded-lg p-2 text-secondary hover:bg-white/5 hover:text-on-surface disabled:opacity-50"
                aria-label="Attach image or video"
              >
                <Icon name={uploadingMedia ? 'hourglass_empty' : 'perm_media'} size={22} />
              </button>
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={handleMediaUpload}
              />

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                rows={1}
                placeholder="Message the gym community..."
                className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-sm outline-none"
              />

              <button
                type="submit"
                disabled={sending || uploadingMedia || !text.trim()}
                className="rounded-lg bg-primary-container p-2 text-on-primary-container disabled:opacity-50"
                aria-label="Send message"
              >
                <Icon name="send" size={20} />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-secondary">
              {isOwner
                ? 'As gym owner you can pin, edit, and delete any message.'
                : 'Press Enter to send · Shift+Enter for new line'}
            </p>
          </form>
        </div>
      </OwnerPageShell>
    </PageLoader>
  );
};

export default CommunityChat;
