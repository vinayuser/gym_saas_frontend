import { Link } from 'react-router-dom';

const MarketingCta = ({
  title = 'Get started with Gym SaaS',
  description = 'Gym owners need an invite from your platform admin. Contact us or sign in if you already have access.',
  primaryLabel = 'Contact us',
  primaryTo = '/contact',
  secondaryLabel = 'Owner sign in',
  secondaryTo = '/auth/login',
}) => (
  <section className="relative overflow-hidden bg-primary-container px-4 py-20 text-center text-on-primary-container md:px-12">
    <div className="pointer-events-none absolute inset-0 opacity-10">
      <div className="h-full w-full bg-[radial-gradient(circle,rgba(0,0,0,1)_1px,transparent_1px)] bg-[length:24px_24px]" />
    </div>
    <div className="relative z-10 mx-auto max-w-3xl">
      <h2 className="font-display text-3xl font-bold uppercase tracking-tight md:text-5xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">{description}</p>
      <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
        <Link
          to={primaryTo}
          className="rounded-lg bg-on-primary-container px-8 py-3 text-sm font-extrabold text-primary-container shadow-xl transition hover:scale-105"
        >
          {primaryLabel}
        </Link>
        <Link
          to={secondaryTo}
          className="rounded-lg border-2 border-on-primary-container/20 px-8 py-3 text-sm font-bold transition hover:bg-on-primary-container/10"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  </section>
);

export default MarketingCta;
