const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const addMonths = (d, n) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
};

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Map persisted event rows directly onto the calendar (no virtual expansion). */
export const eventsToCalendarItems = (events) =>
  events.map((event) => {
    const instanceStart = new Date(event.startAt);
    const instanceEnd = new Date(event.endAt);
    return {
      ...event,
      instanceStart,
      instanceEnd,
      occurrenceKey: event.id,
    };
  });

export const getMonthGridDays = (year, month) => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const days = [];

  for (let i = startPad - 1; i >= 0; i -= 1) {
    days.push(addDays(first, -i - 1));
  }
  for (let d = 1; d <= last.getDate(); d += 1) {
    days.push(new Date(year, month, d));
  }
  let trailing = 1;
  while (days.length % 7 !== 0) {
    days.push(addDays(last, trailing));
    trailing += 1;
  }

  return days;
};

export const getWeekDays = (anchor) => {
  const start = startOfDay(anchor);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const getViewRange = (view, anchor) => {
  const d = startOfDay(anchor);
  if (view === 'day') {
    return { start: d, end: endOfDay(d) };
  }
  if (view === 'week') {
    const weekStart = new Date(d);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = addDays(weekStart, 6);
    return { start: weekStart, end: endOfDay(weekEnd) };
  }
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
  const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start: monthStart, end: endOfDay(monthEnd) };
};

export const navigateAnchor = (view, anchor, direction) => {
  const d = new Date(anchor);
  const delta = direction === 'prev' ? -1 : 1;
  if (view === 'day') d.setDate(d.getDate() + delta);
  else if (view === 'week') d.setDate(d.getDate() + delta * 7);
  else d.setMonth(d.getMonth() + delta);
  return d;
};

export const viewTitle = (view, anchor) => {
  const d = new Date(anchor);
  if (view === 'day') {
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
  if (view === 'week') {
    const { start, end } = getViewRange('week', anchor);
    const sameMonth = start.getMonth() === end.getMonth();
    const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString(undefined, {
      month: sameMonth ? undefined : 'short',
      day: 'numeric',
      year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined,
    });
    const year = start.getFullYear() === end.getFullYear() ? `, ${start.getFullYear()}` : '';
    return `${startStr} – ${endStr}${year}`;
  }
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

export const monthLabel = (year, month) =>
  new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

export const formatEventTime = (d) =>
  new Date(d).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export const RECURRENCE_OPTIONS = [
  { value: 'NONE', label: 'One-time event' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

export const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export const WEEK_OF_MONTH_OPTIONS = [
  { value: 1, label: '1st week' },
  { value: 2, label: '2nd week' },
  { value: 3, label: '3rd week' },
  { value: 4, label: '4th week' },
  { value: 5, label: 'Last week' },
];

export const DURATION_STEP = 15;

export const roundDuration = (minutes) =>
  Math.max(DURATION_STEP, Math.round(minutes / DURATION_STEP) * DURATION_STEP);

/** Build ISO start/end from separate date, time, and duration (minutes). */
export const buildEventDateTimes = (eventDate, startTime, durationMinutes) => {
  const [h, m] = startTime.split(':').map(Number);
  const start = new Date(`${eventDate}T00:00:00`);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return { startAt: start.toISOString(), endAt: end.toISOString() };
};

/** Parse API event into form schedule fields. */
export const eventToScheduleForm = (event) => {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  const durationMinutes = roundDuration((end - start) / 60000);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    eventDate: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    duration: durationMinutes,
    recurrenceWeekdays:
      event.recurrenceWeekdays?.length > 0
        ? event.recurrenceWeekdays
        : [start.getDay()],
    recurrenceWeekOfMonth: event.recurrenceWeekOfMonth ?? Math.min(5, Math.ceil(start.getDate() / 7)),
    recurrenceDayOfWeek: event.recurrenceDayOfWeek ?? start.getDay(),
  };
};

export const defaultScheduleFields = (initialDate) => {
  const d = initialDate ? new Date(initialDate) : new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    eventDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    startTime: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    duration: 60,
    recurrenceWeekdays: [d.getDay()],
    recurrenceWeekOfMonth: Math.min(5, Math.ceil(d.getDate() / 7)),
    recurrenceDayOfWeek: d.getDay(),
  };
};

export const recurrenceLabel = (value) =>
  RECURRENCE_OPTIONS.find((o) => o.value === value)?.label || 'One-time';

export const EVENT_TYPE_COLORS = {
  ZUMBA: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  YOGA: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  OUTDOOR: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  WORKSHOP: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  PERSONAL_TRAINING: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  OTHER: 'bg-white/10 text-secondary border-white/10',
};

export { sameDay, startOfDay, endOfDay, addDays };
