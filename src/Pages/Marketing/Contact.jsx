import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Icon from '../../components/fitsphere/Icon';
import { CONTACT_CHANNELS, MARKETING_IMAGES } from '../../constants/marketingContent';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-surface-container-lowest px-4 py-2.5 text-on-surface outline-none transition focus:border-primary-container';

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Message received — our team will respond within 24 hours.');
      e.target.reset();
    }, 800);
  };

  return (
    <main className="pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-4 md:px-12">
        <header className="mb-12 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-container">
            We&apos;re listening
          </span>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
            Elevate your <span className="text-primary-container">connection.</span>
          </h1>
          <p className="mt-4 text-lg text-secondary">
            Ask about gym owner invites, SaaS plans, or a demo of the owner and super admin
            dashboards. Existing owners should use in-app Support after login.
          </p>
        </header>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_CHANNELS.map((ch) => (
            <div key={ch.label} className="glass-card rounded-xl p-5">
              <Icon name={ch.icon} className="text-primary-container" />
              <p className="mt-3 text-xs font-semibold uppercase text-secondary">{ch.label}</p>
              <p className="mt-1 font-semibold">{ch.value}</p>
              <p className="text-xs text-secondary">{ch.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="glass-card rounded-xl p-8 lg:col-span-7">
            <h2 className="text-lg font-semibold">Send a message</h2>
            <p className="mt-1 text-sm text-secondary">
              Tell us about your studios, member count, and timeline—we&apos;ll route you to the right specialist.
            </p>
            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-secondary">
                    Full name
                  </label>
                  <input required className={inputClass} name="name" placeholder="John Doe" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-secondary">
                    Work email
                  </label>
                  <input
                    required
                    type="email"
                    className={inputClass}
                    name="email"
                    placeholder="john@studio.com"
                  />
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-secondary">
                    Studio / company
                  </label>
                  <input className={inputClass} name="company" placeholder="Pulse Collective" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-secondary">
                    Branches
                  </label>
                  <select className={inputClass} name="branches" defaultValue="1">
                    <option value="1">1 location</option>
                    <option value="2-5">2–5 locations</option>
                    <option value="5+">5+ locations</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-secondary">
                  Inquiry type
                </label>
                <select className={inputClass} name="type" defaultValue="Enterprise Solutions">
                  <option>Book a demo</option>
                  <option>Enterprise Solutions</option>
                  <option>Boutique Partnership</option>
                  <option>Technical Support</option>
                  <option>Billing &amp; Accounts</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-secondary">
                  Message
                </label>
                <textarea
                  required
                  name="message"
                  rows={6}
                  className={`${inputClass} resize-none`}
                  placeholder="Describe your performance goals, current tools, and go-live timeline..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="cyber-glow w-full rounded-lg bg-primary-container py-3 text-sm font-bold text-on-primary-container disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="glass-card space-y-6 rounded-xl p-6">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 animate-pulse rounded-full bg-primary-container" />
                <span className="text-sm font-semibold uppercase tracking-wide text-primary-container">
                  Live chat active
                </span>
              </div>
              <p className="text-sm text-secondary">
                Existing customers: use in-app support from your owner dashboard for fastest resolution.
              </p>
              <div className="flex gap-4">
                <div className="rounded-lg bg-surface-container-high p-3">
                  <Icon name="encrypted" className="text-primary-container" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-secondary">Priority support</p>
                  <p className="font-semibold text-primary-container">ops@fitspherepro.io</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="rounded-lg bg-surface-container-high p-3">
                  <Icon name="info" className="text-primary-container" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-secondary">Demo accounts</p>
                  <p className="text-sm text-secondary">
                    See README for super admin and owner demo credentials (local development).
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-semibold">Quick links</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link to="/pricing" className="text-primary-container hover:underline">
                    View pricing →
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-primary-container hover:underline">
                    Browse FAQ →
                  </Link>
                </li>
                <li>
                  <Link to="/auth/login" className="text-primary-container hover:underline">
                    Owner sign in →
                  </Link>
                </li>
              </ul>
            </div>

            <div className="relative h-72 overflow-hidden rounded-xl glass-card">
              <img
                src={MARKETING_IMAGES.contactMap}
                alt="Austin HQ map"
                className="h-full w-full object-cover brightness-50 grayscale"
              />
              <div className="absolute bottom-4 left-4 glass-card rounded-lg px-4 py-2 text-xs text-primary-container">
                Gym SaaS platform
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
