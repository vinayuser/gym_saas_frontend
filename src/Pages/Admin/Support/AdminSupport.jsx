import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AdminPageShell from '../../../components/fitsphere/AdminPageShell';
import SupportTicketChat from '../../../components/fitsphere/SupportTicketChat';
import TableShell, { TABLE_CLASS, TD, TH, THEAD_ROW, TableSelect, tableRowNumber } from '../../../components/fitsphere/TableShell';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, patchRequest, postRequest } from '../../../config/dataApi';
import {
  SUPPORT_CATEGORIES,
  SUPPORT_STATUS_LABELS,
  getSupportCategory,
} from '../../../constants/supportTopics';
import { formatDate } from '../../../helpers/formatUtils';

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const STATUS_CLASS = {
  OPEN: 'bg-amber-500/20 text-amber-300',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-300',
  RESOLVED: 'bg-emerald-500/20 text-emerald-300',
  CLOSED: 'bg-slate-500/20 text-slate-300',
};

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [selectedId, setSelectedId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const limit = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await getRequest(ENDPOINTS.SUPPORT.TICKETS, { params });
      const next = res.data?.tickets || [];
      setTickets(next);
      setPagination(res.data?.pagination || { total: 0, page, limit, totalPages: 1 });
      setSelectedId((id) => (id && next.some((ticket) => ticket.id === id) ? id : next[0]?.id || null));
    } catch {
      setTickets([]);
      setPagination({ total: 0, page: 1, limit, totalPages: 1 });
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, debouncedSearch, page]);

  useEffect(() => {
    load();
  }, [load]);

  const loadConversation = useCallback(async (ticketId) => {
    if (!ticketId) {
      setConversation(null);
      return;
    }
    setChatLoading(true);
    try {
      const res = await getRequest(ENDPOINTS.SUPPORT.BY_ID(ticketId));
      setConversation(res.data?.ticket || null);
    } catch {
      setConversation(null);
    } finally {
      setChatLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversation(selectedId);
  }, [selectedId, loadConversation]);

  const applyTicket = (ticket) => {
    if (!ticket) return;
    setConversation(ticket);
    setTickets((rows) => rows.map((row) => (row.id === ticket.id ? { ...row, status: ticket.status } : row)));
  };

  const handleStatusChange = async (status) => {
    if (!selectedId) return;
    try {
      const res = await patchRequest(ENDPOINTS.SUPPORT.UPDATE_STATUS(selectedId), { status });
      applyTicket(res.data?.ticket);
      toast.success('Ticket status updated');
    } catch {
      /* handled in api */
    }
  };

  const handleSend = async (message) => {
    if (!selectedId) return;
    setSending(true);
    try {
      const res = await postRequest(ENDPOINTS.SUPPORT.REPLY(selectedId), { message });
      applyTicket(res.data?.ticket);
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminPageShell showSearch={false}>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(380px,460px)]">
        <TableShell
          title="Support tickets"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search subject, gym, or email..."
          filters={
            <>
              <TableSelect
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                {STATUS_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? 'All statuses' : SUPPORT_STATUS_LABELS[status]}
                  </option>
                ))}
              </TableSelect>
              <TableSelect
                value={categoryFilter}
                onChange={(value) => {
                  setCategoryFilter(value);
                  setPage(1);
                }}
              >
                <option value="ALL">All categories</option>
                {SUPPORT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </TableSelect>
            </>
          }
          page={page}
          total={pagination.total || 0}
          limit={limit}
          loading={loading}
          onPage={setPage}
          noun="tickets"
        >
          <table className={`${TABLE_CLASS} min-w-[720px]`}>
            <thead>
              <tr className={THEAD_ROW}>
                <th className={`w-12 ${TH}`}>#</th>
                <th className={TH}>Subject</th>
                <th className={TH}>From</th>
                <th className={TH}>Status</th>
                <th className={TH}>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className={`${TD} py-10 text-center text-secondary`}>
                    Loading…
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${TD} py-10 text-center text-secondary`}>
                    No gym owner tickets yet.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket, i) => {
                  const active = selectedId === ticket.id;
                  return (
                    <tr
                      key={ticket.id}
                      className={`cursor-pointer hover:bg-white/[0.02] ${active ? 'bg-white/[0.04]' : ''}`}
                      onClick={() => setSelectedId(ticket.id)}
                    >
                      <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                        {tableRowNumber(page, limit, i)}
                      </td>
                      <td className={TD}>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-xs text-secondary">
                          {getSupportCategory(ticket.category)?.label || ticket.category}
                        </p>
                      </td>
                      <td className={TD}>
                        <p className="font-medium">
                          {ticket.senderName || ticket.user?.name || ticket.tenant?.name || '—'}
                        </p>
                        <p className="text-xs text-secondary">{ticket.senderEmail}</p>
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
                      <td className={`${TD} text-secondary`}>{formatDate(ticket.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </TableShell>

        <SupportTicketChat
          ticket={conversation}
          loading={chatLoading}
          canManageStatus
          sending={sending}
          onSend={handleSend}
          onStatusChange={handleStatusChange}
        />
      </div>
    </AdminPageShell>
  );
};

export default AdminSupport;
