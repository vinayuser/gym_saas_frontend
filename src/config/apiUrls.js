const configuredApi = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const basePath = String(import.meta.env.BASE_URL || '/').replace(/\/$/, '');

/** Medisewa host is retired. Use the host the page was opened on, under the same /fitsphere path. */
const sameOriginApi = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://144.24.124.125';
  return `${origin}${basePath}/api/v1`;
};

const API_PREFIX = !configuredApi || /medisewa/i.test(configuredApi) ? sameOriginApi() : configuredApi;

const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    REGISTER: `${API_PREFIX}/auth/register`,
    REFRESH: `${API_PREFIX}/auth/refresh`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
    PROFILE: `${API_PREFIX}/auth/me`,
    FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
    RESET_PASSWORD: `${API_PREFIX}/auth/reset-password`,
    VERIFY_OTP: `${API_PREFIX}/auth/verify-otp`,
    LOGIN_2FA: `${API_PREFIX}/auth/login/2fa`,
    CHANGE_PASSWORD: `${API_PREFIX}/auth/password`,
    SESSIONS: `${API_PREFIX}/auth/sessions`,
    SESSION: (sessionId) => `${API_PREFIX}/auth/sessions/${sessionId}`,
    REVOKE_OTHER_SESSIONS: `${API_PREFIX}/auth/sessions/revoke-others`,
    TWO_FACTOR_STATUS: `${API_PREFIX}/auth/2fa/status`,
    TWO_FACTOR_SETUP: `${API_PREFIX}/auth/2fa/setup`,
    TWO_FACTOR_VERIFY: `${API_PREFIX}/auth/2fa/verify`,
    TWO_FACTOR_DISABLE: `${API_PREFIX}/auth/2fa/disable`,
    NOTIFICATION_PREFERENCES: `${API_PREFIX}/auth/notification-preferences`,
  },
  NOTIFICATIONS: `${API_PREFIX}/notifications`,
  BROADCASTS: {
    ACTIVE: `${API_PREFIX}/broadcasts/active`,
    CREATE: `${API_PREFIX}/broadcasts`,
    REMOVE: `${API_PREFIX}/broadcasts/active`,
  },
  PLATFORM_BILLING: {
    PUBLIC: `${API_PREFIX}/platform-billing/public`,
    CATALOG: `${API_PREFIX}/platform-billing`,
    ADDON: (key) => `${API_PREFIX}/platform-billing/addons/${key}`,
    MINE: `${API_PREFIX}/platform-billing/mine`,
  },
  ROLES: {
    TEAM: `${API_PREFIX}/roles/platform`,
    ROLE: (roleId) => `${API_PREFIX}/roles/platform/${roleId}`,
    ADMINS: `${API_PREFIX}/roles/platform/admins`,
    ADMIN: (userId) => `${API_PREFIX}/roles/platform/admins/${userId}`,
  },
  TENANT: {
    ME: `${API_PREFIX}/tenants/me`,
  },
  TENANTS: {
    LIST: `${API_PREFIX}/tenants`,
    UPDATE_STATUS: (id) => `${API_PREFIX}/tenants/${id}/status`,
    UPDATE_FEATURES: (id) => `${API_PREFIX}/tenants/${id}/features`,
    UPDATE_ADDONS: (id, gymId) => `${API_PREFIX}/tenants/${id}/gyms/${gymId}/addons`,
  },
  GYMS: {
    LIST: `${API_PREFIX}/gyms`,
    DASHBOARD: (gymId) => `${API_PREFIX}/gyms/${gymId}/dashboard`,
    DASHBOARD_ANALYTICS: (gymId) => `${API_PREFIX}/gyms/${gymId}/dashboard/analytics`,
    DASHBOARD_REPORTS: (gymId) => `${API_PREFIX}/gyms/${gymId}/dashboard/reports`,
    BY_ID: (id) => `${API_PREFIX}/gyms/${id}`,
    CREATE: `${API_PREFIX}/gyms`,
    UPDATE: (id) => `${API_PREFIX}/gyms/${id}`,
    BILLING: (id) => `${API_PREFIX}/gyms/${id}/billing`,
    DELETE: (id) => `${API_PREFIX}/gyms/${id}`,
  },
  MEMBERS: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/members`,
    BY_ID: (gymId, memberId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}`,
    CREATE: (gymId) => `${API_PREFIX}/gyms/${gymId}/members`,
    UPDATE: (gymId, memberId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}`,
    DELETE: (gymId, memberId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}`,
    QR: (gymId, memberId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}/qr`,
    CARE: (gymId, memberId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}/care`,
    WORKOUTS: (gymId, memberId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}/workouts`,
    WORKOUT: (gymId, memberId, planId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}/workouts/${planId}`,
    DIETS: (gymId, memberId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}/diets`,
    DIET: (gymId, memberId, planId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}/diets/${planId}`,
    MEASUREMENTS: (gymId, memberId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}/measurements`,
    MEASUREMENT: (gymId, memberId, measurementId) =>
      `${API_PREFIX}/gyms/${gymId}/members/${memberId}/measurements/${measurementId}`,
  },
  STAFF: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/staff`,
    BY_ID: (gymId, staffId) => `${API_PREFIX}/gyms/${gymId}/staff/${staffId}`,
    CREATE: (gymId) => `${API_PREFIX}/gyms/${gymId}/staff`,
    UPDATE: (gymId, staffId) => `${API_PREFIX}/gyms/${gymId}/staff/${staffId}`,
    DELETE: (gymId, staffId) => `${API_PREFIX}/gyms/${gymId}/staff/${staffId}`,
  },
  PLANS: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/membership-plans`,
    BY_ID: (gymId, planId) => `${API_PREFIX}/gyms/${gymId}/membership-plans/${planId}`,
    CREATE: (gymId) => `${API_PREFIX}/gyms/${gymId}/membership-plans`,
    UPDATE: (gymId, planId) => `${API_PREFIX}/gyms/${gymId}/membership-plans/${planId}`,
    DELETE: (gymId, planId) => `${API_PREFIX}/gyms/${gymId}/membership-plans/${planId}`,
  },
  EVENTS: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/events`,
    BY_ID: (gymId, eventId) => `${API_PREFIX}/gyms/${gymId}/events/${eventId}`,
    CREATE: (gymId) => `${API_PREFIX}/gyms/${gymId}/events`,
    UPDATE: (gymId, eventId) => `${API_PREFIX}/gyms/${gymId}/events/${eventId}`,
    DELETE: (gymId, eventId) => `${API_PREFIX}/gyms/${gymId}/events/${eventId}`,
    BOOKINGS: (gymId, eventId) => `${API_PREFIX}/gyms/${gymId}/events/${eventId}/bookings`,
  },
  ENQUIRIES: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/enquiries`,
    BY_ID: (gymId, enquiryId) => `${API_PREFIX}/gyms/${gymId}/enquiries/${enquiryId}`,
    CREATE: (gymId) => `${API_PREFIX}/gyms/${gymId}/enquiries`,
    UPDATE: (gymId, enquiryId) => `${API_PREFIX}/gyms/${gymId}/enquiries/${enquiryId}`,
    DELETE: (gymId, enquiryId) => `${API_PREFIX}/gyms/${gymId}/enquiries/${enquiryId}`,
    CONVERT: (gymId, enquiryId) => `${API_PREFIX}/gyms/${gymId}/enquiries/${enquiryId}/convert`,
  },
  ATTENDANCE: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/attendance`,
    LOOKUP: (gymId) => `${API_PREFIX}/gyms/${gymId}/attendance/lookup`,
    CHECK_IN: (gymId) => `${API_PREFIX}/gyms/${gymId}/attendance/check-in`,
  },
  DAY_PASSES: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/day-passes`,
    CREATE: (gymId) => `${API_PREFIX}/gyms/${gymId}/day-passes`,
    CHECK_IN: (gymId, passId) => `${API_PREFIX}/gyms/${gymId}/day-passes/${passId}/check-in`,
  },
  PUBLIC: {
    CONTACT: `${API_PREFIX}/public/contact`,
  },
  PRODUCTS: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/products`,
    STATS: (gymId) => `${API_PREFIX}/gyms/${gymId}/products/stats`,
    BY_ID: (gymId, productId) => `${API_PREFIX}/gyms/${gymId}/products/${productId}`,
    CREATE: (gymId) => `${API_PREFIX}/gyms/${gymId}/products`,
    UPDATE: (gymId, productId) => `${API_PREFIX}/gyms/${gymId}/products/${productId}`,
    DELETE: (gymId, productId) => `${API_PREFIX}/gyms/${gymId}/products/${productId}`,
  },
  CATEGORIES: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/categories`,
    CREATE: (gymId) => `${API_PREFIX}/gyms/${gymId}/categories`,
    UPDATE: (gymId, categoryId) => `${API_PREFIX}/gyms/${gymId}/categories/${categoryId}`,
    DELETE: (gymId, categoryId) => `${API_PREFIX}/gyms/${gymId}/categories/${categoryId}`,
  },
  ORDERS: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/orders`,
    STATS: (gymId) => `${API_PREFIX}/gyms/${gymId}/orders/stats`,
    BY_ID: (gymId, orderId) => `${API_PREFIX}/gyms/${gymId}/orders/${orderId}`,
    CREATE: (gymId) => `${API_PREFIX}/gyms/${gymId}/orders`,
    UPDATE_STATUS: (gymId, orderId) => `${API_PREFIX}/gyms/${gymId}/orders/${orderId}/status`,
    MEMBER_ORDERS: (gymId, memberId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}/orders`,
  },
  FINANCE: {
    OVERVIEW: (gymId) => `${API_PREFIX}/gyms/${gymId}/finance/overview`,
    LEDGER: (gymId) => `${API_PREFIX}/gyms/${gymId}/finance/ledger`,
    PAYMENTS: (gymId) => `${API_PREFIX}/gyms/${gymId}/finance/payments`,
    EXPENSES: (gymId) => `${API_PREFIX}/gyms/${gymId}/finance/expenses`,
    REPORTS: (gymId) => `${API_PREFIX}/gyms/${gymId}/finance/reports`,
  },
  TRAINERS: {
    PERFORMANCE: (gymId) => `${API_PREFIX}/gyms/${gymId}/trainers/performance`,
    BY_ID: (gymId, trainerId) => `${API_PREFIX}/gyms/${gymId}/trainers/${trainerId}`,
  },
  CHAT: {
    MESSAGES: (gymId) => `${API_PREFIX}/gyms/${gymId}/chat/messages`,
    MESSAGE: (gymId, messageId) => `${API_PREFIX}/gyms/${gymId}/chat/messages/${messageId}`,
    PIN: (gymId, messageId) => `${API_PREFIX}/gyms/${gymId}/chat/messages/${messageId}/pin`,
  },
  MEDIA_ADS: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/media-ads`,
    CREATE: (gymId) => `${API_PREFIX}/gyms/${gymId}/media-ads`,
    BY_ID: (gymId, adId) => `${API_PREFIX}/gyms/${gymId}/media-ads/${adId}`,
    UPDATE: (gymId, adId) => `${API_PREFIX}/gyms/${gymId}/media-ads/${adId}`,
    DELETE: (gymId, adId) => `${API_PREFIX}/gyms/${gymId}/media-ads/${adId}`,
  },
  BANNERS: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/banners`,
    STATS: (gymId) => `${API_PREFIX}/gyms/${gymId}/banners/stats`,
    BY_ID: (gymId, bannerId) => `${API_PREFIX}/gyms/${gymId}/banners/${bannerId}`,
    CREATE: (gymId) => `${API_PREFIX}/gyms/${gymId}/banners`,
    UPDATE: (gymId, bannerId) => `${API_PREFIX}/gyms/${gymId}/banners/${bannerId}`,
    DELETE: (gymId, bannerId) => `${API_PREFIX}/gyms/${gymId}/banners/${bannerId}`,
    DUPLICATE: (gymId, bannerId) => `${API_PREFIX}/gyms/${gymId}/banners/${bannerId}/duplicate`,
  },
  ADMIN: {
    DASHBOARD: `${API_PREFIX}/admin/dashboard`,
  },
  HEALTH: `${API_PREFIX}/health`,
  INVITES: {
    PLANS: `${API_PREFIX}/invites/plans`,
    LIST: `${API_PREFIX}/invites`,
    OVERVIEW: (id) => `${API_PREFIX}/invites/${id}/overview`,
    RECORDS: (id) => `${API_PREFIX}/invites/${id}/records`,
    CREATE: `${API_PREFIX}/invites`,
    MARK_SENT: (id) => `${API_PREFIX}/invites/${id}/sent`,
    REVOKE: (id) => `${API_PREFIX}/invites/${id}/revoke`,
    PUBLISH: (id) => `${API_PREFIX}/invites/${id}/publish`,
    APP_ADS: (id) => `${API_PREFIX}/invites/${id}/app-ads`,
    PUBLIC: (token) => `${API_PREFIX}/invites/public/${token}`,
    CHECKOUT: (token) => `${API_PREFIX}/invites/public/${token}/checkout`,
    VERIFY_PAYMENT: (token) => `${API_PREFIX}/invites/public/${token}/verify-payment`,
  },
  SAAS_PLANS: {
    LIST: `${API_PREFIX}/subscription-plans`,
    BY_ID: (id) => `${API_PREFIX}/subscription-plans/${id}`,
    UPDATE: (id) => `${API_PREFIX}/subscription-plans/${id}`,
  },
  GYM_OWNERS: {
    LIST: `${API_PREFIX}/gym-owners`,
    UPDATE_STATUS: (id) => `${API_PREFIX}/gym-owners/${id}/status`,
    RESET_PASSWORD: (id) => `${API_PREFIX}/gym-owners/${id}/password`,
  },
  TRANSACTIONS: {
    LIST: `${API_PREFIX}/transactions`,
    BY_ID: (id) => `${API_PREFIX}/transactions/${id}`,
  },
  MEDIA: {
    UPLOAD: `${API_PREFIX}/media/upload`,
    UPLOAD_MANY: `${API_PREFIX}/media/upload-many`,
  },
  SUPPORT: {
    TICKETS: `${API_PREFIX}/support/tickets`,
    BY_ID: (ticketId) => `${API_PREFIX}/support/tickets/${ticketId}`,
    REPLY: (ticketId) => `${API_PREFIX}/support/tickets/${ticketId}/replies`,
    UPDATE_STATUS: (ticketId) => `${API_PREFIX}/support/tickets/${ticketId}/status`,
  },
};

export default ENDPOINTS;
