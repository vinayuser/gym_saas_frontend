export const BANNER_CATEGORIES = [
  { value: 'PROMOTION', label: 'Promotion' },
  { value: 'NEW_CLASS', label: 'New Class Announcement' },
  { value: 'MAINTENANCE', label: 'Maintenance Update' },
  { value: 'APP_EXCLUSIVE', label: 'App Exclusive Offer' },
];

export const BANNER_PLACEMENTS = [
  { value: 'GLOBAL_HOMEPAGE', label: 'Global Homepage' },
  { value: 'CLASSES_SECTION', label: 'Classes Section' },
  { value: 'DASHBOARD_TOP', label: 'Dashboard Top' },
  { value: 'MEMBER_STORE', label: 'Member Store' },
];

export const BANNER_CTA_TYPES = [
  { value: 'CLASS_BOOKING', label: 'Class Booking' },
  { value: 'STORE_PRODUCT', label: 'Store Product' },
  { value: 'EVENT', label: 'Specific Event' },
  { value: 'EXTERNAL_URL', label: 'External URL' },
];

export const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (6AM - 11AM)' },
  { id: 'afternoon', label: 'Afternoon (11AM - 4PM)' },
  { id: 'evening', label: 'Evening (4PM - 10PM)' },
];

export const TARGET_AUDIENCES = [
  { id: 'all', label: 'All Members' },
  { id: 'platinum', label: 'Platinum Elite' },
  { id: 'new', label: 'New Joinees' },
  { id: 'at-risk', label: 'At-Risk' },
];

export const STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'EXPIRED', label: 'Expired' },
];

export const getPlacementLabel = (placement) =>
  BANNER_PLACEMENTS.find((p) => p.value === placement)?.label || placement;

export const getCategoryLabel = (category) =>
  BANNER_CATEGORIES.find((c) => c.value === category)?.label || category;

export const getCtaLabel = (ctaType) =>
  BANNER_CTA_TYPES.find((c) => c.value === ctaType)?.label || 'Book Now';

export const getBannerStatus = (banner) => banner.computedStatus || banner.status || 'DRAFT';

export const formatImpressions = (n) => {
  if (n >= 1000) return `${Math.round(n / 100) / 10}k`;
  return String(n);
};

export const formatDateRange = (start, end) => {
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      : null;
  const s = fmt(start);
  const e = fmt(end);
  if (s && e) return `${s} - ${e}`;
  if (s) return `From ${s}`;
  if (e) return `Until ${e}`;
  return 'No dates set';
};

export const toDateInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

export const statusBadgeClass = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-primary-container/20 text-primary-container border-primary-container/30';
    case 'SCHEDULED':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'EXPIRED':
      return 'bg-white/5 text-secondary border-white/10';
    default:
      return 'bg-white/5 text-secondary border-white/10';
  }
};
