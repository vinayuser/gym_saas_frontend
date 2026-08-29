import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AppModal from '../../../components/fitsphere/AppModal';
import Icon from '../../../components/fitsphere/Icon';
import {
  fetchSessions,
  formatSessionTime,
  parseUserAgent,
  revokeOtherSessions,
  revokeSession,
} from '../../../helpers/securityApi';

const ActiveSessionsModal = ({ open, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await fetchSessions();
      if (res.success) {
        setSessions(res.data.sessions || []);
      }
    } catch {
      // handled by API
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleRevoke = async (sessionId) => {
    setActionId(sessionId);
    try {
      const res = await revokeSession(sessionId);
      if (res.success) {
        toast.success('Session signed out');
        await loadSessions();
      }
    } catch {
      // handled by API
    } finally {
      setActionId(null);
    }
  };

  const handleRevokeOthers = async () => {
    setActionId('others');
    try {
      const res = await revokeOtherSessions();
      if (res.success) {
        toast.success('Other sessions signed out');
        await loadSessions();
      }
    } catch {
      // handled by API
    } finally {
      setActionId(null);
    }
  };

  const otherCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <AppModal open={open} onClose={onClose} size="lg" scrollable>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Active sessions</h2>
          <p className="mt-1 text-sm text-secondary">
            Devices where your account is currently signed in.
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-secondary hover:text-on-surface">
          <Icon name="close" size={22} />
        </button>
      </div>

      {otherCount > 0 ? (
        <button
          type="button"
          onClick={handleRevokeOthers}
          disabled={actionId === 'others'}
          className="mb-4 w-full rounded-lg border border-white/10 py-2.5 text-sm font-medium hover:bg-white/5 disabled:opacity-50"
        >
          {actionId === 'others' ? 'Signing out…' : `Sign out all other sessions (${otherCount})`}
        </button>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <Icon name="progress_activity" size={28} className="animate-spin text-primary-fixed" />
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-secondary">No active sessions found.</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Icon name="devices" size={18} className="text-primary-container" />
                    <p className="font-medium">{parseUserAgent(session.userAgent)}</p>
                    {session.isCurrent ? (
                      <span className="rounded-full bg-primary-fixed/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-fixed">
                        This device
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-secondary">
                    {session.ipAddress ? `IP ${session.ipAddress} · ` : ''}
                    Signed in {formatSessionTime(session.createdAt)}
                  </p>
                  {session.lastUsedAt ? (
                    <p className="text-xs text-secondary/70">
                      Last active {formatSessionTime(session.lastUsedAt)}
                    </p>
                  ) : null}
                </div>
                {!session.isCurrent ? (
                  <button
                    type="button"
                    onClick={() => handleRevoke(session.id)}
                    disabled={actionId === session.id}
                    className="shrink-0 text-xs font-semibold text-error hover:underline disabled:opacity-50"
                  >
                    Sign out
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      )}
    </AppModal>
  );
};

export default ActiveSessionsModal;
