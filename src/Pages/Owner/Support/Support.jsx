import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import AppModal from '../../../components/fitsphere/AppModal';
import SupportTicketForm from '../../../components/fitsphere/SupportTicketForm';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  tableRowNumber,
} from '../../../components/fitsphere/TableShell';
import SupportTicketChat from '../../../components/fitsphere/SupportTicketChat';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, postRequest } from '../../../config/dataApi';
import { SUPPORT_STATUS_LABELS, getSupportCategory } from '../../../constants/supportTopics';
import { formatDate } from '../../../helpers/formatUtils';
import useDebouncedValue from '../../../hooks/useDebouncedValue';

const STATUS_CLASS = {
  OPEN: 'bg-amber-500/20 text-amber-300',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-300',
  RESOLVED: 'bg-emerald-500/20 text-emerald-300',
  CLOSED: 'bg-slate-500/20 text-slate-300',
};

const Support = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 350);
  const limit = 10;

  const formDefaults = useMemo(() => {
    const fromState = location.state || {};
    return {
      category: fromState.category || searchParams.get('category') || 'GENERAL',
      subject: fromState.subject || searchParams.get('subject') || '',
      message: fromState.message || searchParams.get('message') || '',
    };
  }, [location.state, searchParams]);

  useEffect(() => {
    if (formDefaults.subject || searchParams.get('category') || location.state?.category) {
      setCreateOpen(true);
    }
  }, [formDefaults.subject, searchParams, location.state]);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRequest(ENDPOINTS.SUPPORT.TICKETS, {
        params: { page, limit, search: debouncedSearch || undefined },
      });
      const next = res.data?.tickets || [];
      setTickets(next);
      setPagination(res.data?.pagination || { total: 0 });
      setSelectedId((id) => (id && next.some((ticket) => ticket.id === id) ? id : null));
    } catch {
      setTickets([]);
      setPagination({ total: 0 });
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!selectedId) {
      setConversation(null);
      return undefined;
    }
    let cancelled = false;
    setChatLoading(true);
    getRequest(ENDPOINTS.SUPPORT.BY_ID(selectedId))
      .then((res) => {
        if (!cancelled) setConversation(res.data?.ticket || null);
      })
      .catch(() => {
        if (!cancelled) setConversation(null);
      })
      .finally(() => {
        if (!cancelled) setChatLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleSend = async (message) => {
    if (!selectedId) return;
    setSending(true);
    try {
      const res = await postRequest(ENDPOINTS.SUPPORT.REPLY(selectedId), { message });
      const ticket = res.data?.ticket;
      setConversation(ticket || null);
      if (ticket) {
        setTickets((rows) => rows.map((row) => (row.id === ticket.id ? { ...row, status: ticket.status } : row)));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <OwnerPageShell showSearch={false}>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(380px,460px)]">
        <TableShell
          title="Support"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search tickets..."
          actions={
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="neon-glow inline-flex items-center gap-1.5 rounded-lg bg-neon px-3 py-2 text-xs font-bold text-on-primary-fixed"
            >
              <Icon name="add" size={16} />
              Create ticket
            </button>
          }
          page={page}
          total={pagination.total || 0}
          limit={limit}
          loading={loading}
          onPage={setPage}
          noun="tickets"
        >
          <table className={`${TABLE_CLASS} min-w-[640px]`}>
            <thead>
              <tr className={THEAD_ROW}>
                <th className={`w-12 ${TH}`}>#</th>
                <th className={TH}>Date</th>
                <th className={TH}>Category</th>
                <th className={TH}>Subject</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${TD} py-8 text-center text-secondary`}>
                    No support requests yet.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket, i) => (
                  <tr
                    key={ticket.id}
                    className={`cursor-pointer hover:bg-white/[0.02] ${selectedId === ticket.id ? 'bg-white/[0.04]' : ''}`}
                    onClick={() => setSelectedId(ticket.id)}
                  >
                    <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                      {tableRowNumber(page, limit, i)}
                    </td>
                    <td className={TD}>{formatDate(ticket.createdAt)}</td>
                    <td className={TD}>{getSupportCategory(ticket.category)?.label || ticket.category}</td>
                    <td className={`${TD} max-w-xs truncate`} title={ticket.subject}>
                      {ticket.subject}
                    </td>
                    <td className={TD}>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_CLASS[ticket.status] || 'bg-white/10 text-secondary'
                        }`}
                      >
                        {SUPPORT_STATUS_LABELS[ticket.status] || ticket.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>
        <SupportTicketChat
          ticket={conversation}
          loading={chatLoading}
          sending={sending}
          onSend={handleSend}
        />
      </div>

      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} size="xl" scrollable>
        <SupportTicketForm
          key={`${createOpen}-${formDefaults.category}-${formDefaults.subject}`}
          bare
          initialCategory={formDefaults.category}
          initialSubject={formDefaults.subject}
          initialMessage={formDefaults.message}
          onCancel={() => setCreateOpen(false)}
          onSubmitted={(ticket) => {
            setCreateOpen(false);
            loadTickets();
            if (ticket?.id) setSelectedId(ticket.id);
          }}
        />
      </AppModal>
    </OwnerPageShell>
  );
};

export default Support;
