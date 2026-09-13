/**
 * True while a stored access token exists but profile restore has not finished.
 * Do NOT use auth.loading here — login/2FA also set loading and would unmount AuthLayout.
 */
export const isAuthRestoring = ({ token, profileFetchStatus }) =>
  Boolean(token) && profileFetchStatus !== 'succeeded' && profileFetchStatus !== 'failed';

export const isAuthReady = (auth) => !isAuthRestoring(auth);
