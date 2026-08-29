const API_PREFIX = import.meta.env.VITE_API_BASE_URL;

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
  },
  TENANT: {
    ME: `${API_PREFIX}/tenants/me`,
  },
  GYMS: {
    LIST: `${API_PREFIX}/gyms`,
    DASHBOARD: (gymId) => `${API_PREFIX}/gyms/${gymId}/dashboard`,
    BY_ID: (id) => `${API_PREFIX}/gyms/${id}`,
    CREATE: `${API_PREFIX}/gyms`,
    UPDATE: (id) => `${API_PREFIX}/gyms/${id}`,
    DELETE: (id) => `${API_PREFIX}/gyms/${id}`,
  },
  MEMBERS: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/members`,
    BY_ID: (gymId, memberId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}`,
    CREATE: (gymId) => `${API_PREFIX}/gyms/${gymId}/members`,
    UPDATE: (gymId, memberId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}`,
    DELETE: (gymId, memberId) => `${API_PREFIX}/gyms/${gymId}/members/${memberId}`,
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
  },
  ENQUIRIES: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/enquiries`,
    BY_ID: (gymId, enquiryId) => `${API_PREFIX}/gyms/${gymId}/enquiries/${enquiryId}`,
    CREATE: (gymId) => `${API_PREFIX}/gyms/${gymId}/enquiries`,
    UPDATE: (gymId, enquiryId) => `${API_PREFIX}/gyms/${gymId}/enquiries/${enquiryId}`,
    DELETE: (gymId, enquiryId) => `${API_PREFIX}/gyms/${gymId}/enquiries/${enquiryId}`,
  },
  ATTENDANCE: {
    LIST: (gymId) => `${API_PREFIX}/gyms/${gymId}/attendance`,
    CHECK_IN: (gymId) => `${API_PREFIX}/gyms/${gymId}/attendance/check-in`,
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
  },
  CHAT: {
    MESSAGES: (gymId) => `${API_PREFIX}/gyms/${gymId}/chat/messages`,
    MESSAGE: (gymId, messageId) => `${API_PREFIX}/gyms/${gymId}/chat/messages/${messageId}`,
    PIN: (gymId, messageId) => `${API_PREFIX}/gyms/${gymId}/chat/messages/${messageId}/pin`,
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
  HEALTH: `${API_PREFIX}/health`,
  INVITES: {
    PLANS: `${API_PREFIX}/invites/plans`,
    LIST: `${API_PREFIX}/invites`,
    CREATE: `${API_PREFIX}/invites`,
    MARK_SENT: (id) => `${API_PREFIX}/invites/${id}/sent`,
    REVOKE: (id) => `${API_PREFIX}/invites/${id}/revoke`,
    PUBLIC: (token) => `${API_PREFIX}/invites/public/${token}`,
    CHECKOUT: (token) => `${API_PREFIX}/invites/public/${token}/checkout`,
    VERIFY_PAYMENT: (token) => `${API_PREFIX}/invites/public/${token}/verify-payment`,
  },
  GYM_OWNERS: {
    LIST: `${API_PREFIX}/gym-owners`,
    UPDATE_STATUS: (id) => `${API_PREFIX}/gym-owners/${id}/status`,
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
    UPDATE_STATUS: (ticketId) => `${API_PREFIX}/support/tickets/${ticketId}/status`,
  },
};

export default ENDPOINTS;
