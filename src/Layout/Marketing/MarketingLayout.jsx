import { Outlet } from 'react-router-dom';
import MarketingNav from './MarketingNav';
import MarketingFooter from './MarketingFooter';

const MarketingLayout = () => (
  <div className="mesh-gradient min-h-screen bg-background text-on-surface">
    <MarketingNav />
    <Outlet />
    <MarketingFooter />
  </div>
);

export default MarketingLayout;
