# Global Loader Guide

This document explains how the automatic global loader works in this application.

## What It Is

The global loader is a full-screen loading indicator that automatically appears whenever an API call is in progress and disappears when the call is complete. This prevents the need to manually manage loading states within individual components.

## How It Works

The system is built on three core parts of the application:

1.  **Redux State (`redux/slices/ui.js`)**
    *   A dedicated Redux slice named `ui` manages a global boolean state called `isLoading`.
    *   `isLoading: true` means an API call is active.
    *   `isLoading: false` means no API calls are active.

2.  **Axios Interceptors (`util/api.js`)**
    *   The central `axios` instance in `api.js` is configured with "interceptors."
    *   **Request Interceptor**: Before any API request is sent, this interceptor dispatches a Redux action to set `isLoading` to `true`.
    *   **Response Interceptor**: As soon as a response is received (whether it's a success or an error), this interceptor dispatches an action to set `isLoading` to `false`.

3.  **Layout Component (`src/dashboard/Layout.jsx`)**
    *   The main `Layout.jsx` component subscribes to the `isLoading` state from the Redux store.
    *   It conditionally renders the `<Loader />` component as a full-screen overlay whenever `isLoading` is `true`.

## How to Use It

**It's automatic.**

You do not need to do anything special to trigger the loader. As long as you make your API calls using the configured `axios` instance, the loader will appear automatically.

**Example API Call:**

```javascript
import api from './util/api'; // Make sure to import the central api instance

const fetchJobs = async () => {
  // The loader will automatically appear here
  try {
    const response = await api.get('/jobs'); 
    // ...and disappear here, after the data is received
    return response.data;
  } catch (error) {
    // The loader will also disappear if an error occurs
    console.error("Failed to fetch jobs:", error);
  }
};
```

There is no need to add `<Loader />` to your components manually for API-related loading.
