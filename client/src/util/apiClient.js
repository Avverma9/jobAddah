import axios from 'axios';
import { baseUrl } from './baseUrl';
import { decryptResponse } from './encode-decode';
import { loaderRequestStart, loaderRequestEnd } from './loaderManager';

const instance = axios.create({
  baseURL: baseUrl,
  timeout: 15000,
});

const DEFAULT_LOADER_MESSAGE = 'Loading...';
const DEFAULT_LOADER_TIMEOUT = 50;

const extractLoaderOptions = (config = {}) => {
  const {
    loader = {},
    showLoader,
    loaderMessage,
    loaderTimeout,
    ...axiosConfig
  } = config || {};

  const enabled = typeof showLoader === 'boolean'
    ? showLoader
    : loader.enabled ?? false;

  const message = loader.message ?? loaderMessage ?? DEFAULT_LOADER_MESSAGE;
  const timeout = loader.timeout ?? loaderTimeout ?? DEFAULT_LOADER_TIMEOUT;

  return {
    axiosConfig,
    loaderOptions: {
      enabled,
      message,
      timeout,
    },
  };
};

const runWithLoader = async (fn, loaderOptions) => {
  let managed = false;

  if (loaderOptions.enabled) {
    loaderRequestStart(loaderOptions.message, loaderOptions.timeout);
    managed = true;
  }

  try {
    return await fn();
  } finally {
    if (managed) {
      loaderRequestEnd();
    }
  }
};

const normalize = (res) => {
  const data = res?.data;
  if (data && data.iv && data.data) {
    const decrypted = decryptResponse(data);
    return decrypted ?? data;
  }
  return data;
};

const api = {
  rawInstance: instance,
  async request(config = {}) {
    const { axiosConfig, loaderOptions } = extractLoaderOptions(config);
    const res = await runWithLoader(() => instance.request(axiosConfig), loaderOptions);
    return normalize(res);
  },
  async get(url, config = {}) {
    const { axiosConfig, loaderOptions } = extractLoaderOptions(config);
    const res = await runWithLoader(() => instance.get(url, axiosConfig), loaderOptions);
    return normalize(res);
  },
  async post(url, data, config = {}) {
    const { axiosConfig, loaderOptions } = extractLoaderOptions(config);
    const res = await runWithLoader(() => instance.post(url, data, axiosConfig), loaderOptions);
    return normalize(res);
  },
  async put(url, data, config = {}) {
    const { axiosConfig, loaderOptions } = extractLoaderOptions(config);
    const res = await runWithLoader(() => instance.put(url, data, axiosConfig), loaderOptions);
    return normalize(res);
  },
  async del(url, config = {}) {
    const { axiosConfig, loaderOptions } = extractLoaderOptions(config);
    const res = await runWithLoader(() => instance.delete(url, axiosConfig), loaderOptions);
    return normalize(res);
  },
};

export default api;
