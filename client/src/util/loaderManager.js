let showHandler = null;
let hideHandler = null;
let activeRequests = 0;

/**
 * Register handlers from React LoaderProvider so non-React modules (like api client)
 * can trigger the global loader.
 */
export const registerLoaderHandlers = ({ showLoader, hideLoader }) => {
  showHandler = showLoader;
  hideHandler = hideLoader;
};

export const unregisterLoaderHandlers = () => {
  showHandler = null;
  hideHandler = null;
  activeRequests = 0;
};

export const loaderRequestStart = (message = 'Loading...', timeout = 50) => {
  if (!showHandler) return;
  activeRequests += 1;
  if (activeRequests === 1) {
    showHandler(message, timeout);
  }
};

export const loaderRequestEnd = () => {
  if (!hideHandler || activeRequests === 0) return;
  activeRequests = Math.max(activeRequests - 1, 0);
  if (activeRequests === 0) {
    hideHandler();
  }
};
