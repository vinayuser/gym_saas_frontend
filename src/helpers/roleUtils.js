import { ROLES } from '../constants';
import { ADMIN_NAV } from '../constants/adminNavigation';

export const getUserRoleInfo = (user) => {
  if (!user) {
    return {
      isSuperAdmin: false,
      isGymOwner: false,
      isManager: false,
      isStaff: false,
      roles: [],
      primaryRole: 'guest',
    };
  }

  const role = user.role;
  return {
    isSuperAdmin: role === ROLES.SUPER_ADMIN,
    isGymOwner: role === ROLES.GYM_OWNER,
    isManager: role === ROLES.MANAGER,
    isStaff: [ROLES.MANAGER, ROLES.RECEPTIONIST, ROLES.TRAINER].includes(role),
    roles: [role],
    primaryRole: role?.toLowerCase() || 'guest',
  };
};

export const getDefaultPath = (user) => {
  const { isSuperAdmin, isGymOwner, isManager, isStaff } = getUserRoleInfo(user);

  if (isSuperAdmin) return '/admin/dashboard';
  if (isGymOwner || isManager || isStaff) return '/owner/dashboard';
  return '/owner/dashboard';
};

export const canAccessRoute = (user, allowedRoles = []) => {
  if (!user) return false;
  if (user.role === ROLES.SUPER_ADMIN) return true;
  if (!allowedRoles.length) return true;
  return allowedRoles.includes(user.role);
};

export const getNavigationMenu = (user) => {
  const roleInfo = getUserRoleInfo(user);

  if (roleInfo.isSuperAdmin) {
    return ADMIN_NAV;
  }

  return [
    { label: 'Dashboard', path: '/owner/dashboard', icon: 'dashboard' },
    { label: 'Members', path: '/owner/members', icon: 'group' },
    { label: 'Subscription', path: '/owner/subscription', icon: 'workspace_premium' },
  ];
};
