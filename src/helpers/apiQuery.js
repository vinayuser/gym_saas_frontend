/** Build query string from list params; strips gymId and empty values. */
export const buildListQuery = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([key, value]) =>
      key !== 'gymId' &&
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== 'undefined'
  );
  if (!entries.length) return '';
  return new URLSearchParams(Object.fromEntries(entries)).toString();
};

export const withQuery = (baseUrl, params) => {
  const query = buildListQuery(params);
  return query ? `${baseUrl}?${query}` : baseUrl;
};
