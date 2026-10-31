import { Link } from 'react-router-dom';

const MarketingFooter = () => (
  <footer className="border-t border-white/5 bg-surface-container-low">
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4 md:px-12">
      <div className="space-y-4">
        <p className="font-display text-lg font-bold text-primary-container">FitSphere Pro</p>
        <p className="text-sm text-secondary">
          Your gym’s app. Team logins, QR, WhatsApp, the shop, and money.
        </p>
      </div>
      <div>
        <h5 className="mb-4 text-xs font-semibold uppercase tracking-widest text-on-surface">What we offer</h5>
        <ul className="space-y-2 text-sm text-secondary">
          <li>
            <Link to="/#app" className="hover:text-primary-container">
              White-label app
            </Link>
          </li>
          <li>
            <Link to="/#team" className="hover:text-primary-container">
              Team logins
            </Link>
          </li>
          <li>
            <Link to="/#members" className="hover:text-primary-container">
              Members & plans
            </Link>
          </li>
          <li>
            <Link to="/#attendance" className="hover:text-primary-container">
              QR & attendance
            </Link>
          </li>
          <li>
            <Link to="/#store" className="hover:text-primary-container">
              Member store
            </Link>
          </li>
          <li>
            <Link to="/#payments" className="hover:text-primary-container">
              Payments
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h5 className="mb-4 text-xs font-semibold uppercase tracking-widest text-on-surface">Pages</h5>
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
          <li>
            <Link to="/about" className="hover:text-primary-container">
              About
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
          <li>
            <Link to="/auth/login" className="hover:text-primary-container">
              Owner login
            </Link>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/5 px-4 py-6 text-sm text-secondary md:px-12">
      © {new Date().getFullYear()} FitSphere Pro
    </div>
  </footer>
);

export default MarketingFooter;
