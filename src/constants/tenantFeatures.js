export const DEFAULT_TENANT_FEATURES = {
  banners: true,
  store: true,
  finances: true,
  events: true,
  chat: true,
  trainers: true,
  leads: true,
  attendance: true,
};

export const TENANT_FEATURE_OPTIONS = [
  {
    key: 'banners',
    label: 'Banners / ads',
    description: 'In-app banner campaigns for the gym',
  },
  {
    key: 'store',
    label: 'Store',
    description: 'Categories, products, and orders',
  },
  {
    key: 'finances',
    label: 'Finances',
    description: 'Payments, expenses, ledger, and reports',
  },
  {
    key: 'events',
    label: 'Events',
    description: 'Classes and event scheduling',
  },
  {
    key: 'chat',
    label: 'Community chat',
    description: 'Gym community messaging',
  },
  {
    key: 'trainers',
    label: 'Trainers',
    description: 'Trainer management',
  },
  {
    key: 'leads',
    label: 'Leads',
    description: 'Enquiry / lead management',
  },
  {
    key: 'attendance',
    label: 'Attendance',
    description: 'QR check-in and attendance tracking',
  },
];

export const normalizeTenantFeatures = (value) => {
  const src = value && typeof value === 'object' ? value : {};
  const out = {};
  for (const key of Object.keys(DEFAULT_TENANT_FEATURES)) {
    out[key] = src[key] === undefined ? DEFAULT_TENANT_FEATURES[key] : Boolean(src[key]);
  }
  return out;
};
