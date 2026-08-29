import ENDPOINTS from '../config/apiUrls';
import { getRequest, patchRequest, postRequest, deleteRequest } from '../config/dataApi';
import { getRefreshToken } from './utils';

const withRefreshToken = (params = {}) => ({
  ...params,
  refreshToken: getRefreshToken(),
});

export const changePassword = (payload) =>
  patchRequest(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
    ...payload,
    refreshToken: getRefreshToken(),
  });

export const fetchSessions = () =>
  getRequest(ENDPOINTS.AUTH.SESSIONS, { params: withRefreshToken() });

export const revokeSession = (sessionId) =>
  deleteRequest(ENDPOINTS.AUTH.SESSION(sessionId), {
    params: withRefreshToken(),
  });

export const revokeOtherSessions = () =>
  postRequest(ENDPOINTS.AUTH.REVOKE_OTHER_SESSIONS, {
    refreshToken: getRefreshToken(),
  });

export const fetchTwoFactorStatus = () => getRequest(ENDPOINTS.AUTH.TWO_FACTOR_STATUS);

export const setupTwoFactor = () => postRequest(ENDPOINTS.AUTH.TWO_FACTOR_SETUP, {});

export const verifyTwoFactorSetup = (code) =>
  postRequest(ENDPOINTS.AUTH.TWO_FACTOR_VERIFY, { code });

export const disableTwoFactor = (payload) =>
  postRequest(ENDPOINTS.AUTH.TWO_FACTOR_DISABLE, payload);

export const verifyTwoFactorLogin = (payload) =>
  postRequest(ENDPOINTS.AUTH.LOGIN_2FA, payload);

export const parseUserAgent = (userAgent) => {
  if (!userAgent) return 'Unknown device';
  if (/iPhone|iPad/i.test(userAgent)) return 'Apple mobile device';
  if (/Android/i.test(userAgent)) return 'Android device';
  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Mac OS X/i.test(userAgent)) return 'macOS';
  if (/Linux/i.test(userAgent)) return 'Linux';
  return userAgent.slice(0, 60);
};

export const formatSessionTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};
