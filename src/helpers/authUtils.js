/** True while a stored token exists but the session/profile is not resolved yet. */
export const isAuthRestoring = ({ token, profileFetchStatus, loading }) =>
  loading ||
  (Boolean(token) && profileFetchStatus !== 'succeeded' && profileFetchStatus !== 'failed');

export const isAuthReady = (auth) => !isAuthRestoring(auth);
