import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ENDPOINTS from '../../config/apiUrls';
import { postRequest } from '../../config/dataApi';
import {
  SUPPORT_CATEGORIES,
  SUPPORT_EMAIL,
  getDefaultSupportForm,
  getSupportCategory,
} from '../../constants/supportTopics';
import GlassCard from './GlassCard';
import Icon from './Icon';

const inputClass =
  'input-cyber w-full rounded-lg border border-white/10 bg-surface-container-lowest px-3 py-2.5 text-sm';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-secondary';
const errorClass = 'mt-1 text-xs text-error';

const MIN_MESSAGE_LENGTH = 10;

const SupportTicketForm = ({
  initialCategory = 'GENERAL',
  initialSubject = '',
  initialMessage = '',
  onSubmitted,
  compact = false,
}) => {
  const { user } = useSelector((s) => s.auth);
  const defaults = useMemo(
    () => getDefaultSupportForm(initialCategory),
    [initialCategory]
  );

  const [form, setForm] = useState({
    category: initialCategory,
    subject: initialSubject || defaults.subject,
    message: initialMessage || defaults.message,
    replyEmail: user?.email || '',
  });
  const [sending, setSending] = useState(false);
  const [subjectTouched, setSubjectTouched] = useState(Boolean(initialSubject));
  const [messageTouched, setMessageTouched] = useState(Boolean(initialMessage));
  const [errors, setErrors] = useState({ subject: '', message: '' });

  const selectedCategory = useMemo(
    () => getSupportCategory(form.category),
    [form.category]
  );

  useEffect(() => {
    const nextDefaults = getDefaultSupportForm(initialCategory);
    setForm((prev) => ({
      ...prev,
      category: initialCategory,
      subject: initialSubject || nextDefaults.subject,
      message: initialMessage || nextDefaults.message,
      replyEmail: prev.replyEmail || user?.email || '',
    }));
    setSubjectTouched(Boolean(initialSubject));
    setMessageTouched(Boolean(initialMessage));
    setErrors({ subject: '', message: '' });
  }, [initialCategory, initialSubject, initialMessage, user?.email]);

  useEffect(() => {
    if (user?.email && !form.replyEmail) {
      setForm((prev) => ({ ...prev, replyEmail: user.email }));
    }
  }, [user?.email, form.replyEmail]);

  const applyCategoryDefaults = (categoryValue) => {
    const category = getSupportCategory(categoryValue);
    if (!category) return;

    setForm((prev) => ({
      ...prev,
      category: categoryValue,
      subject: subjectTouched ? prev.subject : category.defaultSubject,
      message: messageTouched ? prev.message : category.defaultMessage,
    }));
  };

  const validate = () => {
    const nextErrors = { subject: '', message: '' };
    if (!form.subject.trim()) {
      nextErrors.subject = 'Subject is required';
    }
    if (form.message.trim().length < MIN_MESSAGE_LENGTH) {
      nextErrors.message = `Message must be at least ${MIN_MESSAGE_LENGTH} characters`;
    }
    setErrors(nextErrors);
    return !nextErrors.subject && !nextErrors.message;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    if (field === 'subject') setSubjectTouched(true);
    if (field === 'message') setMessageTouched(true);
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryChange = (e) => {
    applyCategoryDefaults(e.target.value);
    setErrors({ subject: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);
    try {
      const res = await postRequest(ENDPOINTS.SUPPORT.TICKETS, {
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
        replyEmail: form.replyEmail.trim() || undefined,
      });
      toast.success(res.message || 'Support request sent');
      const resetDefaults = getDefaultSupportForm(form.category);
      setForm({
        category: form.category,
        subject: resetDefaults.subject,
        message: resetDefaults.message,
        replyEmail: user?.email || '',
      });
      setSubjectTouched(false);
      setMessageTouched(false);
      setErrors({ subject: '', message: '' });
      onSubmitted?.(res.data?.ticket);
    } catch {
      /* handled by api interceptor */
    } finally {
      setSending(false);
    }
  };

  const messageLength = form.message.trim().length;

  return (
    <GlassCard className={compact ? 'p-5' : 'p-6'}>
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Send a support request</h2>
        <p className="mt-1 text-sm text-secondary">
          Messages go to{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary-container hover:underline">
            {SUPPORT_EMAIL}
          </a>
          . Subject and message are pre-filled — edit them before sending.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className={labelClass} htmlFor="support-category">
            Category
          </label>
          <select
            id="support-category"
            className={inputClass}
            value={form.category}
            onChange={handleCategoryChange}
          >
            {SUPPORT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {selectedCategory?.description && (
            <p className="mt-1.5 text-xs text-secondary">{selectedCategory.description}</p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="support-subject">
            Subject
          </label>
          <input
            id="support-subject"
            type="text"
            className={`${inputClass}${errors.subject ? ' border-error-container/50' : ''}`}
            value={form.subject}
            onChange={handleChange('subject')}
            placeholder="Brief summary of your request"
            maxLength={200}
          />
          {errors.subject && <p className={errorClass}>{errors.subject}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="support-message">
            Message
          </label>
          <textarea
            id="support-message"
            className={`${inputClass} min-h-[180px] resize-y${errors.message ? ' border-error-container/50' : ''}`}
            value={form.message}
            onChange={handleChange('message')}
            placeholder="Describe your issue or request in detail..."
            maxLength={5000}
          />
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-xs text-secondary">
              {messageLength < MIN_MESSAGE_LENGTH
                ? `${MIN_MESSAGE_LENGTH - messageLength} more characters needed`
                : `${messageLength} characters`}
            </p>
            {errors.message && <p className={`${errorClass} text-right`}>{errors.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="support-reply-email">
            Reply-to email
          </label>
          <input
            id="support-reply-email"
            type="email"
            className={inputClass}
            value={form.replyEmail}
            onChange={handleChange('replyEmail')}
            placeholder="Where we should reply"
            required
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-fixed px-5 py-3 text-sm font-semibold text-on-primary-fixed transition hover:opacity-90 disabled:opacity-60"
        >
          <Icon name="send" size={18} />
          {sending ? 'Sending...' : 'Send support email'}
        </button>
      </form>
    </GlassCard>
  );
};

export default SupportTicketForm;
