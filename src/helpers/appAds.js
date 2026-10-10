export const DEFAULT_APP_ADS = {
  banners: true,
  video: false,
  audio: false,
};

export const APP_AD_CHANNELS = [
  { key: 'banners', label: 'Banners' },
  { key: 'video', label: 'Video ads' },
  { key: 'audio', label: 'Audio ads' },
];

export const appAdsOf = (gym) => {
  const src = gym?.appAds && typeof gym.appAds === 'object' ? gym.appAds : {};
  return {
    banners: src.banners !== undefined ? Boolean(src.banners) : gym?.adsEnabled !== false,
    video: Boolean(src.video),
    audio: Boolean(src.audio),
  };
};
