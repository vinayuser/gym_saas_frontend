import { Link } from 'react-router-dom';
import Icon from '../../components/fitsphere/Icon';
import MarketingCta from '../../components/marketing/MarketingCta';
import MarketingSectionHeader from '../../components/marketing/MarketingSectionHeader';
import StatsBar from '../../components/marketing/StatsBar';
import {
  HOME_PLATFORM_MODULES,
  MARKETING_IMAGES,
  MARKETING_STATS,
  OWNER_ONBOARDING_STEPS,
  PRODUCT_NAME,
  SUPER_ADMIN_FEATURES,
} from '../../constants/marketingContent';

const Home = () => (
  <>
    <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <img
          src={MARKETING_IMAGES.hero}
          alt="Gym interior"
          className="h-full w-full object-cover opacity-40 grayscale"
        />
      </div>
      <div className="relative z-20 mx-auto max-w-4xl px-4 py-16 md:px-12">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-container/30 bg-primary-container/5 px-4 py-1">
          <Icon name="fitness_center" size={16} className="text-primary-container" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-container">
            For gym owners
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-on-surface md:text-6xl">
          Run every gym location from
          <br />
          <span className="text-primary-container">one owner portal</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-secondary">
          {PRODUCT_NAME} helps you run members, staff, classes, payments, and every branch from one
          login. Start with your first gym, then add locations and extra tools only when you need them.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/auth/login"
            className="neon-glow rounded-lg bg-primary-container px-8 py-3 text-center text-sm font-bold text-on-primary-container transition hover:scale-105"
          >
            Owner sign in
          </Link>
          <Link
            to="/pricing"
            className="rounded-lg border border-white/20 px-8 py-3 text-center text-sm font-medium transition hover:bg-white/5"
          >
            See pricing
          </Link>
        </div>
        <p className="mt-6 text-sm text-secondary">
          New gym owner? You need an invite from your platform admin—{' '}
          <Link to="/contact" className="text-primary-container hover:underline">
            contact us
          </Link>{' '}
          to get started.
        </p>
      </div>
    </section>

    <section className="border-b border-white/5 bg-surface px-4 md:px-12">
      <StatsBar stats={MARKETING_STATS} />
    </section>

    <section className="bg-surface px-4 py-20 md:px-12">
      <MarketingSectionHeader
        eyebrow="Owner portal"
        title="Everything in your sidebar"
        subtitle="The same tools you get after you sign in: members, money, classes, and your team."
      />
      <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {HOME_PLATFORM_MODULES.map((mod) => (
          <div
            key={mod.title}
            className="group rounded-xl border border-white/10 p-6 transition hover:border-primary-container"
          >
            <Icon
              name={mod.icon}
              size={32}
              className="mb-4 text-primary-container transition group-hover:scale-110"
            />
            <h4 className="font-semibold">{mod.title}</h4>
            <p className="mt-2 text-sm text-secondary">{mod.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-surface-container-low px-4 py-20 md:px-12">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <MarketingSectionHeader
            center={false}
            eyebrow="Dashboard"
            title="See your gym at a glance"
            subtitle="The owner dashboard shows active members, today's check-ins, monthly revenue, an attendance heatmap, memberships nearing expiry, and recent payments."
            className="text-left"
          />
          <ul className="mt-6 space-y-3 text-sm">
            {[
              'Active members & month-over-month growth',
              'Today’s check-ins vs peak capacity',
              'Monthly revenue from your finance data',
              'Attendance heatmap by hour (day / week)',
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Icon name="check_circle" size={18} className="shrink-0 text-primary-container" />
                {t}
              </li>
            ))}
          </ul>
          <Link
            to="/auth/login"
            className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-primary-container hover:underline"
          >
            Open owner dashboard
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: 'group', label: 'Active members', value: '—' },
            { icon: 'done_all', label: "Today's check-ins", value: '—' },
            { icon: 'payments', label: 'Monthly revenue', value: '—' },
            { icon: 'history', label: 'Attendance heatmap', value: 'Live' },
          ].map((card) => (
            <div key={card.label} className="glass-card rounded-xl p-5">
              <Icon name={card.icon} className="text-primary-container" />
              <p className="mt-3 text-xs uppercase text-secondary">{card.label}</p>
              <p className="text-xl font-bold">{card.value}</p>
              <p className="mt-1 text-[10px] text-secondary">From your gym, after you sign in</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="px-4 py-20 md:px-12">
      <MarketingSectionHeader
        eyebrow="For our team"
        title="Platform operator tools"
        subtitle="We look after new gyms joining FitSphere Pro and keep the platform running."
      />
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
        {SUPER_ADMIN_FEATURES.map((f) => (
          <div key={f.title} className="glass-card rounded-xl p-6 text-center">
            <Icon name={f.icon} size={36} className="mx-auto text-primary-container" />
            <h4 className="mt-4 font-semibold">{f.title}</h4>
            <p className="mt-2 text-sm text-secondary">{f.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="bg-surface-container-low px-4 py-20 md:px-12">
      <MarketingSectionHeader
        eyebrow="Onboarding"
        title="From invite link to live gym"
        subtitle="You tell us about your gym, pay the first month, and sign in the same day."
      />
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {OWNER_ONBOARDING_STEPS.map((s) => (
          <div key={s.step} className="glass-card relative rounded-xl p-6">
            <span className="font-display text-3xl font-bold text-primary-container/30">{s.step}</span>
            <h4 className="mt-2 font-semibold">{s.title}</h4>
            <p className="mt-2 text-sm text-secondary">{s.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="px-4 py-20 md:px-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-xl glass-card md:grid-cols-2">
        <div className="space-y-6 p-8 md:p-12">
          <h2 className="font-display text-3xl font-bold">Finances, inventory &amp; retail</h2>
          <p className="text-secondary">
            Track payments, expenses, P&amp;L, and ledger entries per gym. Run inventory and a member
            store for products your members can buy.
          </p>
          {[
            { icon: 'monitoring', title: 'Finance overview', sub: 'Revenue & expense summary' },
            { icon: 'receipt_long', title: 'Ledger & reports', sub: 'Payments, expenses, exports' },
            { icon: 'storefront', title: 'Member store', sub: 'Products linked to inventory' },
          ].map((row) => (
            <div
              key={row.title}
              className="flex items-center justify-between rounded-lg bg-white/5 p-4 transition hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <Icon name={row.icon} className="text-primary-container" />
                <div>
                  <p className="text-sm font-medium">{row.title}</p>
                  <p className="text-xs text-secondary">{row.sub}</p>
                </div>
              </div>
              <Icon name="chevron_right" size={20} className="text-secondary" />
            </div>
          ))}
        </div>
        <div className="relative min-h-[280px] bg-surface-container-high md:min-h-[360px]">
          <img
            src={MARKETING_IMAGES.retail}
            alt="Gym retail"
            className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale"
          />
        </div>
      </div>
    </section>

    <section className="bg-surface-container-low px-4 py-20 md:px-12">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {[
          {
            icon: 'lock',
            title: 'Safe sign-in',
            text: 'Owners and staff sign in with their own account. Sessions stay on that device until you log out.',
          },
          {
            icon: 'apartment',
            title: 'Your gym, your data',
            text: 'Members, payments, and staff stay with your gym. Other gyms cannot open them.',
          },
          {
            icon: 'cloud_upload',
            title: 'Photos in the app',
            text: 'Add your logo, banners, and product pictures so members see your gym, not a generic one.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-white/10 p-6 transition hover:border-primary-container"
          >
            <Icon name={f.icon} size={32} className="mb-4 text-primary-container" />
            <h4 className="font-semibold">{f.title}</h4>
            <p className="mt-2 text-sm text-secondary">{f.text}</p>
          </div>
        ))}
      </div>
    </section>

    <MarketingCta
      title="Ready to onboard your gym?"
      description="Tell us about your gym and we will send a private invite so you can set it up and pay for the first month."
      primaryLabel="Contact for access"
      primaryTo="/contact"
      secondaryLabel="View pricing"
      secondaryTo="/pricing"
    />
  </>
);

export default Home;
