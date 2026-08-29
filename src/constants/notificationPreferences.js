export const DEFAULT_NOTIFICATION_PREFERENCES = {
  emailAlerts: true,
  smsReminders: true,
  pushNotifications: false,
  weeklyDigest: true,
};

export const NOTIFICATION_OPTIONS = [
  {
    key: 'emailAlerts',
    label: 'Email alerts',
    description: 'Membership renewals, payments, and important updates',
    icon: 'mail',
  },
  {
    key: 'smsReminders',
    label: 'SMS reminders',
    description: 'Class reminders and member follow-ups via text',
    icon: 'sms',
  },
  {
    key: 'pushNotifications',
    label: 'Push notifications',
    description: 'Real-time alerts in the browser when you are signed in',
    icon: 'notifications_active',
  },
  {
    key: 'weeklyDigest',
    label: 'Weekly digest',
    description: 'Summary of gym activity every Monday morning',
    icon: 'calendar_month',
  },
];

export const normalizeNotificationPreferences = (value) => ({
  emailAlerts: value?.emailAlerts ?? DEFAULT_NOTIFICATION_PREFERENCES.emailAlerts,
  smsReminders: value?.smsReminders ?? DEFAULT_NOTIFICATION_PREFERENCES.smsReminders,
  pushNotifications: value?.pushNotifications ?? DEFAULT_NOTIFICATION_PREFERENCES.pushNotifications,
  weeklyDigest: value?.weeklyDigest ?? DEFAULT_NOTIFICATION_PREFERENCES.weeklyDigest,
});

export const preferencesEqual = (a, b) =>
  NOTIFICATION_OPTIONS.every(({ key }) => Boolean(a[key]) === Boolean(b[key]));
