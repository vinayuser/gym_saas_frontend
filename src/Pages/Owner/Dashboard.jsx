import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ENDPOINTS from '../../config/apiUrls';
import { getRequest } from '../../config/dataApi';
import GlassCard from '../../components/fitsphere/GlassCard';
import Icon from '../../components/fitsphere/Icon';
import OwnerPageShell from '../../components/fitsphere/OwnerPageShell';
import SectionLoader from '../../components/Loader/SectionLoader';
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

    getRequest(endpointByTab[activeTab], {
      params: activeTab === 'Overview' ? { period: heatmapPeriod } : undefined,
    })
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
  }, [currentGym?.id, activeTab, heatmapPeriod]);

  const handleTabChange = (tab) => {
    navigate(TAB_ROUTES[tab] || TAB_ROUTES.Overview);
  };

  const quickActions = [
    { label: 'Add member', to: '/owner/members/new', icon: 'person_add' },
    { label: 'New enquiry', to: '/owner/leads', icon: 'filter_alt' },
    { label: 'Create event', to: '/owner/events', icon: 'event', state: { openCreate: true } },
    { label: 'Add trainer', to: '/owner/trainers/new', icon: 'sports_martial_arts' },
  ];
  const [quickOpen, setQuickOpen] = useState(false);

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

  return (
    <>
      <OwnerPageShell
        variant="dashboard"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch={false}
      >
        <SectionLoader show={showLoader}>
          {activeTab === 'Overview' && overviewData && (
            <DashboardOverview
              data={overviewData}
              heatmapPeriod={heatmapPeriod}
              onHeatmapPeriodChange={setHeatmapPeriod}
            />
          )}
          {activeTab === 'Analytics' && analyticsData && <DashboardAnalytics data={analyticsData} />}
          {activeTab === 'Reports' && reportsData && <DashboardReports data={reportsData} />}
        </SectionLoader>
      </OwnerPageShell>

      {activeTab === 'Overview' ? (
        <div className="fixed bottom-10 right-10 z-50">
          {quickOpen ? (
            <div className="mb-3 w-52 overflow-hidden rounded-xl border border-white/10 bg-surface-container shadow-2xl">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    setQuickOpen(false);
                    navigate(action.to, action.state ? { state: action.state } : undefined);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-primary-fixed hover:text-on-primary-fixed"
                >
                  <Icon name={action.icon} size={18} />
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setQuickOpen((open) => !open)}
            className="neon-glow flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed shadow-2xl transition-transform hover:scale-110 active:scale-95"
            aria-label="Quick actions"
            aria-expanded={quickOpen}
          >
            <Icon name={quickOpen ? 'close' : 'bolt'} size={32} />
          </button>
        </div>
      ) : null}
    </>
  );
};

export default OwnerDashboard;
