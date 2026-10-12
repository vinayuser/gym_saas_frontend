import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, putRequest, postRequest, deleteRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import AppModal from '../../../components/fitsphere/AppModal';
import LeadFormModal from '../../../components/fitsphere/LeadFormModal';
import StatCard from '../../../components/fitsphere/StatCard';
import SectionLoader from '../../../components/Loader/SectionLoader';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  TableSelect,
  tableRowNumber,
} from '../../../components/fitsphere/TableShell';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { formatDate } from '../../../helpers/formatUtils';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'TRIAL', label: 'Trial' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' },
];

const STATUS_STYLE = {
  NEW: 'bg-sky-400/15 text-sky-300',
  CONTACTED: 'bg-amber-400/15 text-amber-300',
  TRIAL: 'bg-violet-400/15 text-violet-300',
  FOLLOW_UP: 'bg-primary-container/15 text-primary-container',
  CONVERTED: 'bg-emerald-400/15 text-emerald-300',
  LOST: 'bg-white/10 text-secondary',
};

const fullName = (lead) => [lead.name, lead.lastName].filter(Boolean).join(' ');

const Leads = () => {
  const navigate = useNavigate();
  const { currentGym } = useSelector((s) => s.gym);
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editLeadId, setEditLeadId] = useState(null);
  const [detailLead, setDetailLead] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 300);
  const limit = 10;

  const load = () => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.ENQUIRIES.LIST(currentGym.id))
      .then((res) => {
        setEnquiries(res.data?.enquiries || []);
        setStats(res.data?.stats || {});
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [currentGym?.id]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, currentGym?.id]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return enquiries.filter((lead) => {
      if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [fullName(lead), lead.phone, lead.email, lead.source, lead.interestedIn]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [enquiries, debouncedSearch, statusFilter]);

  const pageRows = filtered.slice((page - 1) * limit, page * limit);

  const convertLead = async (id) => {
    try {
      const res = await postRequest(ENDPOINTS.ENQUIRIES.CONVERT(currentGym.id, id), {});
      const member = res.data?.member;
      toast.success('Lead converted to a member');
      setDetailLead(null);
      if (member?.id) navigate(`/owner/members/${member.id}`);
      else load();
    } catch {
      /* toast from api */
    }
  };

  const moveLead = async (id, status) => {
    if (status === 'CONVERTED') {
      await convertLead(id);
      return;
    }
    try {
      await putRequest(ENDPOINTS.ENQUIRIES.UPDATE(currentGym.id, id), { status });
      toast.success('Status updated');
      load();
      if (detailLead?.id === id) setDetailLead((l) => (l ? { ...l, status } : null));
    } catch {
      /* toast from api */
    }
  };

  const openCreate = () => {
    setEditLeadId(null);
    setFormOpen(true);
  };

  const openEdit = (lead) => {
    setDetailLead(null);
    setEditLeadId(lead.id);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await deleteRequest(ENDPOINTS.ENQUIRIES.DELETE(currentGym.id, id));
      toast.success('Inquiry deleted');
      setDetailLead(null);
      load();
    } catch {
      /* toast from api */
    }
  };

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch.</GlassCard>
      </OwnerPageShell>
    );
  }

  const total = stats.total || enquiries.length;
  const converted = stats.byStatus?.CONVERTED || 0;
  const lost = stats.byStatus?.LOST || 0;
  const conversion = total ? Math.round((converted / total) * 1000) / 10 : 0;
  const active = enquiries.filter((e) => !['CONVERTED', 'LOST'].includes(e.status)).length;

  return (
    <SectionLoader show={loading && !enquiries.length}>
      <OwnerPageShell showSearch={false}>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <StatCard label="Active Inquiries" value={active} icon="filter_alt" accent />
          <StatCard label="Conversion Rate" value={`${conversion}%`} icon="trending_up" />
          <StatCard label="Converted" value={converted} icon="check_circle" />
          <StatCard label="Lost" value={lost} icon="cancel" />
        </div>

        <TableShell
          title="Leads"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search name, phone, email..."
          filters={
            <TableSelect value={statusFilter} onChange={setStatusFilter}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </TableSelect>
          }
          actions={
            <button
              type="button"
              onClick={openCreate}
              className="cyber-glow inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-3 py-2 text-xs font-bold text-on-primary-container"
            >
              <Icon name="person_add" size={16} />
              Add Inquiry
            </button>
          }
          page={page}
          total={filtered.length}
          limit={limit}
          loading={loading}
          onPage={setPage}
          noun="leads"
        >
          <table className={`${TABLE_CLASS} min-w-[880px]`}>
            <thead>
              <tr className={THEAD_ROW}>
                <th className={`w-12 ${TH}`}>#</th>
                <th className={TH}>Lead</th>
                <th className={TH}>Contact</th>
                <th className={TH}>Source</th>
                <th className={TH}>Interest</th>
                <th className={TH}>Follow-up</th>
                <th className={TH}>Status</th>
                <th className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`${TD} py-12 text-center text-secondary`}>
                    No leads match this filter.
                  </td>
                </tr>
              ) : (
                pageRows.map((lead, i) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02]">
                    <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                      {tableRowNumber(page, limit, i)}
                    </td>
                    <td className={TD}>
                      <p className="font-medium">{fullName(lead)}</p>
                      {lead.fitnessGoal ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-secondary">{lead.fitnessGoal}</p>
                      ) : null}
                    </td>
                    <td className={TD}>
                      <p className="text-sm">{lead.phone || '—'}</p>
                      <p className="text-xs text-secondary">{lead.email || ''}</p>
                    </td>
                    <td className={`${TD} capitalize text-secondary`}>
                      {lead.source?.replace(/-/g, ' ') || '—'}
                    </td>
                    <td className={TD}>{lead.interestedIn || '—'}</td>
                    <td className={`${TD} text-secondary`}>
                      {lead.followUpAt ? formatDate(lead.followUpAt) : lead.trialDate ? formatDate(lead.trialDate) : '—'}
                    </td>
                    <td className={TD}>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          STATUS_STYLE[lead.status] || 'bg-white/10 text-secondary'
                        }`}
                      >
                        {lead.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className={`${TD} text-right`}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailLead(lead)}
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-secondary hover:border-primary-fixed/40 hover:text-primary-fixed"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(lead)}
                          className="p-1.5 text-secondary hover:text-primary-fixed"
                        >
                          <Icon name="edit" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>

        <LeadFormModal
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditLeadId(null);
          }}
          gymId={currentGym.id}
          leadId={editLeadId}
          onSaved={load}
        />

        <AppModal open={Boolean(detailLead)} onClose={() => setDetailLead(null)} size="lg" scrollable>
          {detailLead && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold">{fullName(detailLead)}</h2>
                  <p className="text-sm capitalize text-secondary">
                    {detailLead.source?.replace(/-/g, ' ')} · {detailLead.status.replace(/_/g, ' ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailLead(null)}
                  className="rounded-lg p-2 hover:bg-white/5"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['Phone', detailLead.phone],
                  ['Email', detailLead.email],
                  ['Gender', detailLead.gender?.replace('_', ' ')],
                  ['DOB', detailLead.dateOfBirth ? formatDate(detailLead.dateOfBirth) : null],
                  ['Occupation', detailLead.occupation],
                  ['Preferred contact', detailLead.preferredContact],
                  ['Interested in', detailLead.interestedIn],
                  ['Budget', detailLead.budget != null ? `₹${Number(detailLead.budget).toFixed(0)}` : null],
                  ['Trial date', detailLead.trialDate ? formatDate(detailLead.trialDate) : null],
                  ['Follow-up', detailLead.followUpAt ? formatDate(detailLead.followUpAt) : null],
                  ['Referral', detailLead.referralSource],
                ]
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs font-semibold uppercase text-secondary">{label}</p>
                      <p className="text-sm">{value}</p>
                    </div>
                  ))}
              </div>

              {(detailLead.address || detailLead.city) && (
                <div>
                  <p className="text-xs font-semibold uppercase text-secondary">Address</p>
                  <p className="text-sm">
                    {[detailLead.address, detailLead.city, detailLead.state, detailLead.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}

              {detailLead.fitnessGoal && (
                <div>
                  <p className="text-xs font-semibold uppercase text-secondary">Fitness goal</p>
                  <p className="text-sm text-secondary/80">{detailLead.fitnessGoal}</p>
                </div>
              )}

              {detailLead.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase text-secondary">Notes</p>
                  <p className="text-sm text-secondary/80">{detailLead.notes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => openEdit(detailLead)}
                  className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container"
                >
                  Edit
                </button>
                {!['CONVERTED', 'LOST'].includes(detailLead.status) ? (
                  <>
                    <button
                      type="button"
                      onClick={() => moveLead(detailLead.id, 'CONVERTED')}
                      className="rounded-lg border border-emerald-500/40 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10"
                    >
                      Mark converted
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLead(detailLead.id, 'LOST')}
                      className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/5"
                    >
                      Mark lost
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(detailLead.id)}
                  className="rounded-lg border border-error/40 px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </AppModal>
      </OwnerPageShell>
    </SectionLoader>
  );
};

export default Leads;
