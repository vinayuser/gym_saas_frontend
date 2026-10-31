import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Icon from '../../components/fitsphere/Icon';
import { CONTACT_CHANNELS } from '../../constants/marketingContent';
import ENDPOINTS from '../../config/apiUrls';
import { postRequest } from '../../config/dataApi';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-surface-container-lowest px-4 py-2.5 text-on-surface outline-none transition focus:border-primary-container';

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setSubmitting(true);
    try {
      await postRequest(ENDPOINTS.PUBLIC.CONTACT, {
        name: fd.get('name'),
        email: fd.get('email'),
        company: fd.get('company'),
        message: [fd.get('city') && `City: ${fd.get('city')}`, fd.get('message')].filter(Boolean).join('\n\n'),
      });
      toast.success('Message received — we will reply within 1–2 business days.');
      e.target.reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-4 md:px-12">
        <header className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-container">Contact</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">Tell us about your gym.</h1>
          <p className="mt-4 text-lg text-secondary">
            Gym name, city, and what you want to see. We reply in one or two business days. Already
            set up? Sign in and use Support inside the app.
          </p>
        </header>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {CONTACT_CHANNELS.map((ch) => (
            <div key={ch.label} className="rounded-xl border border-white/10 p-5">
              <Icon name={ch.icon} className="text-primary-container" />
              <p className="mt-3 text-xs font-semibold uppercase text-secondary">{ch.label}</p>
              <p className="mt-1 font-semibold">{ch.value}</p>
              <p className="text-xs text-secondary">{ch.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="rounded-2xl border border-white/10 p-8 lg:col-span-7">
            <h2 className="text-lg font-semibold">Send a message</h2>
            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-secondary" htmlFor="name">
                    Your name
                  </label>
                  <input required id="name" className={inputClass} name="name" placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-secondary" htmlFor="email">
                    Email
                  </label>
                  <input required id="email" type="email" className={inputClass} name="email" placeholder="you@gym.com" />
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-secondary" htmlFor="company">
                    Gym name
                  </label>
                  <input id="company" className={inputClass} name="company" placeholder="Iron District" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-secondary" htmlFor="city">
                    City
                  </label>
                  <input id="city" className={inputClass} name="city" placeholder="Pune" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-secondary" htmlFor="message">
                  What do you want to see?
                </label>
                <textarea
                  required
                  id="message"
                  name="message"
                  rows={6}
                  className={`${inputClass} resize-none`}
                  placeholder="White-label app, QR at the door, WhatsApp reminders, day pass…"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary-container py-3 text-sm font-bold text-on-primary-container disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-white/10 p-6">
              <p className="text-sm font-semibold">Already a customer?</p>
              <p className="mt-2 text-sm text-secondary">
                Sign in and open Support from the desk. That reaches us faster than this form.
              </p>
              <Link to="/auth/login" className="mt-4 inline-block text-sm font-semibold text-primary-container hover:underline">
                Owner sign in
              </Link>
            </div>
            <div className="rounded-2xl border border-white/10 p-6">
              <p className="text-sm font-semibold">Before you write</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-primary-container hover:underline">
                    What we offer
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-primary-container hover:underline">
                    Build a monthly total
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-primary-container hover:underline">
                    Common questions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
