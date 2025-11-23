import axios from "axios";
import { baseUrl } from "./url";
import store from "../redux/store"; // Import the Redux store
import { setLoading } from "../redux/slices/ui"; // Import the setLoading action

// Base axios instance
const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true, // if you use httpOnly cookies; safe to keep
});

// Simple authHeader helper
const authHeader = () => {
  try {
    const token = localStorage.getItem('token');
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  } catch (err) {
    return {};
  }
};

// Request interceptor: attach Authorization and show loader
api.interceptors.request.use(
  (config) => {
    store.dispatch(setLoading(true)); // Show loader
    const headers = authHeader();
    config.headers = {
      "Content-Type": "application/json",
      ...config.headers,
      ...headers,
    };
    return config;
  },
  (error) => {
    store.dispatch(setLoading(false)); // Hide loader on request error
    return Promise.reject(error);
  }
);

// Response interceptor: handle errors and hide loader
api.interceptors.response.use(
  (response) => {
    store.dispatch(setLoading(false)); // Hide loader on success
    return response;
  },
  (error) => {
    store.dispatch(setLoading(false)); // Hide loader on response error
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access - token may be expired');
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/'; // Redirect to the login page
    }
    return Promise.reject(error);
  }
);

export default api;
