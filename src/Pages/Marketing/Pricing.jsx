import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest } from '../../config/dataApi';
import { formatCurrency } from '../../helpers/formatUtils';
import MarketingCta from '../../components/marketing/MarketingCta';
import MarketingSectionHeader from '../../components/marketing/MarketingSectionHeader';
import FaqItem from '../../components/marketing/FaqAccordion';
import { PRICING_FAQ } from '../../constants/marketingContent';

const FALLBACK = {
  baseName: 'First gym',
  basePriceMonthly: 1999,
  basePriceYearly: 19990,
  baseDescription: 'Members, staff, classes, finances, and your day-to-day gym tools.',
  extraGymPriceMonthly: 999,
  extraGymPriceYearly: 9990,
  addons: [
    {
      key: 'attendance',
      name: 'Attendance',
      description: 'QR and front-desk check-in for that gym.',
      pricePerGymMonthly: 1999,
      pricePerGymYearly: 19990,
    },
    {
      key: 'store',
      name: 'Member store',
      description: 'Sell products to members at that gym.',
      pricePerGymMonthly: 499,
      pricePerGymYearly: 4990,
    },
    {
      key: 'day_pass',
      name: 'Day pass',
      description: 'Members can book one day at another gym. You set that day’s price.',
      pricePerGymMonthly: 499,
      pricePerGymYearly: 4990,
    },
  ],
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const Stepper = ({ value, min, max, onChange, label }) => (
  <div className="inline-flex items-center rounded-lg border border-white/10 bg-surface-container-lowest">
    <button
      type="button"
      aria-label={`Fewer ${label}`}
      disabled={value <= min}
      onClick={() => onChange(clamp(value - 1, min, max))}
      className="px-3 py-2 text-lg text-on-surface disabled:opacity-30"
    >
      −
    </button>
    <span className="min-w-8 text-center text-sm font-semibold">{value}</span>
    <button
      type="button"
      aria-label={`More ${label}`}
      disabled={value >= max}
      onClick={() => onChange(clamp(value + 1, min, max))}
      className="px-3 py-2 text-lg text-on-surface disabled:opacity-30"
    >
      +
    </button>
  </div>
);

const Pricing = () => {
  const [catalog, setCatalog] = useState(FALLBACK);
  const [yearly, setYearly] = useState(false);
  const [gymCount, setGymCount] = useState(1);
  const [toolGyms, setToolGyms] = useState({});

  const priceOf = (monthly, yearlyPrice) => (yearly ? Number(yearlyPrice) : Number(monthly));
  const period = yearly ? 'year' : 'month';

  useEffect(() => {
    getRequest(ENDPOINTS.PLATFORM_BILLING.PUBLIC)
      .then((res) => {
        if (res.data?.catalog) setCatalog(res.data.catalog);
      })
      .catch(() => {});
  }, []);

  const addons = catalog.addons.filter((addon) => addon.isActive !== false);
  const extraGyms = Math.max(0, gymCount - 1);

  const setToolCount = (key, count) => {
    setToolGyms((current) => ({ ...current, [key]: clamp(count, 0, gymCount) }));
  };

  const changeGymCount = (next) => {
    setGymCount(next);
    setToolGyms((current) => {
      const trimmed = {};
      Object.entries(current).forEach(([key, count]) => {
        trimmed[key] = clamp(count, 0, next);
      });
      return trimmed;
    });
  };

  const quote = useMemo(() => {
    const lines = [{ label: 'First gym', amount: priceOf(catalog.basePriceMonthly, catalog.basePriceYearly) }];
    if (extraGyms > 0) {
      lines.push({
        label: `Extra gym × ${extraGyms}`,
        amount: extraGyms * priceOf(catalog.extraGymPriceMonthly, catalog.extraGymPriceYearly),
      });
    }
    addons.forEach((addon) => {
      const count = clamp(toolGyms[addon.key] || 0, 0, gymCount);
      if (count < 1) return;
      lines.push({
        label: `${addon.name} × ${count} gym${count === 1 ? '' : 's'}`,
        amount: count * priceOf(addon.pricePerGymMonthly, addon.pricePerGymYearly),
      });
    });
    const total = lines.reduce((sum, line) => sum + line.amount, 0);
    return { lines, total };
  }, [addons, catalog, extraGyms, gymCount, toolGyms, yearly]);

  return (
    <>
      <section className="mesh-gradient px-4 pb-8 pt-32 text-center md:px-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary-container">
          Simple monthly pricing
        </span>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          Pay for the gyms you <span className="text-primary-container">actually run</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary">
          Your first gym is one price. Every extra branch costs less. Tools such as check-in and
          the shop are optional, and you only pay for the gyms where you turn them on.
        </p>
        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/10 bg-surface-container p-1">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              yearly ? 'text-secondary' : 'bg-primary-fixed text-on-primary-fixed'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              yearly ? 'bg-primary-fixed text-on-primary-fixed' : 'text-secondary'
            }`}
          >
            Yearly
          </button>
        </div>
      </section>

      <section className="px-4 pb-6 md:px-12">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-primary-container/40 bg-primary-container/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-container">Your plan</p>
            <h2 className="mt-2 font-display text-2xl font-bold">First gym</h2>
            <p className="mt-3">
              <span className="text-4xl font-bold text-primary-container">{formatCurrency(priceOf(catalog.basePriceMonthly, catalog.basePriceYearly))}</span>
              <span className="text-secondary"> / {period}</span>
            </p>
            <p className="mt-3 text-sm text-secondary">
              {catalog.baseDescription || 'Members, staff, classes, leads, finances, and chat.'}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 p-6 glass-card">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Same plan, another branch</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Each extra gym</h2>
            <p className="mt-3">
              <span className="text-4xl font-bold text-on-surface">{formatCurrency(priceOf(catalog.extraGymPriceMonthly, catalog.extraGymPriceYearly))}</span>
              <span className="text-secondary"> / {period}</span>
            </p>
            <p className="mt-3 text-sm text-secondary">
              Added to the same bill. Same login, its own members and staff. Not a different package.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-12">
        <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold">Optional tools</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-secondary">
              These are not plans. Choose how many of your gyms should have each tool. The total updates beside the list.
            </p>
            <div className="mt-6 space-y-3">
              {addons.map((addon) => {
                const count = clamp(toolGyms[addon.key] || 0, 0, gymCount);
                const on = count > 0;
                return (
                  <div key={addon.key} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{addon.name}</p>
                        <p className="mt-1 text-sm text-secondary">{addon.description}</p>
                        <p className="mt-2 text-sm text-primary-container">
                          {formatCurrency(priceOf(addon.pricePerGymMonthly, addon.pricePerGymYearly))} per gym / {period}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs uppercase text-secondary">Gyms</span>
                        <Stepper
                          label={addon.name}
                          value={count}
                          min={0}
                          max={gymCount}
                          onChange={(next) => setToolCount(addon.key, next)}
                        />
                        <span className={`text-xs font-semibold ${on ? 'text-primary-container' : 'text-secondary'}`}>
                          {on ? 'On' : 'Off'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-white/10 bg-surface-container p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-bold">{yearly ? 'Your year' : 'Your month'}</h2>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">How many gyms?</p>
                <p className="text-xs text-secondary">Includes your first gym</p>
              </div>
              <Stepper label="gyms" value={gymCount} min={1} max={20} onChange={changeGymCount} />
            </div>
            <ul className="mt-6 divide-y divide-white/10 text-sm">
              {quote.lines.map((line) => (
                <li key={line.label} className="flex justify-between gap-4 py-2">
                  <span className="text-secondary">{line.label}</span>
                  <span>{formatCurrency(line.amount)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-secondary">Estimated total</span>
              <span className="font-display text-3xl font-bold text-primary-container">
                {formatCurrency(quote.total)}
              </span>
            </div>
            <p className="mt-1 text-right text-xs text-secondary">
              per {period}, in rupees
            </p>
            <Link
              to="/contact"
              className="neon-glow mt-6 block rounded-lg bg-primary-fixed py-3 text-center text-sm font-bold text-on-primary-fixed"
            >
              Talk to us about this total
            </Link>
          </aside>
        </div>
      </section>

      <section className="bg-surface-container-lowest px-4 py-16 md:px-12">
        <MarketingSectionHeader eyebrow="Pricing questions" title="Common questions" />
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {PRICING_FAQ.map((item) => (
            <FaqItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>

      <MarketingCta description="Want FitSphere Pro for your gym? Tell us about your locations and we will send an invite." />
    </>
  );
};

export default Pricing;
