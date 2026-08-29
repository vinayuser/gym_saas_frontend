import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Icon from '../../components/fitsphere/Icon';
import { MARKETING_NAV } from '../../constants/marketingContent';

const MarketingNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/10 bg-surface/80 px-4 backdrop-blur-xl md:px-12">
      <Link to="/" className="font-display text-xl font-bold tracking-tighter text-primary-container md:text-2xl">
        FitSphere Pro
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        {MARKETING_NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive
                  ? 'border-b-2 border-primary-container pb-1 text-primary-container'
                  : 'text-secondary hover:text-on-surface'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="hidden items-center gap-4 md:flex">
        <Link to="/auth/login" className="text-sm text-secondary transition hover:text-primary-container">
          Sign in
        </Link>
        <Link
          to="/contact"
          className="rounded-lg bg-primary-container px-5 py-2 text-sm font-bold text-on-primary-container transition hover:scale-105"
        >
          Get invite
        </Link>
      </div>

      <button
        type="button"
        className="rounded-lg p-2 text-secondary md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <Icon name={open ? 'close' : 'menu'} size={24} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-20 border-b border-white/10 bg-surface-container-low p-4 md:hidden">
          {MARKETING_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-white/10 text-primary-container' : 'text-secondary'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/auth/login"
            onClick={() => setOpen(false)}
            className="mt-2 block px-3 py-2 text-sm text-secondary"
          >
            Sign in
          </Link>
        </div>
      )}
    </nav>
  );
};

export default MarketingNav;
