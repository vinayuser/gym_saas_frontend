import { useEffect, useState } from 'react';
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
  { status: 'NEW', title: 'New Inquiries', color: 'border-blue-500/40' },
  { status: 'CONTACTED', title: 'Initial Contact', color: 'border-amber-500/40' },
  { status: 'TRIAL', title: 'Trial / Tour', color: 'border-violet-500/40' },
  { status: 'FOLLOW_UP', title: 'Closing', color: 'border-primary-container/40' },
];

const fullName = (lead) => [lead.name, lead.lastName].filter(Boolean).join(' ');

const LeadCard = ({ lead, onOpen, onMove }) => (
  <GlassCard
    className="cursor-pointer p-4 transition hover:border-primary-container/30"
    onClick={() => onOpen(lead)}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="truncate font-semibold">{fullName(lead)}</p>
        <p className="text-xs capitalize text-secondary">{lead.source?.replace('-', ' ') || 'walk-in'}</p>
      </div>
      {lead.interestedIn && (
        <span className="shrink-0 rounded-full bg-primary-container/15 px-2 py-0.5 text-[10px] font-semibold text-primary-container">
          {lead.interestedIn.split(' ')[0]}
        </span>
      )}
    </div>

    <div className="mt-2 space-y-1 text-xs text-secondary/80">
      {lead.phone && (
        <p className="flex items-center gap-1">
          <Icon name="phone" size={13} /> {lead.phone}
        </p>
      )}
      {lead.email && (
        <p className="flex items-center gap-1 truncate">
          <Icon name="mail" size={13} /> {lead.email}
        </p>
      )}
      {lead.trialDate && (
        <p className="flex items-center gap-1 text-violet-300">
          <Icon name="event" size={13} /> Trial: {formatDate(lead.trialDate)}
        </p>
      )}
      {lead.followUpAt && (
        <p className="flex items-center gap-1 text-amber-300">
          <Icon name="schedule" size={13} /> Follow-up: {formatDate(lead.followUpAt)}
        </p>
      )}
    </div>

    {lead.fitnessGoal && (
      <p className="mt-2 line-clamp-2 text-[11px] text-secondary/60">{lead.fitnessGoal}</p>
    )}

    <div className="mt-3 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
      {COLUMNS.filter((c) => c.status !== lead.status).slice(0, 2).map((c) => (
        <button
          key={c.status}
          type="button"
          onClick={() => onMove(lead.id, c.status)}
          className="rounded bg-white/5 px-2 py-0.5 text-[10px] hover:bg-white/10"
        >
          → {c.title.split(' ')[0]}
        </button>
      ))}
    </div>
  </GlassCard>
);

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
    getRequest(ENDPOINTS.ENQUIRIES.LIST(currentGym.id)).then((res) => {
      setEnquiries(res.data?.enquiries || []);
      setStats(res.data?.stats || {});
      setLoading(false);
    });
  };

  useEffect(load, [currentGym?.id]);

  const moveLead = async (id, status) => {
    await putRequest(ENDPOINTS.ENQUIRIES.UPDATE(currentGym.id, id), { status });
    toast.success('Status updated');
    load();
    if (detailLead?.id === id) setDetailLead((l) => (l ? { ...l, status } : null));
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
    await deleteRequest(ENDPOINTS.ENQUIRIES.DELETE(currentGym.id, id));
    toast.success('Inquiry deleted');
    setDetailLead(null);
    load();
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
              <p className="mt-1 text-secondary/70">Track prospects from first contact to membership conversion.</p>
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

          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <div key={col.status} className={`min-w-[280px] flex-1 rounded-xl border-t-2 ${col.color} pt-1`}>
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold">{col.title}</h3>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                    {enquiries.filter((e) => e.status === col.status).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {enquiries
                    .filter((e) => e.status === col.status)
                    .map((lead) => (
                      <LeadCard key={lead.id} lead={lead} onOpen={setDetailLead} onMove={moveLead} />
                    ))}
                  {enquiries.filter((e) => e.status === col.status).length === 0 && (
                    <p className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-secondary">
                      No inquiries
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Converted / Lost row */}
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
                        <GlassCard key={lead.id} className="flex cursor-pointer items-center justify-between p-3" onClick={() => setDetailLead(lead)}>
                          <span className="font-medium">{fullName(lead)}</span>
                          <span className="text-xs text-secondary">{lead.interestedIn || lead.source}</span>
                        </GlassCard>
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
          onClose={() => { setFormOpen(false); setEditLeadId(null); }}
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
                  <p className="text-sm capitalize text-secondary">{detailLead.source?.replace('-', ' ')} · {detailLead.status.replace('_', ' ')}</p>
                </div>
                <button type="button" onClick={() => setDetailLead(null)} className="rounded-lg p-2 hover:bg-white/5">
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
                ].filter(([, v]) => v).map(([label, value]) => (
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
                    {[detailLead.address, detailLead.city, detailLead.state, detailLead.pincode].filter(Boolean).join(', ')}
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
                <button type="button" onClick={() => openEdit(detailLead)} className="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container">
                  Edit
                </button>
                <button type="button" onClick={() => moveLead(detailLead.id, 'CONVERTED')} className="rounded-lg border border-emerald-500/30 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/10">
                  Mark converted
                </button>
                <button type="button" onClick={() => moveLead(detailLead.id, 'LOST')} className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
                  Mark lost
                </button>
                <button type="button" onClick={() => handleDelete(detailLead.id)} className="rounded-lg border border-error/30 px-4 py-2 text-sm text-error hover:bg-error/10">
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
