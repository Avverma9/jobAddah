import axios from 'axios';
import { baseUrl } from './baseUrl';
import { decryptResponse } from './encode-decode';

const instance = axios.create({
  baseURL: baseUrl,
  timeout: 15000,
});

// Basic interceptors (can be extended: auth, logging, retry etc.)
instance.interceptors.request.use(
  (cfg) => {
    // e.g. attach auth token here if needed
    return cfg;
  },
  (err) => Promise.reject(err)
);

instance.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

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
  async request(config) {
    const res = await instance.request(config);
    return normalize(res);
  },
  async get(url, config) {
    const res = await instance.get(url, config);
    return normalize(res);
  },
  async post(url, data, config) {
    const res = await instance.post(url, data, config);
    return normalize(res);
  },
  async put(url, data, config) {
    const res = await instance.put(url, data, config);
    return normalize(res);
  },
  async del(url, config) {
    const res = await instance.delete(url, config);
    return normalize(res);
  },
};

export default api;
