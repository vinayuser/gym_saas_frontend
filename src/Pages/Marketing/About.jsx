import { Link } from 'react-router-dom';
import Icon from '../../components/fitsphere/Icon';
import MarketingCta from '../../components/marketing/MarketingCta';
import MarketingSectionHeader from '../../components/marketing/MarketingSectionHeader';
import StatsBar from '../../components/marketing/StatsBar';
import {
  ABOUT_VALUES,
  MARKETING_IMAGES,
  MARKETING_STATS,
  OWNER_ONBOARDING_STEPS,
  PLATFORM_ROLES,
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
  SUPER_ADMIN_FEATURES,
} from '../../constants/marketingContent';

const About = () => (
  <>
    <header className="relative min-h-[60vh] overflow-hidden pt-20">
      <div className="absolute inset-0">
        <img
          src={MARKETING_IMAGES.aboutHero}
          alt=""
          className="h-full w-full object-cover opacity-40 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 md:px-12">
        <span className="mb-4 inline-block rounded-full border border-primary-container/30 bg-primary-container/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary-container">
          About the platform
        </span>
        <h1 className="font-display text-4xl font-bold md:text-6xl">
          {PRODUCT_NAME}
        </h1>
        <p className="mt-4 text-xl text-primary-container">{PRODUCT_TAGLINE}</p>
        <p className="mt-6 max-w-2xl text-lg text-secondary">
          Built as a production-grade Gym Management SaaS: Node.js API, PostgreSQL, Prisma,
          multi-tenant middleware, and a React owner dashboard. Super admins onboard paying gym
          owners; owners run members, staff, finances, and daily operations.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/pricing"
            className="neon-glow rounded-lg bg-primary-container px-6 py-2.5 text-sm font-bold text-on-primary-container"
          >
            SaaS pricing
          </Link>
          <Link
            to="/auth/login"
            className="rounded-lg border border-white/20 px-6 py-2.5 text-sm font-medium hover:bg-white/5"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>

    <section className="border-b border-white/5 px-4 md:px-12">
      <StatsBar stats={MARKETING_STATS} />
    </section>

    <section className="px-4 py-20 md:px-12">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold">What we solve</h2>
          <p className="mt-4 leading-relaxed text-secondary">
            Independent gyms and small chains often juggle spreadsheets, WhatsApp, and separate
            billing tools. {PRODUCT_NAME} centralizes the workflows your team already does—member
            sign-up, renewals, check-ins, staff, money in/out, and promotions—in one tenant-aware
            system.
          </p>
          <p className="mt-4 leading-relaxed text-secondary">
            The platform is designed for the Indian market (INR plans, Razorpay, GST fields on gyms)
            but works for any operator who needs multi-branch control under one owner account.
          </p>
        </div>
        <div className="overflow-hidden rounded-xl glass-card p-2">
          <img
            src={MARKETING_IMAGES.aboutMission}
            alt=""
            className="aspect-square w-full rounded-lg object-cover grayscale transition duration-700 hover:grayscale-0"
          />
        </div>
      </div>
    </section>

    <section className="bg-surface-container-lowest px-4 py-20 md:px-12">
      <MarketingSectionHeader
        title="How the product is structured"
        subtitle="Two main experiences: platform admin (SaaS operator) and gym owner (your business)."
      />
      <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-8">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold">
            <Icon name="admin_panel_settings" className="text-primary-container" />
            Super admin
          </h3>
          <ul className="mt-6 space-y-4">
            {SUPER_ADMIN_FEATURES.map((f) => (
              <li key={f.title} className="flex gap-3 text-sm">
                <Icon name={f.icon} size={20} className="shrink-0 text-primary-container" />
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-secondary">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-secondary">
            Demo login: superadmin@gymsaas.com (see project README).
          </p>
        </div>
        <div className="glass-card rounded-xl p-8">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold">
            <Icon name="fitness_center" className="text-primary-container" />
            Gym owner portal
          </h3>
          <p className="mt-4 text-sm text-secondary">
            After invite onboarding, owners manage:
          </p>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {[
              'Dashboard',
              'Members',
              'Staff',
              'Membership plans',
              'Attendance',
              'Events',
              'Leads',
              'Inventory',
              'Member store',
              'Finances',
              'Trainers',
              'Gyms & branches',
              'Banners',
              'Community chat',
              'Subscription',
              'Settings',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Icon name="check" size={16} className="text-primary-container" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section className="px-4 py-20 md:px-12">
      <MarketingSectionHeader title="User roles" subtitle="Role-based access across the platform." />
      <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORM_ROLES.map((r) => (
          <div
            key={r.role}
            className="group glass-card rounded-xl p-6 transition hover:border-primary-container/40"
          >
            <Icon
              name={r.icon}
              size={32}
              className="mb-4 text-primary-container transition group-hover:scale-110"
            />
            <h4 className="font-semibold text-on-surface">{r.role}</h4>
            <p className="mt-2 text-sm leading-relaxed text-secondary">{r.desc}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-surface-container-low px-4 py-20 md:px-12">
      <MarketingSectionHeader
        title="Owner onboarding flow"
        subtitle="Same steps as the /setup/:token wizard in the app."
      />
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {OWNER_ONBOARDING_STEPS.map((s) => (
          <div key={s.step} className="glass-card rounded-xl p-6">
            <span className="text-2xl font-bold text-primary-container/40">{s.step}</span>
            <h4 className="mt-2 font-semibold">{s.title}</h4>
            <p className="mt-2 text-sm text-secondary">{s.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="px-4 py-20 md:px-12">
      <MarketingSectionHeader title="Principles" />
      <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2">
        {ABOUT_VALUES.map((v) => (
          <div key={v.title} className="glass-card rounded-xl p-6">
            <Icon name={v.icon} size={40} className="mb-4 text-primary-container/60" />
            <h3 className="text-lg font-semibold text-primary-container">{v.title}</h3>
            <p className="mt-2 text-sm text-secondary">{v.text}</p>
          </div>
        ))}
      </div>
    </section>

    <MarketingCta
      title="Questions about the platform?"
      description="Ask about invites, plans, or a walkthrough of the owner dashboard."
      primaryLabel="Contact us"
      primaryTo="/contact"
      secondaryLabel="Read FAQ"
      secondaryTo="/faq"
    />
  </>
);

export default About;
