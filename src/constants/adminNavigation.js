export const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard', permission: 'dashboard.view' },
  { label: 'Businesses', path: '/admin/invites', icon: 'mail', permission: 'businesses.view' },
  { label: 'Transactions', path: '/admin/transactions', icon: 'payments', permission: 'transactions.view' },
  { label: 'Support', path: '/admin/support', icon: 'support_agent', permission: 'support.view' },
  { label: 'Plans', path: '/admin/plans', icon: 'workspace_premium', permission: 'plans.view' },
  { label: 'Roles & Permissions', path: '/admin/roles', icon: 'admin_panel_settings', permission: 'team.manage' },
  { label: 'Settings', path: '/admin/settings', icon: 'settings', permission: 'settings.view' },
];
