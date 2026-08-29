import { Link } from 'react-router-dom';
import Icon from '../fitsphere/Icon';

const LegalPage = ({ title, subtitle, updated, sections, sidebarLinks }) => (
  <main className="pb-20 pt-28">
    <div className="mx-auto max-w-7xl px-4 md:px-12">
      <header className="mb-12 md:text-left">
        <div className="mb-2 inline-flex items-center gap-2 text-primary-container">
          <Icon name="security" size={18} />
          <span className="text-xs font-semibold uppercase tracking-widest">Trust &amp; safety</span>
        </div>
        <h1 className="font-display text-4xl font-bold md:text-6xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-secondary">{subtitle}</p>
        {updated && (
          <div className="glass-card mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm">
            <span className="text-secondary">Last updated:</span>
            <span className="font-semibold text-primary-container">{updated}</span>
          </div>
        )}
      </header>

      <div className="grid gap-8 md:grid-cols-12">
        {sidebarLinks && (
          <aside className="hidden md:col-span-3 md:block">
            <nav className="sticky top-28 space-y-2">
              {sidebarLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className="block rounded-lg px-4 py-3 text-sm text-secondary transition hover:bg-white/5 hover:text-primary-container"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </aside>
        )}

        <div className={`space-y-6 ${sidebarLinks ? 'md:col-span-9' : 'md:col-span-12'}`}>
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="glass-card rounded-xl p-6 md:p-8">
              <h2 className="mb-4 font-display text-2xl font-semibold text-primary-container">
                {section.title}
              </h2>
              {section.content && (
                <p className="mb-4 leading-relaxed text-secondary">{section.content}</p>
              )}
              {section.quote && (
                <div className="mb-4 rounded-lg border border-primary-container/20 bg-primary-container/5 p-4">
                  <p className="text-sm italic text-primary-container">{section.quote}</p>
                </div>
              )}
              {section.bullets && (
                <ul className="mb-4 space-y-2">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-on-surface">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-sm bg-primary-container shadow-[0_0_8px_rgba(195,244,0,0.4)]" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
              {section.cards && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {section.cards.map((c) => (
                    <div key={c.title} className="rounded-lg border border-white/5 bg-surface-container p-4">
                      <h4 className="mb-1 text-sm font-semibold text-primary-container">{c.title}</h4>
                      <p className="text-sm text-secondary">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
              {section.image && (
                <div className="relative mt-6 h-48 overflow-hidden rounded-xl border border-white/5">
                  <img src={section.image} alt="" className="h-full w-full object-cover opacity-40 grayscale" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      <p className="mt-12 text-center text-sm text-secondary">
        Questions? <Link to="/contact" className="text-primary-container hover:underline">Contact us</Link>
      </p>
    </div>
  </main>
);

export default LegalPage;
