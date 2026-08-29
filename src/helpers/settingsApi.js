import ENDPOINTS from '../config/apiUrls';
import { patchRequest } from '../config/dataApi';

export const saveNotificationPreferences = (preferences) =>
  patchRequest(ENDPOINTS.AUTH.NOTIFICATION_PREFERENCES, preferences);
