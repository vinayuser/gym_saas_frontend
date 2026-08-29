import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import SupportTicketForm from '../../../components/fitsphere/SupportTicketForm';
import PageLoader from '../../../components/Loader/PageLoader';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest } from '../../../config/dataApi';
import {
  SUPPORT_EMAIL,
  SUPPORT_STATUS_LABELS,
  getSupportCategory,
} from '../../../constants/supportTopics';
import { formatDate } from '../../../helpers/formatUtils';

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

  const formDefaults = useMemo(() => {
    const fromState = location.state || {};
    return {
      category: fromState.category || searchParams.get('category') || 'GENERAL',
      subject: fromState.subject || searchParams.get('subject') || '',
      message: fromState.message || searchParams.get('message') || '',
    };
  }, [location.state, searchParams]);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRequest(ENDPOINTS.SUPPORT.TICKETS, { params: { limit: 10 } });
      setTickets(res.data?.tickets || []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return (
    <OwnerPageShell showSearch={false}>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Support</h1>
          <p className="mt-1 text-secondary/70">
            Contact FitSphere Pro support for billing, plan changes, and technical help.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SupportTicketForm
              key={`${formDefaults.category}-${formDefaults.subject}-${formDefaults.message.length}`}
              initialCategory={formDefaults.category}
              initialSubject={formDefaults.subject}
              initialMessage={formDefaults.message}
              onSubmitted={() => loadTickets()}
            />
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <Icon name="mail" size={28} className="mb-3 text-primary-container" />
              <h2 className="text-lg font-semibold">Direct email</h2>
              <p className="mt-2 text-sm text-secondary">
                Prefer email? Write to{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary-container hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </p>
              <p className="mt-3 text-xs text-secondary">Typical response time: 1–2 business days</p>
            </GlassCard>

            <GlassCard className="p-6">
              <Icon name="menu_book" size={28} className="mb-3 text-primary-container" />
              <h2 className="text-lg font-semibold">Before you write</h2>
              <ul className="mt-3 space-y-2 text-sm text-secondary">
                <li className="flex gap-2">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-primary-container" />
                  Include your gym or business name
                </li>
                <li className="flex gap-2">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-primary-container" />
                  For plan changes, mention your current and desired plan
                </li>
                <li className="flex gap-2">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-primary-container" />
                  For technical issues, describe steps to reproduce
                </li>
              </ul>
            </GlassCard>
          </div>
        </div>

        <GlassCard className="overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="text-lg font-semibold">Your recent requests</h2>
            <p className="mt-1 text-sm text-secondary">Track support tickets submitted from this account</p>
          </div>

          <PageLoader show={loading} message="Loading tickets...">
            {tickets.length === 0 ? (
              <p className="px-6 py-8 text-sm text-secondary">No support requests yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-white/10 text-secondary">
                    <tr>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Category</th>
                      <th className="px-6 py-3 font-medium">Subject</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Email sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-white/5 last:border-0">
                        <td className="px-6 py-3">{formatDate(ticket.createdAt)}</td>
                        <td className="px-6 py-3">
                          {getSupportCategory(ticket.category)?.label || ticket.category}
                        </td>
                        <td className="max-w-xs truncate px-6 py-3" title={ticket.subject}>
                          {ticket.subject}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              STATUS_CLASS[ticket.status] || 'bg-white/10 text-secondary'
                            }`}
                          >
                            {SUPPORT_STATUS_LABELS[ticket.status] || ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {ticket.emailSent ? (
                            <span className="text-emerald-300">Yes</span>
                          ) : (
                            <span className="text-secondary">Saved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PageLoader>
        </GlassCard>
      </div>
    </OwnerPageShell>
  );
};

export default Support;
