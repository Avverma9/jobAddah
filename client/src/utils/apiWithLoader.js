import api from './apiClient';

// Utility function to make API calls with automatic loader
export const createApiWithLoader = (loaderHook) => {
  const { withLoader } = loaderHook;

  const apiCall = async (config, loaderMessage = 'Loading...', timeout = 50) => {
    const requestConfig = {
      ...config,
      showLoader: false,
    };

    if (config?.loader) {
      requestConfig.loader = { ...config.loader, enabled: false };
    } else {
      requestConfig.loader = { enabled: false };
    }

    return withLoader(async () => {
      const response = await api.request(requestConfig);
      return response;
    }, loaderMessage, timeout);
  };

  const get = (url, config = {}, loaderMessage = 'Fetching data...', timeout = 50) => {
    return apiCall({ method: 'GET', url, ...config }, loaderMessage, timeout);
  };

  const post = (url, data, config = {}, loaderMessage = 'Submitting...', timeout = 50) => {
    return apiCall({ method: 'POST', url, data, ...config }, loaderMessage, timeout);
  };

  const put = (url, data, config = {}, loaderMessage = 'Updating...', timeout = 50) => {
    return apiCall({ method: 'PUT', url, data, ...config }, loaderMessage, timeout);
  };

  const del = (url, config = {}, loaderMessage = 'Deleting...', timeout = 50) => {
    return apiCall({ method: 'DELETE', url, ...config }, loaderMessage, timeout);
  };

  return { get, post, put, delete: del, apiCall };
};

// Example usage in components:
/*
import { useGlobalLoader } from '../components/GlobalLoader';
import { createApiWithLoader } from '../utils/apiWithLoader';

const MyComponent = () => {
  const loaderHook = useGlobalLoader();
  const api = createApiWithLoader(loaderHook);

  const fetchData = async () => {
    try {
      const data = await api.get('/api/data', {}, 'Loading jobs...', 30);
      console.log(data);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  return (
    <button onClick={fetchData}>
      Fetch Data
    </button>
  );
};
*/