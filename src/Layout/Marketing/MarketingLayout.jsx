import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MarketingNav from './MarketingNav';
import MarketingFooter from './MarketingFooter';

const MarketingLayout = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const jump = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        window.scrollTo(0, 0);
      };
      const frame = window.requestAnimationFrame(jump);
      return () => window.cancelAnimationFrame(frame);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);

  return (
    <div className="mesh-gradient min-h-screen bg-background text-on-surface">
      <MarketingNav />
      <Outlet />
      <MarketingFooter />
    </div>
  );
};

export default MarketingLayout;
