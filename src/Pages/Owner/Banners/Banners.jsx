import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBanners,
  fetchBannerStats,
  deleteBanner,
  duplicateBanner,
} from '../../../store/slices/bannerSlice';
import SectionLoader from '../../../components/Loader/SectionLoader';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  TableSelect,
  tableRowNumber,
} from '../../../components/fitsphere/TableShell';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import {
  STATUS_FILTERS,
  getPlacementLabel,
  getBannerStatus,
  formatImpressions,
  formatDateRange,
  statusBadgeClass,
} from '../../../helpers/bannerUtils';

const PLACEHOLDER_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCc-6ycM88BqPfBlDmcQui5SNKcDdeTFMa1fwJv6n4EeOtJmu1MyBlJ6Evv10Q_6vs2MpzLOcF3hxHva9mwca3ZVFFUgSXM-ms9l4tXK0HBOcOCbi2ZK-peQ6238IZonkJMVj118_IJctZ6zmVXS818FVLj9uV3urxDNU1SRq4wDmWD6b00CQcMWEBfuRBdstfsNntf9qjcKhuedoL9e3mKvqhoibzXRMan8hbrjtah-rz_3HivjvuOzHI1lU7ZWTEDC88zT2fONhM';

const Banners = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { banners, loading, pagination, stats } = useSelector((state) => state.banner);
  const { currentGym } = useSelector((state) => state.gym);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 350);
  const limit = 10;

  useEffect(() => {
    if (!currentGym?.id) return;
    dispatch(fetchBannerStats({ gymId: currentGym.id }));
    dispatch(
      fetchBanners({
        gymId: currentGym.id,
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      })
    );
  }, [dispatch, currentGym?.id, page, statusFilter, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch, currentGym?.id]);

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
    <SectionLoader show={loading && !banners.length}>
      <OwnerPageShell tabs={['Overview', 'Analytics']} activeTab="Overview" showSearch={false}>
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <GlassCard className="flex items-center justify-between p-4" hover={false}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">Active Banners</p>
              <h3 className="mt-1 font-display text-2xl font-bold text-primary-container">{stats?.active ?? 0}</h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/10 text-primary-container">
              <Icon name="visibility" />
            </div>
          </GlassCard>
          <GlassCard className="flex items-center justify-between p-4" hover={false}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">Avg. Click-Through Rate</p>
              <h3 className="mt-1 font-display text-2xl font-bold">{stats?.avgCtr ?? 0}%</h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
              <Icon name="touch_app" />
            </div>
          </GlassCard>
          <GlassCard className="flex items-center justify-between p-4" hover={false}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary/60">Total Impressions</p>
              <h3 className="mt-1 font-display text-2xl font-bold">{formatImpressions(stats?.totalImpressions ?? 0)}</h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
              <Icon name="trending_up" />
            </div>
          </GlassCard>
        </div>

        <TableShell
          title="Banner ads"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search banners..."
          filters={
            <TableSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </TableSelect>
          }
          actions={
            <Link
              to="/owner/banners/new"
              className="cyber-glow inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-3 py-2 text-xs font-bold text-on-primary-container"
            >
              <Icon name="campaign" size={16} />
              Create New Banner
            </Link>
          }
          page={page}
          total={pagination.total || 0}
          limit={limit}
          loading={loading}
          onPage={setPage}
          noun="banners"
        >
          <table className={`${TABLE_CLASS} min-w-[720px]`}>
            <thead>
              <tr className={THEAD_ROW}>
                <th className={`w-12 ${TH}`}>#</th>
                <th className={TH}>Banner Name</th>
                <th className={TH}>Status</th>
                <th className={`${TH} text-right`}>Performance</th>
                <th className={TH}>Display Dates</th>
                <th className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`${TD} py-12 text-center text-secondary`}>
                    No banners yet. Create your first campaign.
                  </td>
                </tr>
              ) : (
                banners.map((banner, i) => {
                  const status = getBannerStatus(banner);
                  const expired = status === 'EXPIRED';
                  return (
                    <tr key={banner.id} className="hover:bg-white/[0.02]">
                      <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                        {tableRowNumber(page, limit, i)}
                      </td>
                      <td className={TD}>
                        <div className={`flex items-center gap-3 ${expired ? 'grayscale' : ''}`}>
                          <div className="h-10 w-16 shrink-0 overflow-hidden rounded border border-white/10 bg-surface-container-highest">
                            <img
                              src={banner.imageUrl || PLACEHOLDER_IMG}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{banner.name}</p>
                            <p className="text-xs text-secondary/50">{getPlacementLabel(banner.placement)}</p>
                          </div>
                        </div>
                      </td>
                      <td className={TD}>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${statusBadgeClass(status)}`}
                        >
                          {status === 'ACTIVE' && (
                            <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" />
                          )}
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className={`${TD} text-right`}>
                        <p className="font-bold">{banner.impressions > 0 ? `${banner.ctr}% CTR` : '0.0% CTR'}</p>
                        <p className="text-xs text-secondary/50">
                          {banner.impressions > 0 ? `${banner.impressions.toLocaleString()} Impr.` : 'Pending'}
                        </p>
                      </td>
                      <td className={`${TD} text-secondary`}>
                        {formatDateRange(banner.startDate, banner.endDate)}
                      </td>
                      <td className={`${TD} text-right`}>
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => navigate(`/owner/banners/${banner.id}/edit`)}
                            className="rounded p-2 text-secondary hover:bg-white/10 hover:text-on-surface"
                          >
                            <Icon name="edit" size={20} />
                          </button>
                          <button
                            type="button"
                            title="Duplicate"
                            onClick={() => handleDuplicate(banner.id)}
                            className="rounded p-2 text-secondary hover:bg-white/10 hover:text-on-surface"
                          >
                            <Icon name="content_copy" size={20} />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => handleDelete(banner.id)}
                            className="rounded p-2 text-error hover:bg-white/10"
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
        </TableShell>
      </OwnerPageShell>
    </SectionLoader>
  );
};

export default Banners;
