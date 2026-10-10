import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import GlassCard from '../../../components/fitsphere/GlassCard';
import Icon from '../../../components/fitsphere/Icon';
import MediaFileDrop from '../../../components/fitsphere/MediaFileDrop';
import OwnerPageShell from '../../../components/fitsphere/OwnerPageShell';
import SectionLoader from '../../../components/Loader/SectionLoader';
import TableShell, {
  TABLE_CLASS,
  TD,
  TH,
  THEAD_ROW,
  TableSelect,
  tableRowNumber,
} from '../../../components/fitsphere/TableShell';
import ENDPOINTS from '../../../config/apiUrls';
import { deleteRequest, getRequest, postRequest, putRequest } from '../../../config/dataApi';
import { appAdsOf } from '../../../helpers/appAds';
import { uploadMediaFile } from '../../../helpers/mediaUpload';
import useDebouncedValue from '../../../hooks/useDebouncedValue';

const CONFIG = {
  VIDEO: {
    title: 'Video ads',
    subtitle: 'Clips members see in your gym app when this channel is on.',
    accept: 'video/mp4,video/quicktime,video/webm',
    hint: 'Drop an MP4 or MOV, up to 50MB',
    folder: 'gyms/ads/video',
    resourceType: 'video',
    previewType: 'video',
    icon: 'movie',
    empty: 'No video ads yet. Upload a clip for your member app.',
  },
  AUDIO: {
    title: 'Audio ads',
    subtitle: 'Short audio spots for your gym app, managed from here.',
    accept: 'audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a,audio/aac',
    hint: 'Drop an MP3, WAV, or M4A, up to 10MB',
    folder: 'gyms/ads/audio',
    resourceType: 'video',
    previewType: 'audio',
    icon: 'headphones',
    empty: 'No audio ads yet. Upload a spot for your member app.',
  },
};

const MediaAds = ({ type }) => {
  const { currentGym } = useSelector((state) => state.gym);
  const spec = CONFIG[type];
  const enabled = Boolean(appAdsOf(currentGym)[type === 'VIDEO' ? 'video' : 'audio']);

  const [ads, setAds] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [clickUrl, setClickUrl] = useState('');
  const [asset, setAsset] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 350);
  const limit = 10;

  const load = async () => {
    if (!currentGym?.id) return;
    setLoading(true);
    try {
      const params = {
        type,
        page,
        limit,
        search: debouncedSearch || undefined,
      };
      if (statusFilter === 'active') params.isActive = 'true';
      if (statusFilter === 'hidden') params.isActive = 'false';
      const res = await getRequest(ENDPOINTS.MEDIA_ADS.LIST(currentGym.id), { params });
      setAds(res.data || []);
      setPagination(res.meta?.pagination || { total: 0 });
    } catch {
      setAds([]);
      setPagination({ total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentGym?.id || !enabled) return;
    load();
  }, [currentGym?.id, type, enabled, page, debouncedSearch, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, type, currentGym?.id]);

  const handleFile = async (file) => {
    setUploading(true);
    try {
      const uploaded = await uploadMediaFile(file, { folder: spec.folder, resourceType: spec.resourceType });
      setAsset(uploaded);
      if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ''));
      toast.success('File uploaded');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!currentGym?.id || !asset?.url) return;
    if (!title.trim()) {
      toast.error('Give this ad a title');
      return;
    }
    setSaving(true);
    try {
      await postRequest(ENDPOINTS.MEDIA_ADS.CREATE(currentGym.id), {
        type,
        title: title.trim(),
        mediaUrl: asset.url,
        clickUrl: clickUrl.trim() || null,
        durationSec: asset.duration ?? null,
        fileSize: asset.bytes ?? null,
        mimeType: asset.format || null,
        isActive: true,
      });
      toast.success('Ad added');
      setTitle('');
      setClickUrl('');
      setAsset(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad) => {
    setBusyId(ad.id);
    try {
      await putRequest(ENDPOINTS.MEDIA_ADS.UPDATE(currentGym.id, ad.id), { isActive: !ad.isActive });
      setAds((rows) => rows.map((row) => (row.id === ad.id ? { ...row, isActive: !row.isActive } : row)));
    } finally {
      setBusyId('');
    }
  };

  const handleDelete = async (ad) => {
    if (!window.confirm('Remove this ad from the gym app?')) return;
    setBusyId(ad.id);
    try {
      await deleteRequest(ENDPOINTS.MEDIA_ADS.DELETE(currentGym.id, ad.id));
      setAds((rows) => rows.filter((row) => row.id !== ad.id));
      toast.success('Ad removed');
    } finally {
      setBusyId('');
    }
  };

  if (!currentGym) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">Select a gym branch to manage ads.</GlassCard>
      </OwnerPageShell>
    );
  }

  if (!enabled) {
    return (
      <OwnerPageShell showSearch={false}>
        <GlassCard className="p-6 text-secondary">
          {spec.title} are off for this gym. Ask the platform admin to enable them from Businesses.
        </GlassCard>
      </OwnerPageShell>
    );
  }

  return (
    <SectionLoader show={loading && !ads.length}>
      <OwnerPageShell showSearch={false}>
        <GlassCard className="mb-4 p-4">
          <form onSubmit={handleCreate} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-3">
              <MediaFileDrop
                hint={spec.hint}
                accept={spec.accept}
                preview={asset?.url}
                previewType={spec.previewType}
                icon={spec.icon}
                uploading={uploading}
                onFile={handleFile}
                onClear={() => setAsset(null)}
              />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary-container/50"
                placeholder={`${spec.title.slice(0, -1)} title`}
              />
              <input
                value={clickUrl}
                onChange={(e) => setClickUrl(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary-container/50"
                placeholder="https://"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving || uploading || !asset?.url}
                className="w-full rounded-lg bg-primary-container px-4 py-3 text-sm font-bold text-on-primary-container disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Add to app'}
              </button>
            </div>
          </form>
        </GlassCard>

        <TableShell
          title={spec.title}
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search ads..."
          filters={
            <TableSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <option value="all">All ads</option>
              <option value="active">Showing in app</option>
              <option value="hidden">Hidden</option>
            </TableSelect>
          }
          page={page}
          total={pagination.total || 0}
          limit={limit}
          loading={loading}
          onPage={setPage}
          noun="ads"
        >
          <table className={`${TABLE_CLASS} min-w-[720px]`}>
            <thead>
              <tr className={THEAD_ROW}>
                <th className={`w-12 ${TH}`}>#</th>
                <th className={TH}>Ad</th>
                <th className={TH}>Link</th>
                <th className={TH}>Status</th>
                <th className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ads.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${TD} py-8 text-center text-secondary`}>
                    {spec.empty}
                  </td>
                </tr>
              ) : (
                ads.map((ad, i) => (
                  <tr key={ad.id} className="hover:bg-white/[0.02]">
                    <td className={`${TD} text-xs font-semibold text-secondary tabular-nums`}>
                      {tableRowNumber(page, limit, i)}
                    </td>
                    <td className={TD}>
                      <div className="flex items-center gap-3">
                        {type === 'VIDEO' ? (
                          <video src={ad.mediaUrl} className="h-10 w-16 rounded object-cover" />
                        ) : (
                          <Icon name="graphic_eq" className="text-primary-container" />
                        )}
                        <p className="font-semibold">{ad.title}</p>
                      </div>
                    </td>
                    <td className={`${TD} max-w-xs truncate text-xs text-secondary`}>{ad.clickUrl || '—'}</td>
                    <td className={TD}>
                      <span className="text-sm text-secondary">{ad.isActive ? 'Showing in app' : 'Hidden'}</span>
                    </td>
                    <td className={`${TD} text-right`}>
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busyId === ad.id}
                          onClick={() => toggleActive(ad)}
                          className={`relative inline-flex h-5 w-9 rounded-full ${
                            ad.isActive ? 'bg-primary-container' : 'bg-white/15'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${
                              ad.isActive ? 'left-4' : 'left-0.5'
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          disabled={busyId === ad.id}
                          onClick={() => handleDelete(ad)}
                          className="rounded-lg px-2 py-1 text-xs text-error hover:bg-error/10"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>
      </OwnerPageShell>
    </SectionLoader>
  );
};

export default MediaAds;
