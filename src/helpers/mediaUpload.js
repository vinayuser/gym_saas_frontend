import { toast } from 'react-toastify';
import axiosInstance from '../config/axiosInstance';
import ENDPOINTS from '../config/apiUrls';

/**
 * Upload a single image or video to Cloudinary via the API.
 * @param {File} file
 * @param {{ folder: string, inviteToken?: string, resourceType?: 'image'|'video'|'auto' }} options
 * @returns {Promise<{ url: string, publicId: string, resourceType: string }>}
 */
export const uploadMediaFile = async (file, { folder, inviteToken, resourceType }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (resourceType) formData.append('resourceType', resourceType);

  const params = {};
  if (inviteToken) params.inviteToken = inviteToken;

  try {
    const response = await axiosInstance.post(ENDPOINTS.MEDIA.UPLOAD, formData, {
      params,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.asset;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || 'Upload failed';
    toast.error(message);
    throw error;
  }
};

/**
 * Upload multiple images (max 5 per request).
 */
export const uploadMediaFiles = async (files, { folder, inviteToken }) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('folder', folder);

  const params = {};
  if (inviteToken) params.inviteToken = inviteToken;

  try {
    const response = await axiosInstance.post(ENDPOINTS.MEDIA.UPLOAD_MANY, formData, {
      params,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.assets;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || 'Upload failed';
    toast.error(message);
    throw error;
  }
};

/** Local preview URL (not persisted). */
export const filePreviewUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
