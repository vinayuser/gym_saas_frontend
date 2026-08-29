import axiosInstance from './axiosInstance';
import { toast } from 'react-toastify';

/** Dedupe identical in-flight GETs (e.g. React Strict Mode double-mount in dev). */
const inflightGetRequests = new Map();

export const getRequest = async (url, config = {}) => {
  const cacheKey = `${url}::${JSON.stringify(config.params || {})}`;

  if (inflightGetRequests.has(cacheKey)) {
    return inflightGetRequests.get(cacheKey);
  }

  const promise = axiosInstance
    .get(url, config)
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error in GET request:', error);
      throw error;
    })
    .finally(() => {
      inflightGetRequests.delete(cacheKey);
    });

  inflightGetRequests.set(cacheKey, promise);
  return promise;
};

export const postRequest = async (url, data, config = {}) => {
  try {
    const response = await axiosInstance.post(url, data, config);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      'Request failed';
    toast.error(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeButton: true,
    });
    console.error('Error in POST request:', error);
    throw error;
  }
};

export const putRequest = async (url, data, config = {}) => {
  try {
    const response = await axiosInstance.put(url, data, config);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Update failed';
    toast.error(message, { position: 'top-right', autoClose: 5000 });
    throw error;
  }
};

export const patchRequest = async (url, data, config = {}) => {
  try {
    const response = await axiosInstance.patch(url, data, config);
    return response.data;
  } catch (error) {
    console.error('Error in PATCH request:', error);
    throw error;
  }
};

export const deleteRequest = async (url, config = {}) => {
  try {
    const response = await axiosInstance.delete(url, config);
    return response.data;
  } catch (error) {
    let errorMessage = 'Failed to delete resource';

    if (error.response) {
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.errors?.[0]?.message) {
        errorMessage = error.response.data.errors[0].message;
      } else {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid request for deletion.';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            break;
          case 403:
            errorMessage = "Forbidden. You don't have permission to delete this resource.";
            break;
          case 404:
            errorMessage = 'Resource not found for deletion.';
            break;
          case 409:
            errorMessage = 'Conflict. Resource cannot be deleted due to dependencies.';
            break;
          case 422:
            errorMessage = 'Validation error. Resource cannot be deleted.';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
          default:
            errorMessage = `Deletion failed with status ${error.response.status}`;
        }
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection.';
    }

    toast.error(errorMessage, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeButton: true,
    });

    throw error;
  }
};
