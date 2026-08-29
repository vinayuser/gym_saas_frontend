import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest, postRequest, putRequest } from '../../config/dataApi';
import AppModal from './AppModal';
import Icon from './Icon';
import MediaFileDrop from './MediaFileDrop';
import { toDateInput } from '../../helpers/bannerUtils';
import {
  buildEventDateTimes,
  defaultScheduleFields,
  DURATION_STEP,
  eventToScheduleForm,
  RECURRENCE_OPTIONS,
  WEEK_OF_MONTH_OPTIONS,
  WEEKDAY_OPTIONS,
} from '../../helpers/eventCalendarUtils';
import { uploadMediaFile } from '../../helpers/mediaUpload';

const inputClass = 'input-cyber w-full rounded-lg border border-white/10 bg-surface-container-lowest px-3 py-2.5 text-sm';
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-secondary';

export const EMPTY_EVENT_FORM = {
  title: '',
  description: '',
  type: 'WORKSHOP',
  imageUrl: '',
  recurrence: 'NONE',
  recurrenceEndAt: '',
  eventDate: '',
  startTime: '',
  duration: 60,
  recurrenceWeekdays: [],
  recurrenceWeekOfMonth: 1,
  recurrenceDayOfWeek: 1,
  location: '',
  seatLimit: '',
  price: '',
  isFree: true,
  isActive: true,
};

const DurationStepper = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => onChange(Math.max(DURATION_STEP, value - DURATION_STEP))}
      disabled={value <= DURATION_STEP}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-lg font-bold hover:bg-white/5 disabled:opacity-30"
      aria-label="Decrease duration"
    >
      −
    </button>
    <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-surface-container-lowest px-3 py-2.5">
      <span className="text-lg font-bold tabular-nums">{value}</span>
      <span className="text-xs text-secondary">min</span>
    </div>
    <button
      type="button"
      onClick={() => onChange(value + DURATION_STEP)}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-lg font-bold hover:bg-white/5"
      aria-label="Increase duration"
    >
      +
    </button>
  </div>
);

const WeekdayCheckboxes = ({ selected, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {WEEKDAY_OPTIONS.map(({ value, label }) => {
      const active = selected.includes(value);
      return (
        <button
          key={value}
          type="button"
          onClick={() =>
            onChange(
              active ? selected.filter((d) => d !== value) : [...selected, value].sort((a, b) => a - b)
            )
          }
          className={`min-w-[3rem] rounded-lg border px-3 py-2 text-xs font-semibold transition ${
            active
              ? 'border-primary-container bg-primary-container text-on-primary-container'
              : 'border-white/10 text-secondary hover:border-white/20 hover:bg-white/5'
          }`}
        >
          {label}
        </button>
      );
    })}
  </div>
);

const EventFormModal = ({ open, onClose, gymId, eventId, initialDate, onSaved }) => {
  const isEdit = Boolean(eventId);
  const imageRef = useRef(null);
  const [form, setForm] = useState(EMPTY_EVENT_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (isEdit && gymId) {
      setLoading(true);
      getRequest(ENDPOINTS.EVENTS.BY_ID(gymId, eventId)).then((res) => {
        const e = res.data;
        const schedule = eventToScheduleForm(e);
        setForm({
          title: e.title,
          description: e.description || '',
          type: e.type,
          imageUrl: e.imageUrl || '',
          recurrence: e.recurrence || 'NONE',
          recurrenceEndAt: e.recurrenceEndAt ? toDateInput(e.recurrenceEndAt) : '',
          ...schedule,
          location: e.location || '',
          seatLimit: e.seatLimit ?? '',
          price: e.price != null && Number(e.price) > 0 ? e.price : '',
          isFree: e.price == null || Number(e.price) === 0,
          isActive: e.isActive,
        });
        setLoading(false);
      });
      return;
    }

    const schedule = defaultScheduleFields(initialDate);
    setForm({ ...EMPTY_EVENT_FORM, ...schedule });
  }, [open, isEdit, gymId, eventId, initialDate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleRecurrenceChange = (recurrence) => {
    setForm((f) => {
      const next = { ...f, recurrence };
      if (recurrence === 'WEEKLY' && f.recurrenceWeekdays.length === 0) {
        const day = new Date(`${f.eventDate}T${f.startTime}`).getDay();
        next.recurrenceWeekdays = [day];
      }
      if (recurrence === 'MONTHLY') {
        const d = new Date(`${f.eventDate}T${f.startTime}`);
        next.recurrenceWeekOfMonth = Math.min(5, Math.ceil(d.getDate() / 7));
        next.recurrenceDayOfWeek = d.getDay();
      }
      return next;
    });
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const asset = await uploadMediaFile(file, { folder: 'events/images' });
      setForm((f) => ({ ...f, imageUrl: asset.url }));
      toast.success('Cover image uploaded');
    } catch {
      /* toast from helper */
    } finally {
      setUploadingImage(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!gymId) return;

    if (!form.eventDate || !form.startTime) {
      toast.error('Please set event date and start time');
      return;
    }

    if (form.recurrence !== 'NONE' && !form.recurrenceEndAt) {
      toast.error('Please set a repeat-until date for recurring events');
      return;
    }

    if (form.recurrence === 'WEEKLY' && form.recurrenceWeekdays.length === 0) {
      toast.error('Select at least one day of the week');
      return;
    }

    if (!form.isFree && !form.price) {
      toast.error('Enter a ticket price or mark the event as free');
      return;
    }

    const { startAt, endAt } = buildEventDateTimes(form.eventDate, form.startTime, form.duration);

    setSaving(true);
    const body = {
      title: form.title,
      description: form.description,
      type: form.type,
      imageUrl: form.imageUrl || null,
      recurrence: form.recurrence || 'NONE',
      recurrenceEndAt:
        form.recurrence !== 'NONE' && form.recurrenceEndAt
          ? new Date(form.recurrenceEndAt + 'T23:59:59').toISOString()
          : null,
      recurrenceWeekdays: form.recurrence === 'WEEKLY' ? form.recurrenceWeekdays : [],
      recurrenceWeekOfMonth: form.recurrence === 'MONTHLY' ? form.recurrenceWeekOfMonth : null,
      recurrenceDayOfWeek: form.recurrence === 'MONTHLY' ? form.recurrenceDayOfWeek : null,
      startAt,
      endAt,
      location: form.location || null,
      seatLimit: form.seatLimit ? Number(form.seatLimit) : null,
      price: form.isFree ? null : form.price ? Number(form.price) : null,
      isActive: form.isActive,
    };

    try {
      if (isEdit) {
        const res = await putRequest(ENDPOINTS.EVENTS.UPDATE(gymId, eventId), body);
        toast.success(res.message || 'Event updated');
      } else {
        const res = await postRequest(ENDPOINTS.EVENTS.CREATE(gymId), body);
        toast.success(res.message || 'Event created');
      }
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModal open={open} onClose={onClose} size="2xl" scrollable>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">{isEdit ? 'Edit Event' : 'Create Event'}</h2>
            <p className="mt-0.5 text-sm text-secondary/70">Schedule one-time or recurring calendar events.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/5" aria-label="Close">
            <Icon name="close" size={22} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container/30 border-t-primary-container" />
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Event details */}
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Icon name="event" size={18} className="text-primary-container" /> Event details
                </p>
                <input className={inputClass} value={form.title} onChange={(ev) => set('title', ev.target.value)} placeholder="Event title" required />
                <select className={inputClass} value={form.type} onChange={(ev) => set('type', ev.target.value)}>
                  {['WORKSHOP', 'ZUMBA', 'YOGA', 'OUTDOOR', 'PERSONAL_TRAINING', 'OTHER'].map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
                <textarea className={inputClass} rows={3} value={form.description} onChange={(ev) => set('description', ev.target.value)} placeholder="Description" />
                <input className={inputClass} value={form.location} onChange={(ev) => set('location', ev.target.value)} placeholder="Venue / room" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Max capacity</label>
                    <input type="number" className={inputClass} value={form.seatLimit} onChange={(ev) => set('seatLimit', ev.target.value)} placeholder="e.g. 30" min="1" />
                  </div>
                  <div>
                    <label className={labelClass}>Ticket</label>
                    <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.isFree}
                        onChange={(ev) =>
                          setForm((f) => ({
                            ...f,
                            isFree: ev.target.checked,
                            price: ev.target.checked ? '' : f.price,
                          }))
                        }
                        className="h-4 w-4 rounded border-white/20 accent-primary-container"
                      />
                      Free event
                    </label>
                    {!form.isFree && (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className={inputClass}
                        value={form.price}
                        onChange={(ev) => set('price', ev.target.value)}
                        placeholder="Ticket price"
                        required
                      />
                    )}
                  </div>
                </div>
                <MediaFileDrop
                  label="Cover image"
                  hint="Drop image or browse"
                  accept="image/*"
                  preview={form.imageUrl || null}
                  uploading={uploadingImage}
                  inputRef={imageRef}
                  onFile={handleImageUpload}
                  onClear={() => set('imageUrl', '')}
                />
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Icon name="calendar_today" size={18} className="text-primary-container" /> Schedule
                </p>

                <div>
                  <label className={labelClass}>Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.eventDate}
                    onChange={(ev) => set('eventDate', ev.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Start time</label>
                    <input
                      type="time"
                      className={inputClass}
                      value={form.startTime}
                      onChange={(ev) => set('startTime', ev.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Duration</label>
                    <DurationStepper value={form.duration} onChange={(v) => set('duration', v)} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Repeat</label>
                  <select
                    className={inputClass}
                    value={form.recurrence}
                    onChange={(ev) => handleRecurrenceChange(ev.target.value)}
                  >
                    {RECURRENCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {form.recurrence !== 'NONE' && (
                  <div>
                    <label className={labelClass}>Repeat until</label>
                    <input
                      type="date"
                      className={inputClass}
                      value={form.recurrenceEndAt}
                      onChange={(ev) => set('recurrenceEndAt', ev.target.value)}
                      required
                      min={form.eventDate || undefined}
                    />
                  </div>
                )}

                {form.recurrence === 'WEEKLY' && (
                  <div>
                    <label className={labelClass}>Days of week</label>
                    <WeekdayCheckboxes
                      selected={form.recurrenceWeekdays}
                      onChange={(days) => set('recurrenceWeekdays', days)}
                    />
                  </div>
                )}

                {form.recurrence === 'MONTHLY' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Week of month</label>
                      <select
                        className={inputClass}
                        value={form.recurrenceWeekOfMonth}
                        onChange={(ev) => set('recurrenceWeekOfMonth', Number(ev.target.value))}
                      >
                        {WEEK_OF_MONTH_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Day of week</label>
                      <select
                        className={inputClass}
                        value={form.recurrenceDayOfWeek}
                        onChange={(ev) => set('recurrenceDayOfWeek', Number(ev.target.value))}
                      >
                        {WEEKDAY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
              <button type="button" onClick={onClose} className="rounded-lg px-5 py-2.5 text-sm hover:bg-white/5">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="cyber-glow rounded-lg bg-primary-container px-6 py-2.5 text-sm font-bold text-on-primary-container disabled:opacity-50"
              >
                {saving ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppModal>
  );
};

export default EventFormModal;
