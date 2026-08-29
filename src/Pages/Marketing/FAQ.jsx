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
  })).filter((cat) => (isSearching ? cat.items.length > 0 : true));

  const visibleCategories = isSearching
    ? filtered.filter((c) => c.items.length > 0)
    : filtered.filter((c) => c.id === activeCat);

  const selectCategory = (catId) => {
    setActiveCat(catId);
    setSearch('');
  };

  const categoryButtonClass = (catId) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
      activeCat === catId && !isSearching
        ? 'bg-primary-container text-on-primary-container'
        : 'border border-white/10 text-secondary hover:border-primary-container/40 hover:text-on-surface'
    }`;

  const sidebarButtonClass = (catId) =>
    `w-full rounded-xl px-4 py-3 text-left text-sm transition ${
      activeCat === catId && !isSearching
        ? 'glass-card font-semibold text-primary-container ring-1 ring-primary-container/25'
        : 'text-secondary hover:bg-white/5'
    }`;

  return (
    <main className="pb-0 pt-28">
      <div className="mx-auto max-w-6xl px-4 md:px-12">
        <section className="mb-14 md:mb-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-container">
              Knowledge base
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.15] tracking-tight text-balance md:text-5xl lg:text-6xl">
              Frequently asked{' '}
              <span className="text-primary-container">questions</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-secondary md:text-lg md:leading-8">
              Invites, Razorpay, plans, roles, attendance, and tenant data—search or browse by
              category.
            </p>
          </div>

          <div className="relative mx-auto mt-10 max-w-2xl">
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
              className="w-full rounded-full border border-white/10 bg-surface-container-low py-3.5 pl-12 pr-4 text-base outline-none transition focus:border-primary-container"
            />
          </div>

          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
            {FAQ_POPULAR_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setSearch(topic)}
                className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-secondary transition hover:border-primary-container hover:text-primary-container"
              >
                {topic}
              </button>
            ))}
          </div>
        </section>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => selectCategory(cat.id)}
              className={categoryButtonClass(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-28 space-y-2">
              <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-secondary">
                Categories
              </p>
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectCategory(cat.id)}
                  className={sidebarButtonClass(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="glass-card mt-8 rounded-xl p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/10">
                <Icon name="help" className="text-primary-container" />
              </div>
              <p className="mt-4 text-sm font-semibold">Need a human?</p>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Our ops team answers owner questions within one business day.
              </p>
              <Link
                to="/contact"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-container hover:underline"
              >
                Contact support
                <Icon name="arrow_forward" size={16} />
              </Link>
            </div>
          </aside>

          <div className="lg:col-span-9">
            {visibleCategories.length === 0 ? (
              <div className="glass-card rounded-xl px-6 py-16 text-center">
                <Icon name="search_off" size={40} className="mx-auto text-secondary/60" />
                <p className="mt-4 text-secondary">
                  No results for &ldquo;{search}&rdquo;. Try another term or browse a category.
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {visibleCategories.map((cat) => (
                  <section key={cat.id} id={cat.id}>
                    <div className="mb-6">
                      <span className="text-xs font-semibold uppercase tracking-widest text-primary-container">
                        {isSearching ? 'Search results' : 'Category'}
                      </span>
                      <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">{cat.label}</h2>
                    </div>

                    {cat.highlights?.length > 0 ? (
                      <div className="mb-8 grid gap-6 sm:grid-cols-2">
                        {cat.highlights.map((h) => (
                          <div
                            key={h.title}
                            className="group glass-card rounded-xl p-6 transition hover:border-primary-container/40"
                          >
                            <Icon
                              name={h.icon}
                              size={28}
                              className="mb-3 text-primary-container transition group-hover:scale-110"
                            />
                            <h3 className="font-semibold text-on-surface">{h.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-secondary">{h.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      {cat.items.map((item) => (
                        <FaqItem key={item.q} question={item.q} answer={item.a} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            <div className="mt-8 glass-card rounded-xl p-6 lg:hidden">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container/10">
                  <Icon name="help" className="text-primary-container" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Need a human?</p>
                  <p className="mt-1 text-sm text-secondary">
                    Our ops team answers owner questions within one business day.
                  </p>
                  <Link
                    to="/contact"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-container hover:underline"
                  >
                    Contact support
                    <Icon name="arrow_forward" size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="relative mt-20 overflow-hidden border-t border-white/10 bg-surface-container-lowest">
        <img
          src={MARKETING_IMAGES.faqCta}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/85 to-background" />
        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-16 text-center md:px-12 md:py-24">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
            Still have questions?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-secondary md:text-lg md:leading-8">
            Book a walkthrough with our team—we&apos;ll map FitSphere Pro to your exact workflow.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link
              to="/contact"
              className="neon-glow inline-flex min-w-[180px] items-center justify-center rounded-lg bg-primary-container px-8 py-3.5 text-sm font-bold text-on-primary-container transition hover:scale-[1.02]"
            >
              Contact us
            </Link>
            <Link
              to="/pricing"
              className="inline-flex min-w-[180px] items-center justify-center rounded-lg border border-white/20 px-8 py-3.5 text-sm font-bold transition hover:bg-white/5"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default FAQ;
