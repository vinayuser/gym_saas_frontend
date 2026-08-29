import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/fitsphere/Icon';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest } from '../../config/dataApi';
import { SAAS_PLANS } from '../../constants/saasPlans';
import { formatCurrency } from '../../helpers/formatUtils';
import MarketingCta from '../../components/marketing/MarketingCta';
import MarketingSectionHeader from '../../components/marketing/MarketingSectionHeader';
import FaqItem from '../../components/marketing/FaqAccordion';
import { PRICING_COMPARE_ROWS, PRICING_FAQ } from '../../constants/marketingContent';

const Pricing = () => {
  const [plans, setPlans] = useState(SAAS_PLANS);
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    getRequest(ENDPOINTS.INVITES.PLANS)
      .then((res) => {
        const apiPlans = res.data?.plans;
        if (apiPlans?.length) {
          setPlans(
            apiPlans.map((p) => ({
              id: p.id,
              name: p.name,
              gymLimit: p.gymLimit,
              priceMonthly: Number(p.priceMonthly),
              priceYearly: Number(p.priceYearly),
              description:
                p.gymLimit === -1
                  ? 'Enterprise-scale footprint with no branch cap.'
                  : `Up to ${p.gymLimit} gym branch${p.gymLimit === 1 ? '' : 'es'}.`,
              features: [
                p.gymLimit === -1 ? 'Unlimited gym locations' : `${p.gymLimit} gym location(s)`,
                'Members, plans & QR attendance',
                'Staff, trainers, events & leads',
                'Finances, inventory & member store',
                'Banners, chat & owner dashboard',
              ],
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const planNames = plans.map((p) => p.name);

  return (
    <>
      <section className="mesh-gradient px-4 pb-8 pt-32 text-center md:px-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary-container">
          Transparent SaaS
        </span>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
          Plans built for <span className="text-primary-container">every scale</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-secondary">
          SaaS subscription tiers by number of gym locations. Prices in INR. Owners activate only
          through a super admin invite and Razorpay checkout—all owner portal features are included.
        </p>
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-surface-container p-1">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              !annual ? 'bg-primary-container text-on-primary-container' : 'text-secondary'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              annual ? 'bg-primary-container text-on-primary-container' : 'text-secondary'
            }`}
          >
            Annual
            <span className="ml-1 text-xs opacity-80">(save ~17%)</span>
          </button>
        </div>
      </section>

      <section className="px-4 pb-12 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, idx) => {
            const price = annual ? plan.priceYearly / 12 : plan.priceMonthly;
            const displayPrice = annual ? plan.priceYearly : plan.priceMonthly;
            return (
              <div
                key={plan.id || plan.name}
                className={`flex flex-col rounded-xl border p-6 transition ${
                  idx === 1
                    ? 'border-primary-container bg-primary-container/5 ring-1 ring-primary-container/40'
                    : 'border-white/10 glass-card hover:border-primary-container/40'
                }`}
              >
                {idx === 1 && (
                  <span className="mb-3 self-start rounded-full bg-primary-container px-3 py-0.5 text-xs font-bold text-on-primary-container">
                    Most popular
                  </span>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-3xl font-bold text-primary-container">
                    {formatCurrency(Math.round(price))}
                  </span>
                  <span className="text-secondary">/mo</span>
                </p>
                {annual && (
                  <p className="text-xs text-secondary">
                    Billed {formatCurrency(displayPrice)} yearly
                  </p>
                )}
                <p className="mt-2 text-sm text-secondary">{plan.description}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-secondary">
                  {(plan.features || []).map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Icon name="check_circle" size={16} className="shrink-0 text-primary-container" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`mt-8 block rounded-lg py-2.5 text-center text-sm font-bold ${
                    idx === 1
                      ? 'bg-primary-container text-on-primary-container neon-glow'
                      : 'border border-white/20 hover:bg-white/5'
                  }`}
                >
                  {idx === plans.length - 1 ? 'Contact enterprise' : 'Get started'}
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-secondary">
          Super admins assign plans when sending gym owner invites. Need custom SLAs or white-label?
          We&apos;ll tailor Unlimited for your network.
        </p>
      </section>

      <section className="bg-surface-container-low px-4 py-20 md:px-12">
        <MarketingSectionHeader
          eyebrow="Compare"
          title="Feature breakdown"
          subtitle="See what ships with each tier before you book a demo."
        />
        <div className="mx-auto mt-12 max-w-6xl overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 pr-4 font-semibold text-secondary">Feature</th>
                {planNames.map((name) => (
                  <th key={name} className="px-3 py-4 text-center font-semibold">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRICING_COMPARE_ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-white/5">
                  <td className="py-4 pr-4 text-secondary">{row.feature}</td>
                  {row.values.map((val, i) => (
                    <td key={i} className="px-3 py-4 text-center">
                      {typeof val === 'boolean' ? (
                        val ? (
                          <Icon name="check_circle" size={20} className="mx-auto text-primary-container" />
                        ) : (
                          <span className="text-secondary/40">—</span>
                        )
                      ) : (
                        <span className={val === 'Unlimited' ? 'font-semibold text-primary-container' : ''}>
                          {val}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="px-4 py-16 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {[
            { icon: 'verified_user', title: 'Razorpay activation', text: 'First SaaS payment completes owner tenant setup.' },
            { icon: 'cloud_upload', title: 'Cloudinary media', text: 'Upload logos and banners during invite setup.' },
            { icon: 'apartment', title: 'Multi-tenant', text: 'Each paying owner gets an isolated tenant and gym record(s).' },
          ].map((b) => (
            <div key={b.title} className="glass-card rounded-xl p-6 text-center">
              <Icon name={b.icon} size={32} className="mx-auto text-primary-container" />
              <h4 className="mt-3 font-semibold">{b.title}</h4>
              <p className="mt-2 text-sm text-secondary">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-lowest px-4 py-16 md:px-12">
        <MarketingSectionHeader eyebrow="Pricing FAQ" title="Common questions" />
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {PRICING_FAQ.map((item) => (
            <FaqItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>

      <MarketingCta description="Need a custom enterprise agreement? Talk to our sales team." />
    </>
  );
};

export default Pricing;
