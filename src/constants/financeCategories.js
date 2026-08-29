export const FINANCE_CATEGORIES = [
  { value: 'ALL', label: 'All sources' },
  { value: 'SUBSCRIPTIONS', label: 'Subscriptions & memberships' },
  { value: 'STORE_SALES', label: 'Store sales & orders' },
  { value: 'INVOICES', label: 'Invoices & billing' },
];

export const FINANCE_CATEGORY_LABELS = {
  ALL: 'All sources',
  SUBSCRIPTIONS: 'Subscriptions',
  STORE_SALES: 'Store sales',
  INVOICES: 'Invoices',
};

export const sourceBadgeClass = (source) => {
  if (source === 'SUBSCRIPTIONS') return 'bg-indigo-500/20 text-indigo-300';
  if (source === 'STORE_SALES') return 'bg-primary-container/20 text-primary-container';
  if (source === 'INVOICES') return 'bg-amber-500/20 text-amber-300';
  return 'bg-white/10 text-secondary';
};
