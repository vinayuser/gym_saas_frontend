import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest } from '../../config/dataApi';
import GlassCard from '../../components/fitsphere/GlassCard';
import Icon from '../../components/fitsphere/Icon';
import OwnerPageShell from '../../components/fitsphere/OwnerPageShell';
import PageLoader from '../../components/Loader/PageLoader';
import DashboardOverview from './Dashboard/DashboardOverview';
import DashboardAnalytics from './Dashboard/DashboardAnalytics';
import DashboardReports from './Dashboard/DashboardReports';

const TABS = ['Overview', 'Analytics', 'Reports'];

const TAB_ROUTES = {
  Overview: '/owner/dashboard',
  Analytics: '/owner/dashboard/analytics',
  Reports: '/owner/dashboard/reports',
};

const routeToTab = (pathname) => {
  if (pathname.endsWith('/analytics')) return 'Analytics';
  if (pathname.endsWith('/reports')) return 'Reports';
  return 'Overview';
};

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentGym } = useSelector((state) => state.gym);
  const activeTab = useMemo(() => routeToTab(location.pathname), [location.pathname]);

  const [heatmapPeriod, setHeatmapPeriod] = useState('day');
  const [overviewData, setOverviewData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentGym?.id) return undefined;

    let cancelled = false;
    setLoading(true);

    const endpointByTab = {
      Overview: ENDPOINTS.GYMS.DASHBOARD(currentGym.id),
      Analytics: ENDPOINTS.GYMS.DASHBOARD_ANALYTICS(currentGym.id),
      Reports: ENDPOINTS.GYMS.DASHBOARD_REPORTS(currentGym.id),
    };

    getRequest(endpointByTab[activeTab])
      .then((res) => {
        if (cancelled) return;
        if (activeTab === 'Overview') setOverviewData(res.data);
        if (activeTab === 'Analytics') setAnalyticsData(res.data);
        if (activeTab === 'Reports') setReportsData(res.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentGym?.id, activeTab]);

  const handleTabChange = (tab) => {
    navigate(TAB_ROUTES[tab] || TAB_ROUTES.Overview);
  };

  if (!currentGym) {
    return (
      <OwnerPageShell variant="dashboard" showSearch={false}>
        <GlassCard className="p-8 text-center text-secondary">
          Select a gym branch from the header to view your dashboard.
        </GlassCard>
      </OwnerPageShell>
    );
  }

  const showLoader =
    loading &&
    ((activeTab === 'Overview' && !overviewData) ||
      (activeTab === 'Analytics' && !analyticsData) ||
      (activeTab === 'Reports' && !reportsData));

  if (showLoader) {
    return <PageLoader show message={`Loading ${activeTab.toLowerCase()}...`} />;
  }

  return (
    <>
      <OwnerPageShell
        variant="dashboard"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch={false}
      >
        {activeTab === 'Overview' && (
          <DashboardOverview
            data={overviewData}
            heatmapPeriod={heatmapPeriod}
            onHeatmapPeriodChange={setHeatmapPeriod}
          />
        )}
        {activeTab === 'Analytics' && <DashboardAnalytics data={analyticsData} />}
        {activeTab === 'Reports' && <DashboardReports data={reportsData} />}
      </OwnerPageShell>

      {activeTab === 'Overview' ? (
        <button
          type="button"
          className="neon-glow fixed bottom-10 right-10 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed shadow-2xl transition-transform hover:scale-110 active:scale-95"
          aria-label="Quick action"
        >
          <Icon name="bolt" size={32} />
        </button>
      ) : null}
    </>
  );
};

export default OwnerDashboard;
