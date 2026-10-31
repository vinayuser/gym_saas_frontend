import { Link } from 'react-router-dom';
import Icon from '../../components/fitsphere/Icon';
import MarketingCta from '../../components/marketing/MarketingCta';
import { MARKETING_IMAGES, PRODUCT_NAME } from '../../constants/marketingContent';

const WHO = [
  {
    title: 'One gym',
    text: 'A single floor that still needs a desk, a due list, and an app members will actually open.',
  },
  {
    title: 'A second branch',
    text: 'Same login. Its own members, staff, and look. You see both gyms without a second system.',
  },
  {
    title: 'A small chain',
    text: 'Add locations as you open them. You do not buy a bigger “package” to grow.',
  },
];


const About = () => (
  <>
    <header className="relative overflow-hidden pt-20">
      <div className="mesh-gradient absolute inset-0" />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:px-12 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-container">About us</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            Built for the people who run the gym.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-secondary">
            {PRODUCT_NAME} is for gym owners in India — not for a platform operator, not for a developer.
            You get a desk for the floor and an app that opens as your gym.
          </p>
        </div>
        <img
          src={MARKETING_IMAGES.gymAppPhones}
          alt="Two gyms, each with their own branded member app"
          className="w-full rounded-2xl border border-white/10 object-cover"
        />
      </div>
    </header>

    <section className="px-4 py-16 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-container">Who it is for</p>
        <h2 className="mt-3 font-display text-3xl font-bold">One gym, or the next one you open.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {WHO.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 p-6">
              <h3 className="font-display text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-secondary">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-surface-container-low px-4 py-16 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-container">Your people</p>
        <h2 className="mt-3 font-display text-3xl font-bold">The gym is not one login.</h2>
        <p className="mt-3 max-w-2xl text-secondary">
          Owner, manager, front desk, and trainer each have their own sign-in. See what each
          person can open.
        </p>
        <Link
          to="/#team"
          className="mt-6 inline-block text-sm font-semibold text-primary-container hover:underline"
        >
          See who can sign in
        </Link>
      </div>
    </section>

    <section className="px-4 py-16 md:px-12">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {[
          {
            icon: 'lock',
            title: 'Your gym stays yours',
            text: 'Members, payments, and staff belong to your gym. Another gym cannot open them.',
          },
          {
            icon: 'smartphone',
            title: 'The app looks like you',
            text: 'Logo, colours, photos. Members should see your place, not a generic template.',
          },
          {
            icon: 'verified_user',
            title: 'Each person has a sign-in',
            text: 'Log out on a shared desk computer when the shift ends.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/10 p-6">
            <Icon name={item.icon} className="text-primary-container" />
            <h3 className="mt-3 font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-secondary">{item.text}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-sm text-secondary">
        What the product does — app, team logins, members, QR, WhatsApp, store, payments — is on the{' '}
        <Link to="/" className="font-semibold text-primary-container hover:underline">
          home page
        </Link>
        . What it costs is on{' '}
        <Link to="/pricing" className="font-semibold text-primary-container hover:underline">
          pricing
        </Link>
        .
      </p>
    </section>

    <MarketingCta
      title="Talk about your gym"
      description="Tell us the gym name and city. We will show you how the desk and the member app look for your place."
      primaryLabel="Talk to us"
      primaryTo="/contact"
      secondaryLabel="See what we offer"
      secondaryTo="/"
    />
  </>
);

export default About;
