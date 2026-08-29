import { useMemo, useState } from 'react';
import GlassCard from './GlassCard';
import Icon from './Icon';
import AppModal from './AppModal';
import {
  EVENT_TYPE_COLORS,
  eventsToCalendarItems,
  formatEventTime,
  getMonthGridDays,
  getWeekDays,
  navigateAnchor,
  sameDay,
  viewTitle,
} from '../../helpers/eventCalendarUtils';
import { formatDateTime } from '../../helpers/formatUtils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CALENDAR_VIEWS = [
  { id: 'day', label: 'Day', icon: 'today' },
  { id: 'week', label: 'Week', icon: 'view_week' },
  { id: 'month', label: 'Month', icon: 'calendar_month' },
];

const EventChip = ({ event, compact, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(event)}
    className={`group flex w-full items-start gap-1.5 rounded-md border px-2 py-1.5 text-left transition hover:brightness-110 ${
      EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.OTHER
    } ${compact ? 'text-[10px] md:text-xs' : 'text-xs'}`}
  >
    {!compact && event.imageUrl && (
      <img src={event.imageUrl} alt="" className="mt-0.5 h-8 w-8 shrink-0 rounded object-cover" />
    )}
    <span className="min-w-0 flex-1">
      <span className="block truncate font-semibold">{event.title}</span>
      <span className="block text-[10px] opacity-80">{formatEventTime(event.instanceStart)}</span>
    </span>
  </button>
);

const EventCalendar = ({
  events,
  view,
  onViewChange,
  anchorDate,
  onAnchorChange,
  onEdit,
  onDelete,
  onCreateForDate,
}) => {
  const today = new Date();
  const [selected, setSelected] = useState(null);

  const instances = useMemo(() => eventsToCalendarItems(events), [events]);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const inst of instances) {
      const key = inst.instanceStart.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(inst);
    }
    return map;
  }, [instances]);

  const goPrev = () => onAnchorChange(navigateAnchor(view, anchorDate, 'prev'));
  const goNext = () => onAnchorChange(navigateAnchor(view, anchorDate, 'next'));
  const goToday = () => onAnchorChange(new Date());

  const handleEdit = (ev) => {
    setSelected(null);
    onEdit?.(ev);
  };

  const monthDays = useMemo(() => {
    if (view !== 'month') return [];
    const d = new Date(anchorDate);
    return getMonthGridDays(d.getFullYear(), d.getMonth());
  }, [view, anchorDate]);

  const weekDays = useMemo(() => {
    if (view !== 'week') return [];
    return getWeekDays(anchorDate);
  }, [view, anchorDate]);

  const dayEvents = eventsByDay.get(new Date(anchorDate).toDateString()) || [];

  return (
    <>
      <GlassCard className="overflow-hidden p-0" hover={false}>
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={goToday} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/5">
              Today
            </button>
            <div className="flex items-center gap-1">
              <button type="button" onClick={goPrev} className="rounded-lg p-2 hover:bg-white/5" aria-label="Previous">
                <Icon name="chevron_left" size={22} />
              </button>
              <button type="button" onClick={goNext} className="rounded-lg p-2 hover:bg-white/5" aria-label="Next">
                <Icon name="chevron_right" size={22} />
              </button>
            </div>
            <h2 className="font-display text-lg font-bold md:text-xl">{viewTitle(view, anchorDate)}</h2>
          </div>

          <div className="flex rounded-lg border border-white/10 p-1">
            {CALENDAR_VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onViewChange(v.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition ${
                  view === v.id ? 'bg-primary-container text-on-primary-container' : 'text-secondary hover:bg-white/5'
                }`}
              >
                <Icon name={v.icon} size={16} />
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Day view */}
        {view === 'day' && (
          <div className="p-4 md:p-6">
            {dayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
                <Icon name="event_busy" size={48} className="mb-3 text-secondary/40" />
                <p className="text-secondary">No events scheduled for this day.</p>
                <button
                  type="button"
                  onClick={() => onCreateForDate?.(anchorDate)}
                  className="mt-4 rounded-lg bg-primary-container/20 px-4 py-2 text-sm font-semibold text-primary-container hover:bg-primary-container/30"
                >
                  Add event for this day
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((ev) => (
                  <div key={ev.occurrenceKey} className="flex gap-4">
                    <div className="w-20 shrink-0 pt-2 text-right text-sm font-medium text-secondary">
                      {formatEventTime(ev.instanceStart)}
                    </div>
                    <div className="flex-1 border-l-2 border-primary-container/40 pl-4">
                      <EventChip event={ev} onClick={setSelected} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Week view */}
        {view === 'week' && (
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-7 border-b border-white/10">
                {weekDays.map((day) => {
                  const isToday = sameDay(day, today);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`border-r border-white/10 px-2 py-3 text-center last:border-r-0 ${isToday ? 'bg-primary-container/10' : ''}`}
                    >
                      <p className="text-xs font-semibold uppercase text-secondary">{WEEKDAYS[day.getDay()]}</p>
                      <p className={`mt-0.5 text-lg font-bold ${isToday ? 'text-primary-container' : ''}`}>{day.getDate()}</p>
                    </div>
                  );
                })}
              </div>
              <div className="grid min-h-[420px] grid-cols-7">
                {weekDays.map((day) => {
                  const isToday = sameDay(day, today);
                  const items = eventsByDay.get(day.toDateString()) || [];
                  return (
                    <div
                      key={day.toISOString()}
                      className={`border-r border-white/10 p-1.5 last:border-r-0 ${isToday ? 'bg-primary-container/5' : 'bg-surface-container-lowest/50'}`}
                    >
                      <div className="space-y-1">
                        {items.map((ev) => (
                          <EventChip key={ev.occurrenceKey} event={ev} compact onClick={setSelected} />
                        ))}
                      </div>
                      {items.length === 0 && (
                        <button
                          type="button"
                          onClick={() => onCreateForDate?.(day)}
                          className="mt-1 flex h-full min-h-[60px] w-full items-center justify-center rounded-md border border-dashed border-white/5 text-secondary/30 hover:border-primary-container/30 hover:text-primary-container/60"
                          aria-label="Add event"
                        >
                          <Icon name="add" size={18} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Month view */}
        {view === 'month' && (
          <div className="p-3 md:p-4">
            <div className="grid grid-cols-7 gap-px rounded-t-lg border border-white/10 bg-white/5 text-center text-xs font-semibold uppercase tracking-wide text-secondary">
              {WEEKDAYS.map((d) => (
                <div key={d} className="bg-surface-container-lowest py-2.5">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px rounded-b-lg border border-t-0 border-white/10 bg-white/5">
              {monthDays.map((day) => {
                const inMonth = day.getMonth() === new Date(anchorDate).getMonth();
                const isToday = sameDay(day, today);
                const items = eventsByDay.get(day.toDateString()) || [];

                return (
                  <div
                    key={day.toISOString()}
                    role="button"
                    tabIndex={0}
                    onClick={() => items.length === 0 && onCreateForDate?.(day)}
                    onKeyDown={(e) => e.key === 'Enter' && items.length === 0 && onCreateForDate?.(day)}
                    className={`min-h-[96px] cursor-default bg-surface-container-lowest p-1.5 transition md:min-h-[120px] md:p-2 ${
                      inMonth ? '' : 'opacity-35'
                    } ${isToday ? 'ring-1 ring-inset ring-primary-container/50' : ''} hover:bg-white/[0.02]`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          isToday ? 'bg-primary-container text-on-primary-container' : 'text-secondary'
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      {items.length > 0 && (
                        <span className="rounded-full bg-primary-container/20 px-1.5 py-0.5 text-[10px] font-bold text-primary-container">
                          {items.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 space-y-0.5" onClick={(e) => e.stopPropagation()}>
                      {items.slice(0, 3).map((ev) => (
                        <EventChip key={ev.occurrenceKey} event={ev} compact onClick={setSelected} />
                      ))}
                      {items.length > 3 && (
                        <span className="block px-1 text-[10px] text-secondary">+{items.length - 3} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Event detail modal */}
      <AppModal open={Boolean(selected)} onClose={() => setSelected(null)} size="md" scrollable>
        {selected && (
          <div className="space-y-4">
            {selected.imageUrl && (
              <img src={selected.imageUrl} alt="" className="max-h-44 w-full rounded-xl object-cover" />
            )}
            <div>
              <h3 className="font-display text-xl font-bold">{selected.title}</h3>
              <p className="mt-1 text-sm text-secondary">{formatDateTime(selected.startAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${EVENT_TYPE_COLORS[selected.type] || EVENT_TYPE_COLORS.OTHER}`}>
                {selected.type.replace('_', ' ')}
              </span>
            </div>
            {selected.location && (
              <p className="flex items-center gap-1.5 text-sm text-secondary">
                <Icon name="location_on" size={16} /> {selected.location}
              </p>
            )}
            {selected.description && <p className="text-sm leading-relaxed text-secondary/80">{selected.description}</p>}
            {(selected.seatLimit || selected.price != null) && (
              <div className="flex gap-4 text-sm text-secondary">
                {selected.seatLimit && (
                  <span className="flex items-center gap-1">
                    <Icon name="groups" size={16} /> {selected.participantCount || 0}/{selected.seatLimit} seats
                  </span>
                )}
                {selected.price == null || Number(selected.price) === 0 ? (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                    Free
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Icon name="payments" size={16} /> ${Number(selected.price).toFixed(2)}
                  </span>
                )}
              </div>
            )}
            <div className="flex gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => handleEdit(selected)}
                className="flex-1 rounded-lg bg-primary-container py-2.5 text-sm font-bold text-on-primary-container"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('Delete this event?')) {
                    await onDelete?.(selected.id);
                    setSelected(null);
                  }
                }}
                className="rounded-lg border border-error/30 px-4 py-2.5 text-sm text-error hover:bg-error/10"
              >
                Delete
              </button>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm">
                Close
              </button>
            </div>
          </div>
        )}
      </AppModal>
    </>
  );
};

export default EventCalendar;
