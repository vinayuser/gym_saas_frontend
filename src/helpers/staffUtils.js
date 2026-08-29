export const ROLE_LABELS = {
  TRAINER: 'Trainer',
  RECEPTIONIST: 'Front Desk',
  MANAGER: 'Manager',
  GYM_OWNER: 'Gym Owner',
};

export const getRoleLabel = (staff) =>
  staff.designation || ROLE_LABELS[staff.user?.role] || staff.user?.role || 'Staff';

export const getStaffStatus = (staff, index = 0) => {
  if (!staff.isActive) return { key: 'off', label: 'Off-shift', dotClass: 'bg-secondary/40', textClass: 'text-secondary/60' };
  if (index % 5 === 1) {
    return { key: 'break', label: 'On Break', dotClass: 'bg-yellow-500', textClass: 'text-yellow-500' };
  }
  return {
    key: 'active',
    label: 'Active',
    dotClass: 'bg-primary-fixed shadow-[0_0_8px_#c3f400]',
    textClass: 'text-primary-fixed',
  };
};

export const getPerformanceWidth = (id) => {
  let hash = 0;
  for (let i = 0; i < (id || '').length; i += 1) hash += id.charCodeAt(i);
  return 80 + (hash % 18);
};

export const STAFF_CATEGORIES = [
  { key: 'all', label: 'All Staff' },
  { key: 'trainers', label: 'Trainers' },
  { key: 'front-desk', label: 'Front Desk' },
  { key: 'management', label: 'Management' },
];
