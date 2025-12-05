import axios from "axios";
import { baseUrl } from "./url";
import store from "../redux/store";
import { setLoading } from "../redux/slices/ui";

// Base axios instance
const api = axios.create({
  baseURL: baseUrl,
  withCredentials: false,
});

// Auth header helper
const authHeader = () => {
  try {
    const token = localStorage.getItem("token");
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  } catch {
    return {};
  }
};

const forceLogout = () => {
  try {
    localStorage.removeItem("token");
  } catch {}
  // Optional: backend logout call (non-blocking fire & forget)
  try {
    fetch(`${baseUrl}/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  } catch {}
  window.location.href = "/";
};

// REQUEST interceptor
api.interceptors.request.use(
  (config) => {
    store.dispatch(setLoading(true));
    const headers = authHeader();
    config.headers = {
      "Content-Type": "application/json",
      ...config.headers,
      ...headers,
    };
    return config;
  },
  (error) => {
    store.dispatch(setLoading(false));
    return Promise.reject(error);
  }
);

// RESPONSE interceptor
api.interceptors.response.use(
  (response) => {
    store.dispatch(setLoading(false));

    // Safety: agar kisi success response me backend banned flag bhej de
    if (
      response.data?.banned === true ||
      response.data?.user?.banned === true
    ) {
      forceLogout();
      return Promise.reject(new Error("User banned"));
    }

    return response;
  },
  (error) => {
    store.dispatch(setLoading(false));

    const status = error.response?.status;
    const data = error.response?.data;

    // 401 -> token invalid/expired
    if (status === 401) {
      forceLogout();
    }

    // 403 + banned -> user ban ho chuka hai
    if (
      status === 403 &&
      (data?.banned === true || /banned/i.test(data?.message || ""))
    ) {
      forceLogout();
    }

    return Promise.reject(error);
  }
);

export default api;
