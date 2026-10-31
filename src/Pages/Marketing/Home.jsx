import { Link } from 'react-router-dom';
import Icon from '../../components/fitsphere/Icon';
import MarketingCta from '../../components/marketing/MarketingCta';
import PhoneShot from '../../components/marketing/PhoneShot';
import { MARKETING_IMAGES, PRODUCT_NAME } from '../../constants/marketingContent';

const OFFER = [
  { value: 'Included', label: 'White-label app', sub: 'Your name and logo on their phone' },
  { value: 'Included', label: 'Team logins', sub: 'Owner, manager, desk, trainer — each their job' },
  { value: 'Included', label: 'WhatsApp follow-up', sub: 'Expiry, dues, birthdays, no-shows' },
  { value: 'Included', label: 'Payments & GST', sub: 'Collect, due, refund, tax invoice' },
  { value: '₹1,999', label: 'QR & attendance', sub: 'Door scan, per gym, when you want it' },
];

const FEATURES = [
  {
    id: 'app',
    eyebrow: 'White-label member app',
    title: 'Create your own app for your gym.',
    text: 'Members open your gym — your name, logo, and colours. Not a shared marketplace. Not FitSphere on the home screen.',
    points: [
      'Splash, home, and profile carry your brand',
      'They see their plan, slot, classes, and shop',
      'Included with the first gym. No extra branding fee',
    ],
    images: [
      { src: MARKETING_IMAGES.memberAppSplash, alt: 'Gym-branded splash screen' },
      { src: MARKETING_IMAGES.memberAppHome, alt: 'Member home with plan and classes' },
    ],
  },
  {
    id: 'team',
    eyebrow: 'Your team',
    title: 'You decide who sees the books.',
    text: 'A gym is not one login. You add the people who work the floor. Each person signs in as themselves. Reception collects. A trainer sees their members. Only you open GST, branches, and the monthly bill.',
    points: [
      'Add a manager, front desk, or trainer from the desk',
      'Each login stays in its lane — no shared password on a sticky note',
      'Included with the first gym. No per-seat fee',
    ],
    roles: [
      {
        role: 'You, the owner',
        can: 'Members, money, GST, branches, and who is on the team.',
        cannot: 'You keep the company bill and gym settings.',
      },
      {
        role: 'Manager',
        can: 'Day-to-day: members, the floor, staff, leads, events, and collections.',
        cannot: 'Does not open your subscription or add a new branch.',
      },
      {
        role: 'Front desk',
        can: 'Check-in, collect, renew, look up a member, take a walk-in.',
        cannot: 'Does not see profit & loss or gym settings.',
      },
      {
        role: 'Trainer',
        can: 'The members they train and the sessions they run.',
        cannot: 'Does not see the gym’s books or other trainers’ pay.',
      },
    ],
  },
  {
    id: 'members',
    eyebrow: 'Members & plans',
    title: 'Every member has a plan, a status, and a next date.',
    text: 'Add a person. Put them on a plan you priced. Freeze if they travel. Renew when the date comes. The desk sees who is active, who is due, and who walked in as a lead and never joined.',
    points: [
      'Your plans — duration, price, and what they include',
      'Active, frozen, expired — not a spreadsheet of colours',
      'Members open the same plan on your app',
    ],
    images: [{ src: MARKETING_IMAGES.memberAppMembership, alt: 'Membership details and next renewal' }],
  },
  {
    id: 'attendance',
    eyebrow: 'Attendance & QR',
    title: 'Scan at the door. See who trained today.',
    text: 'Each member carries a QR pass. The desk scans it. You get a live list and a monthly attendance picture — who came, who skipped.',
    points: [
      'QR pass on the member phone',
      'Today’s check-ins on the desk',
      '₹1,999 per gym / month — only where you switch it on',
    ],
    images: [
      { src: MARKETING_IMAGES.memberAppQr, alt: 'Member check-in QR pass' },
      { src: MARKETING_IMAGES.memberAppAttendance, alt: 'Attendance history and monthly target' },
    ],
  },
  {
    id: 'whatsapp',
    eyebrow: 'WhatsApp integration',
    title: 'Reminders go to WhatsApp. Not a notebook.',
    text: 'Expiry, pending dues, birthdays, and members who have not walked in. Send one, or let the morning job run. SMS and email if you prefer.',
    points: [
      'Membership ending this week',
      'Balance still due on the member',
      'Class and event reminders on their phone',
    ],
    images: [{ src: MARKETING_IMAGES.memberAppAlerts, alt: 'Member alerts for dues, classes, and events' }],
    messages: [
      { title: 'WhatsApp · Riya', body: 'Elite ends in 3 days. Renew at the desk today.' },
      { title: 'WhatsApp · Arjun', body: '₹2,499 is still due on your plan.' },
    ],
  },
  {
    id: 'payments',
    eyebrow: 'Payments',
    title: 'Collect today. Leave the rest due. Hand over a bill.',
    text: 'Cash, UPI, or card. Part-pay is normal. Due stays on the member until you take it. GSTIN on file: tax invoice with CGST and SGST. No GSTIN: a clean receipt. Record rent and salaries. See whether the month made money.',
    points: [
      'Plan price stays tax-inclusive',
      'Refunds sit against a real payment',
      'Expenses, invoices, and a profit & loss for the gym',
    ],
    images: [{ src: MARKETING_IMAGES.memberAppPay, alt: 'Payment confirmation on the member app' }],
  },
  {
    id: 'daypass',
    eyebrow: 'Day pass',
    title: 'A guest trains for one day. You set the price.',
    text: 'Travellers, trials, and friends of members. They pick the day, pay, and walk in. Useful when you do not want a full membership yet.',
    points: [
      'You set that day’s price',
      'They book from the phone',
      '₹499 per gym / month, only if you turn it on',
    ],
    images: [{ src: MARKETING_IMAGES.memberAppDayPass, alt: 'Day pass booking with date and price' }],
  },
  {
    id: 'events',
    eyebrow: 'Events & classes',
    title: 'Put the week on the phone. Let them join from there.',
    text: 'Workshops, HIIT, nutrition talks. You schedule it. Members see time, seats, and coach — then join. No poster at reception that nobody reads.',
    points: [
      'Schedule from the desk',
      'Members join on the app',
      'Included with the first gym',
    ],
    images: [{ src: MARKETING_IMAGES.memberAppEvent, alt: 'Event details for a gym workshop' }],
  },
  {
    id: 'store',
    eyebrow: 'Member store',
    title: 'Sell a shaker or a tub without a second counter.',
    text: 'Protein, merch, day extras. You list it. Members order from the same app they already open. Stock and orders sit on the desk. Optional — only the gyms where you sell.',
    points: [
      'Categories, products, and orders on the desk',
      'They pay from the phone',
      '₹499 per gym / month, only if you turn it on',
    ],
    images: [{ src: MARKETING_IMAGES.memberAppStore, alt: 'Member store on the gym app' }],
  },
];

const ALSO = [
  {
    icon: 'filter_alt',
    title: 'Walk-in leads',
    text: 'Name, phone, what they asked for. Follow them until they join or go cold.',
  },
  {
    icon: 'sports_martial_arts',
    title: 'Trainers on the books',
    text: 'Add coaches, attach members, keep sessions with the right person.',
  },
  {
    icon: 'view_carousel',
    title: 'Banners in the app',
    text: 'A photo, a video, or an audio spot on their home screen — your offer, not ours.',
  },
  {
    icon: 'forum',
    title: 'Gym community',
    text: 'A chat that belongs to your floor, not a WhatsApp group that dies every month.',
  },
];

const PRICES = [
  { label: 'First gym', amount: '₹1,999', detail: 'App, team logins, members, plans, events, WhatsApp, payments.' },
  { label: 'Each extra gym', amount: '₹999', detail: 'Same login. Its own members, staff, and branding.' },
  { label: 'Add-ons', amount: 'From ₹499', detail: 'Attendance ₹1,999 · Store ₹499 · Day pass ₹499 — per gym.' },
];

const FeatureBlock = ({ feature, reverse }) => {
  const shots = feature.images || [];
  const roles = feature.roles || [];
  const visualClass = reverse ? 'lg:order-1' : '';

  return (
    <section id={feature.id} className={`scroll-mt-24 px-4 py-16 md:px-12 ${reverse ? 'bg-surface-container-low' : ''}`}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className={reverse ? 'lg:order-2' : ''}>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-container">{feature.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">{feature.title}</h2>
          <p className="mt-4 text-secondary">{feature.text}</p>
          <ul className="mt-6 space-y-2">
            {feature.points.map((point) => (
              <li key={point} className="flex gap-2 text-sm text-on-surface">
                <Icon name="check" size={18} className="mt-0.5 shrink-0 text-primary-container" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          {feature.messages && (
            <div className="mt-6 space-y-3">
              {feature.messages.map((msg) => (
                <div key={msg.title} className="rounded-xl border border-white/10 bg-surface p-4">
                  <p className="text-xs font-semibold text-primary-container">{msg.title}</p>
                  <p className="mt-1 text-sm">{msg.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {roles.length > 0 ? (
          <div className={`grid gap-3 sm:grid-cols-2 ${visualClass}`}>
            {roles.map((item) => (
              <div key={item.role} className="rounded-2xl border border-white/10 bg-surface p-5">
                <p className="text-sm font-semibold">{item.role}</p>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{item.can}</p>
                <p className="mt-2 text-xs text-secondary/80">{item.cannot}</p>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`grid justify-items-center gap-4 ${
              shots.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
            } ${visualClass}`}
          >
            {shots.map((img) => (
              <PhoneShot key={img.src} src={img.src} alt={img.alt} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const Home = () => (
    <>
      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0">
          <div className="mesh-gradient absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:px-12 lg:grid-cols-2 lg:py-20">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-container">
              For gym owners in India
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.15] md:text-5xl">
              Your gym’s own app. The desk that runs the floor.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-secondary md:text-lg">
              {PRODUCT_NAME} is the app members open as your gym — and the desk you, your manager,
              your receptionist, and your trainers actually work from. First gym ₹1,999 a month.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="neon-glow rounded-lg bg-primary-fixed px-8 py-3 text-center text-sm font-bold text-on-primary-fixed"
              >
                Talk to us
              </Link>
              <Link
                to="/#team"
                className="rounded-lg border border-white/20 px-8 py-3 text-center text-sm font-semibold hover:bg-white/5"
              >
                See team logins
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 justify-items-center gap-4">
            <PhoneShot src={MARKETING_IMAGES.memberAppSplash} alt="White-label gym app splash" />
            <PhoneShot src={MARKETING_IMAGES.memberAppHome} alt="Member home screen" />
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-surface px-4 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 py-10 sm:grid-cols-2 lg:grid-cols-5">
          {OFFER.map((item) => (
            <div key={item.label}>
              <p className="font-display text-2xl font-bold text-primary-container md:text-3xl">{item.value}</p>
              <p className="mt-1 text-sm font-semibold">{item.label}</p>
              <p className="mt-0.5 text-xs text-secondary">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {FEATURES.map((feature, index) => (
        <FeatureBlock key={feature.id} feature={feature} reverse={index % 2 === 1} />
      ))}

      <section id="desk" className="scroll-mt-24 bg-surface-container-low px-4 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-container">Also on the desk</p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">The rest of a working gym.</h2>
          <p className="mt-3 max-w-2xl text-secondary">
            These sit with the first gym. They are not extra packages.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ALSO.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-surface p-5">
                <Icon name={item.icon} className="text-primary-container" />
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-container">Simple price</p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Pay for the gyms you run.</h2>
          <p className="mt-3 max-w-2xl text-secondary">
            Member fees stay in your gym. These amounts are only what you pay us, in rupees.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PRICES.map((bill, index) => (
              <div
                key={bill.label}
                className={`rounded-2xl border p-6 ${
                  index === 0 ? 'border-primary-container/40 bg-primary-container/5' : 'border-white/10'
                }`}
              >
                <p className="text-xs uppercase tracking-widest text-secondary">{bill.label}</p>
                <p className="mt-2 font-display text-4xl font-bold text-primary-container">{bill.amount}</p>
                <p className="mt-1 text-xs text-secondary">per month</p>
                <p className="mt-4 text-sm leading-relaxed text-secondary">{bill.detail}</p>
              </div>
            ))}
          </div>
          <Link to="/pricing" className="mt-6 inline-block text-sm font-semibold text-primary-container hover:underline">
            Build a monthly total
          </Link>
        </div>
      </section>

      <MarketingCta
        title="See it on your gym"
        description="Tell us the gym name and city. We will show you the app, who on your team can sign in, and how collections look on the desk."
        primaryLabel="Talk to us"
        primaryTo="/contact"
        secondaryLabel="See pricing"
        secondaryTo="/pricing"
      />
    </>
);

export default Home;
