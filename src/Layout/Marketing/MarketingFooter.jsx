import { Link } from 'react-router-dom';
import Icon from '../../components/fitsphere/Icon';

const MarketingFooter = () => (
  <footer className="border-t border-white/5 bg-surface-container-low">
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:grid-cols-2 lg:grid-cols-5 md:px-12">
      <div className="space-y-4">
        <p className="font-display text-lg font-bold text-primary-container">FitSphere Pro</p>
        <p className="text-sm text-secondary">
          Multi-tenant gym management SaaS—members, staff, attendance, finances, and owner onboarding.
        </p>
      </div>
      <div>
        <h5 className="mb-4 text-xs font-semibold uppercase tracking-widest text-on-surface">Solutions</h5>
        <ul className="space-y-2 text-sm text-secondary">
          <li>
            <Link to="/pricing" className="hover:text-primary-container">
              Boutique studios
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-primary-container">
              Multi-location chains
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-primary-container">
              Franchise networks
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h5 className="mb-4 text-xs font-semibold uppercase tracking-widest text-on-surface">Platform</h5>
        <ul className="space-y-2 text-sm text-secondary">
          <li>
            <Link to="/pricing" className="hover:text-primary-container">
              Pricing
            </Link>
          </li>
          <li>
            <Link to="/faq" className="hover:text-primary-container">
              FAQ
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-primary-container">
              Contact
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h5 className="mb-4 text-xs font-semibold uppercase tracking-widest text-on-surface">Company</h5>
        <ul className="space-y-2 text-sm text-secondary">
          <li>
            <Link to="/about" className="hover:text-primary-container">
              About us
            </Link>
          </li>
          <li>
            <Link to="/auth/login" className="hover:text-primary-container">
              Owner login
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h5 className="mb-4 text-xs font-semibold uppercase tracking-widest text-on-surface">Legal</h5>
        <ul className="space-y-2 text-sm text-secondary">
          <li>
            <Link to="/privacy" className="hover:text-primary-container">
              Privacy policy
            </Link>
          </li>
          <li>
            <Link to="/terms" className="hover:text-primary-container">
              Terms of service
            </Link>
          </li>
        </ul>
      </div>
    </div>
    <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 px-4 py-6 text-sm text-secondary md:flex-row md:px-12">
      <span>© {new Date().getFullYear()} FitSphere Pro. Kinetic Performance Systems.</span>
      <div className="flex gap-4">
        <Icon name="public" size={20} className="cursor-pointer hover:text-primary-container" />
        <Icon name="share" size={20} className="cursor-pointer hover:text-primary-container" />
      </div>
    </div>
  </footer>
);

export default MarketingFooter;
