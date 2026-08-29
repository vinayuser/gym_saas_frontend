import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ENDPOINTS from '../../../config/apiUrls';
import { getRequest, deleteRequest } from '../../../config/dataApi';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import EventCalendar from '../../../components/fitsphere/EventCalendar';
import EventFormModal from '../../../components/fitsphere/EventFormModal';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import PageLoader from '../../../components/Loader/PageLoader';
import { getViewRange } from '../../../helpers/eventCalendarUtils';

const Events = () => {
  const { currentGym } = useSelector((s) => s.gym);
  const location = useLocation();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarView, setCalendarView] = useState('month');
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [createDate, setCreateDate] = useState(null);

  const range = useMemo(
    () => getViewRange(calendarView, anchorDate),
    [calendarView, anchorDate]
  );

  const load = useCallback(() => {
    if (!currentGym?.id) return;
    setLoading(true);
    getRequest(ENDPOINTS.EVENTS.LIST(currentGym.id), {
      params: {
        from: range.start.toISOString(),
        to: range.end.toISOString(),
        limit: 500,
      },
    }).then((list) => {
      setEvents(list.data || []);
      setLoading(false);
    });
  }, [currentGym?.id, range.start, range.end]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const state = location.state;
    if (state?.openCreate) {
      setEditEventId(null);
      setCreateDate(state.initialDate ? new Date(state.initialDate) : null);
      setFormOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (state?.editEventId) {
      setEditEventId(state.editEventId);
      setCreateDate(null);
      setFormOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const openCreate = (date) => {
    setEditEventId(null);
    setCreateDate(date || null);
    setFormOpen(true);
  };

  const openEdit = (event) => {
    setEditEventId(event.id);
    setCreateDate(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditEventId(null);
    setCreateDate(null);
  };

  const handleDelete = async (eventId) => {
    if (!currentGym?.id) return;
    await deleteRequest(ENDPOINTS.EVENTS.DELETE(currentGym.id, eventId));
    load();
  };

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch.</GlassCard>
      </OwnerPageShell>
    );
  }

  return (
    <PageLoader show={loading} message="Loading events...">
      <OwnerPageShell showSearch={false}>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">Events Calendar</h1>
              <p className="mt-1 text-secondary/70">Each recurring slot is saved as its own event on the calendar.</p>
            </div>
            <button
              type="button"
              onClick={() => openCreate()}
              className="cyber-glow flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-container px-6 py-3 text-sm font-bold text-on-primary-container"
            >
              <Icon name="add" size={20} />
              Create Event
            </button>
          </div>

          <EventCalendar
            events={events}
            view={calendarView}
            onViewChange={setCalendarView}
            anchorDate={anchorDate}
            onAnchorChange={setAnchorDate}
            onEdit={openEdit}
            onDelete={handleDelete}
            onCreateForDate={openCreate}
          />
        </div>

        <EventFormModal
          open={formOpen}
          onClose={closeForm}
          gymId={currentGym.id}
          eventId={editEventId}
          initialDate={createDate}
          onSaved={load}
        />
      </OwnerPageShell>
    </PageLoader>
  );
};

export default Events;
