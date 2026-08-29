import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/fitsphere/Icon';
import FaqItem from '../../components/marketing/FaqAccordion';
import {
  FAQ_CATEGORIES,
  FAQ_POPULAR_TOPICS,
  MARKETING_IMAGES,
} from '../../constants/marketingContent';

const FAQ = () => {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('general');

  const q = search.trim().toLowerCase();
  const isSearching = q.length > 0;

  const filtered = FAQ_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !isSearching ||
        item.q.toLowerCase().includes(q) ||
        item.a.toLowerCase().includes(q)
    ),
  })).filter((cat) => isSearching ? cat.items.length > 0 : true);

  const visibleCategories = isSearching
    ? filtered.filter((c) => c.items.length > 0)
    : filtered.filter((c) => c.id === activeCat);

  return (
    <main className="pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-4 md:px-12">
        <section className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-container">
            Knowledge base
          </span>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
            Frequently asked <span className="text-primary-container">questions</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-secondary">
            Invites, Razorpay, plans, roles, attendance, and tenant data—search or browse by category.
          </p>
          <div className="relative mx-auto mt-8 max-w-2xl">
            <Icon
              name="search"
              size={22}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search onboarding, billing, technical..."
              className="w-full rounded-full border border-white/10 bg-surface-container-low py-3 pl-12 pr-4 outline-none focus:border-primary-container"
            />
          </div>
          <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
            {FAQ_POPULAR_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setSearch(topic)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-secondary transition hover:border-primary-container hover:text-primary-container"
              >
                {topic}
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="sticky top-28 space-y-2">
              <p className="mb-2 px-4 text-xs font-semibold uppercase text-secondary">Categories</p>
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCat(cat.id);
                    setSearch('');
                  }}
                  className={`w-full rounded-lg px-4 py-2 text-left text-sm transition ${
                    activeCat === cat.id && !isSearching
                      ? 'border-l-4 border-primary-container glass-card font-bold text-primary-container'
                      : 'text-secondary hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="mt-8 glass-card rounded-xl p-5">
              <Icon name="help" className="text-primary-container" />
              <p className="mt-2 text-sm font-semibold">Need a human?</p>
              <p className="mt-1 text-xs text-secondary">
                Our ops team answers owner questions within one business day.
              </p>
              <Link
                to="/contact"
                className="mt-3 inline-block text-sm font-semibold text-primary-container hover:underline"
              >
                Contact support →
              </Link>
            </div>
          </aside>

          <div className="space-y-12 lg:col-span-9">
            {visibleCategories.length === 0 && (
              <p className="text-center text-secondary">No results for &ldquo;{search}&rdquo;. Try another term.</p>
            )}
            {visibleCategories.map((cat) => (
              <section key={cat.id} id={cat.id}>
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-0.5 w-8 bg-primary-container" />
                  <h2 className="text-2xl font-bold">{cat.label}</h2>
                </div>
                {cat.highlights && (
                  <div className="mb-6 grid gap-4 md:grid-cols-2">
                    {cat.highlights.map((h) => (
                      <div
                        key={h.title}
                        className="glass-card rounded-xl border-l-4 border-primary-container p-5"
                      >
                        <Icon name={h.icon} className="mb-2 text-primary-container" />
                        <h3 className="font-semibold">{h.title}</h3>
                        <p className="mt-1 text-sm text-secondary">{h.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-3">
                  {cat.items.map((item) => (
                    <FaqItem key={item.q} question={item.q} answer={item.a} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <section className="relative mt-16 overflow-hidden rounded-2xl p-10 text-center">
          <img
            src={MARKETING_IMAGES.faqCta}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-transparent" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl font-bold">Still have questions?</h2>
            <p className="mx-auto mt-2 max-w-xl text-secondary">
              Book a walkthrough with our team—we&apos;ll map FitSphere Pro to your exact workflow.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="rounded-full bg-primary-container px-8 py-3 text-sm font-bold text-on-primary-container"
              >
                Contact us
              </Link>
              <Link
                to="/pricing"
                className="rounded-full border border-white/20 px-8 py-3 text-sm font-bold hover:bg-white/5"
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default FAQ;
