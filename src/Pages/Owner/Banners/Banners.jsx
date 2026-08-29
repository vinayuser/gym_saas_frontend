import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBanners,
  fetchBannerStats,
  deleteBanner,
  duplicateBanner,
} from '../../../store/slices/bannerSlice';
import PageLoader from '../../../components/Loader/PageLoader';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import {
  STATUS_FILTERS,
  getPlacementLabel,
  getBannerStatus,
  formatImpressions,
  formatDateRange,
  statusBadgeClass,
} from '../../../helpers/bannerUtils';

const PLACEHOLDER_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCc-6ycM88BqPfBlDcmQui5SNKcDdeTFMa1fwJv6n4EeOtJmu1MyBlJ6Evv10Q_6vs2MpzLOcF3hxHva9mwca3ZVFFUgSXM-ms9l4tXK0HBOcOCbi2ZK-peQ6238IZonkJMVj118_IJctZ6zmVXS818FVLj9uV3urxDNU1SRq4wDmWD6b00CQcMWEBfuRBdstfsNntf9qjcKhuedoL9e3mKvqhoibzXRMan8hbrjtah-rz_3HivjvuOzHI1lU7ZWTEDC88zT2fONhM';

const Banners = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { banners, loading, pagination, stats } = useSelector((state) => state.banner);
  const { currentGym } = useSelector((state) => state.gym);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!currentGym?.id) return;
    dispatch(fetchBannerStats({ gymId: currentGym.id }));
    dispatch(
      fetchBanners({
        gymId: currentGym.id,
        page,
        limit,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      })
    );
  }, [dispatch, currentGym?.id, page, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, currentGym?.id]);

  const total = pagination.total || 0;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const totalPages = pagination.totalPages || 1;

  const handleDelete = async (bannerId) => {
    if (!currentGym?.id) return;
    if (window.confirm('Delete this banner campaign?')) {
      await dispatch(deleteBanner({ gymId: currentGym.id, bannerId }));
      dispatch(fetchBannerStats({ gymId: currentGym.id }));
    }
  };

  const handleDuplicate = async (bannerId) => {
    if (!currentGym?.id) return;
    await dispatch(duplicateBanner({ gymId: currentGym.id, bannerId }));
    dispatch(fetchBannerStats({ gymId: currentGym.id }));
  };

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch to manage banners.</GlassCard>
      </OwnerPageShell>
    );
  }

  return (
    <PageLoader show={loading && !banners.length} message="Loading banners...">
    <OwnerPageShell
      tabs={['Overview', 'Analytics', 'Reports']}
      activeTab="Overview"
      showSearch={false}
    >
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Banner Ads Management
            </h1>
            <p className="mt-1 text-secondary/70">
              Control your mobile app&apos;s visual communication and member engagement.
            </p>
          </div>
          <Link
            to="/owner/banners/new"
            className="cyber-glow flex items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-3 text-sm font-bold text-on-primary-container transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon name="campaign" size={20} />
            Create New Banner
          </Link>
        </div>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <GlassCard className="flex items-center justify-between p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">
                Active Banners
              </p>
              <h3 className="mt-1 font-display text-4xl font-bold text-primary-container">
                {stats?.active ?? 0}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/10 text-primary-container">
              <Icon name="visibility" />
            </div>
          </GlassCard>
          <GlassCard className="flex items-center justify-between p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">
                Avg. Click-Through Rate
              </p>
              <h3 className="mt-1 font-display text-4xl font-bold text-on-surface">
                {stats?.avgCtr ?? 0}%
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-on-surface">
              <Icon name="touch_app" />
            </div>
          </GlassCard>
          <GlassCard className="flex items-center justify-between p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">
                Total Impressions
              </p>
              <h3 className="mt-1 font-display text-4xl font-bold text-on-surface">
                {formatImpressions(stats?.totalImpressions ?? 0)}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-on-surface">
              <Icon name="trending_up" />
            </div>
          </GlassCard>
        </section>

        <GlassCard className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-4 md:p-6">
            <h2 className="text-xl font-semibold">Recent Campaigns</h2>
            <div className="flex gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setStatusFilter(f.value)}
                  className={`rounded px-3 py-1 text-xs font-semibold transition ${
                    statusFilter === f.value
                      ? 'bg-white/10 text-on-surface'
                      : 'text-secondary opacity-60 hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-secondary/60 md:px-6">
                    Banner Name
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-secondary/60 md:px-6">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-secondary/60 md:px-6">
                    Performance
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-secondary/60 md:px-6">
                    Display Dates
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-secondary/60 md:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                      No banners yet. Create your first campaign.
                    </td>
                  </tr>
                ) : (
                  banners.map((banner) => {
                    const status = getBannerStatus(banner);
                    const expired = status === 'EXPIRED';
                    return (
                      <tr
                        key={banner.id}
                        className="transition hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-4 md:px-6">
                          <div className={`flex items-center gap-4 ${expired ? 'grayscale' : ''}`}>
                            <div className="h-10 w-16 shrink-0 overflow-hidden rounded border border-white/10 bg-surface-container-highest">
                              <img
                                src={banner.imageUrl || PLACEHOLDER_IMG}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-on-surface">{banner.name}</p>
                              <p className="text-xs text-secondary/50">
                                {getPlacementLabel(banner.placement)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 md:px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${statusBadgeClass(status)}`}
                          >
                            {status === 'ACTIVE' && (
                              <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" />
                            )}
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right md:px-6">
                          <p className="font-bold text-on-surface">
                            {banner.impressions > 0 ? `${banner.ctr}% CTR` : '0.0% CTR'}
                          </p>
                          <p className="text-xs text-secondary/50">
                            {banner.impressions > 0
                              ? `${banner.impressions.toLocaleString()} Impr.`
                              : 'Pending'}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm text-secondary md:px-6">
                          {formatDateRange(banner.startDate, banner.endDate)}
                        </td>
                        <td className="px-4 py-4 text-right md:px-6">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              title="Edit"
                              onClick={() => navigate(`/owner/banners/${banner.id}/edit`)}
                              className="rounded p-2 text-secondary transition hover:bg-white/10 hover:text-on-surface"
                            >
                              <Icon name="edit" size={20} />
                            </button>
                            <button
                              type="button"
                              title="Duplicate"
                              onClick={() => handleDuplicate(banner.id)}
                              className="rounded p-2 text-secondary transition hover:bg-white/10 hover:text-on-surface"
                            >
                              <Icon name="content_copy" size={20} />
                            </button>
                            <button
                              type="button"
                              title="Delete"
                              onClick={() => handleDelete(banner.id)}
                              className="rounded p-2 text-error transition hover:bg-white/10"
                            >
                              <Icon name="delete" size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-white/5 px-6 py-4 sm:flex-row">
              <p className="text-sm text-secondary">
                Showing {start}–{end} of {total} campaigns
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </OwnerPageShell>
    </PageLoader>
  );
};

export default Banners;
