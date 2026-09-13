import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, putRequest, deleteRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import AppModal from '../../../components/fitsphere/AppModal';
import LeadFormModal from '../../../components/fitsphere/LeadFormModal';
import StatCard from '../../../components/fitsphere/StatCard';
import PageLoader from '../../../components/Loader/PageLoader';
import { formatDate } from '../../../helpers/formatUtils';

const COLUMNS = [
  {
    status: 'NEW',
    title: 'New Inquiries',
    accent: 'border-sky-400',
    badge: 'bg-sky-400/15 text-sky-300',
    chip: 'border-sky-400/40 text-sky-300 hover:bg-sky-400/15',
  },
  {
    status: 'CONTACTED',
    title: 'Initial Contact',
    accent: 'border-amber-400',
    badge: 'bg-amber-400/15 text-amber-300',
    chip: 'border-amber-400/40 text-amber-300 hover:bg-amber-400/15',
  },
  {
    status: 'TRIAL',
    title: 'Trial / Tour',
    accent: 'border-violet-400',
    badge: 'bg-violet-400/15 text-violet-300',
    chip: 'border-violet-400/40 text-violet-300 hover:bg-violet-400/15',
  },
  {
    status: 'FOLLOW_UP',
    title: 'Closing',
    accent: 'border-primary-container',
    badge: 'bg-primary-container/15 text-primary-container',
    chip: 'border-primary-container/40 text-primary-container hover:bg-primary-container/15',
  },
];

const fullName = (lead) => [lead.name, lead.lastName].filter(Boolean).join(' ');

const shortLabel = (title) => title.split(' ')[0];

const LeadCard = ({ lead, onOpen, onMove }) => {
  const currentIndex = COLUMNS.findIndex((c) => c.status === lead.status);
  const prev = currentIndex > 0 ? COLUMNS[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < COLUMNS.length - 1 ? COLUMNS[currentIndex + 1] : null;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-surface-container-low shadow-lg shadow-black/20">
      <button
        type="button"
        onClick={() => onOpen(lead)}
        className="w-full p-4 text-left transition-colors hover:bg-white/[0.03]"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-on-surface">{fullName(lead)}</p>
            <p className="mt-0.5 text-xs capitalize text-secondary">
              {lead.source?.replace(/-/g, ' ') || 'walk-in'}
            </p>
          </div>
          {lead.interestedIn ? (
            <span className="shrink-0 rounded-full border border-primary-container/30 bg-primary-container/10 px-2 py-0.5 text-[10px] font-semibold text-primary-container">
              {lead.interestedIn.split(' ')[0]}
            </span>
          ) : null}
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-secondary">
          {lead.phone ? (
            <p className="flex items-center gap-1.5">
              <Icon name="call" size={14} className="text-secondary/70" />
              <span className="truncate">{lead.phone}</span>
            </p>
          ) : null}
          {lead.email ? (
            <p className="flex items-center gap-1.5">
              <Icon name="mail" size={14} className="text-secondary/70" />
              <span className="truncate">{lead.email}</span>
            </p>
          ) : null}
          {lead.trialDate ? (
            <p className="flex items-center gap-1.5 text-violet-300">
              <Icon name="event" size={14} />
              Trial: {formatDate(lead.trialDate)}
            </p>
          ) : null}
          {lead.followUpAt ? (
            <p className="flex items-center gap-1.5 text-amber-300">
              <Icon name="schedule" size={14} />
              Follow-up: {formatDate(lead.followUpAt)}
            </p>
          ) : null}
        </div>

        {lead.fitnessGoal ? (
          <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-secondary/70">
            {lead.fitnessGoal}
          </p>
        ) : null}
      </button>

      <div className="flex gap-2 border-t border-white/10 bg-black/20 p-2.5">
        {prev ? (
          <button
            type="button"
            onClick={() => onMove(lead.id, prev.status)}
            className={`inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2.5 py-2 text-[11px] font-semibold transition-colors ${prev.chip}`}
            title={`Move to ${prev.title}`}
          >
            <Icon name="arrow_back" size={14} />
            {shortLabel(prev.title)}
          </button>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <button
            type="button"
            onClick={() => onMove(lead.id, next.status)}
            className={`inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2.5 py-2 text-[11px] font-semibold transition-colors ${next.chip}`}
            title={`Move to ${next.title}`}
          >
            {shortLabel(next.title)}
            <Icon name="arrow_forward" size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onMove(lead.id, 'CONVERTED')}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-emerald-400/40 px-2.5 py-2 text-[11px] font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/15"
            title="Mark converted"
          >
            Convert
            <Icon name="check" size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

const Leads = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editLeadId, setEditLeadId] = useState(null);
  const [detailLead, setDetailLead] = useState(null);

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

  const columnCounts = useMemo(() => {
    const counts = {};
    COLUMNS.forEach((c) => {
      counts[c.status] = enquiries.filter((e) => e.status === c.status).length;
    });
    return counts;
  }, [enquiries]);

  const moveLead = async (id, status) => {
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
    <PageLoader show={loading} message="Loading pipeline...">
      <OwnerPageShell showSearch={false}>
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">Member Inquiries</h1>
              <p className="mt-1 text-secondary/70">
                Track prospects from first contact to membership conversion.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="cyber-glow flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 text-sm font-bold text-on-primary-container"
            >
              <Icon name="person_add" size={20} />
              Add Inquiry
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatCard label="Active Inquiries" value={active} icon="filter_alt" accent />
            <StatCard label="Conversion Rate" value={`${conversion}%`} icon="trending_up" />
            <StatCard label="Converted" value={converted} icon="check_circle" />
            <StatCard label="Lost" value={lost} icon="cancel" />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {COLUMNS.map((col) => (
              <div
                key={col.status}
                className={`min-w-[280px] flex-1 rounded-2xl border border-white/10 bg-white/[0.02] p-3`}
              >
                <div className={`mb-3 border-t-2 ${col.accent} pt-3`}>
                  <div className="flex items-center justify-between gap-2 px-1">
                    <h3 className="text-sm font-semibold text-on-surface">{col.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${col.badge}`}>
                      {columnCounts[col.status] || 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {enquiries
                    .filter((e) => e.status === col.status)
                    .map((lead) => (
                      <LeadCard key={lead.id} lead={lead} onOpen={setDetailLead} onMove={moveLead} />
                    ))}
                  {(columnCounts[col.status] || 0) === 0 && (
                    <div className="rounded-xl border border-dashed border-white/15 bg-black/10 px-4 py-8 text-center">
                      <Icon name="inbox" size={22} className="mx-auto mb-2 text-secondary/50" />
                      <p className="text-xs text-secondary">No inquiries</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {enquiries.some((e) => ['CONVERTED', 'LOST'].includes(e.status)) && (
            <div className="grid gap-4 md:grid-cols-2">
              {['CONVERTED', 'LOST'].map((status) => {
                const items = enquiries.filter((e) => e.status === status);
                if (!items.length) return null;
                return (
                  <div key={status}>
                    <h3 className="mb-3 text-sm font-semibold text-secondary">
                      {status === 'CONVERTED' ? 'Converted members' : 'Lost leads'} ({items.length})
                    </h3>
                    <div className="space-y-2">
                      {items.slice(0, 5).map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => setDetailLead(lead)}
                          className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-surface-container-low px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
                        >
                          <span className="font-medium">{fullName(lead)}</span>
                          <span className="text-xs text-secondary">
                            {lead.interestedIn || lead.source}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
                  ['Budget', detailLead.budget != null ? `$${Number(detailLead.budget).toFixed(0)}` : null],
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
    </PageLoader>
  );
};

export default Leads;
