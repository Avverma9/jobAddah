import { useState, useCallback } from 'react';

export const useLoader = (defaultTimeout = 50) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [timeoutSeconds, setTimeoutSeconds] = useState(defaultTimeout);

  const showLoader = useCallback((message = 'Loading...', timeout = defaultTimeout) => {
    setLoadingMessage(message);
    setTimeoutSeconds(timeout);
    setIsLoading(true);
  }, [defaultTimeout]);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoader = useCallback(async (
    asyncFunction, 
    message = 'Loading...', 
    timeout = defaultTimeout
  ) => {
    try {
      showLoader(message, timeout);
      const result = await asyncFunction();
      return result;
    } catch (error) {
      throw error;
    } finally {
      hideLoader();
    }
  }, [showLoader, hideLoader, defaultTimeout]);

  const handleTimeout = useCallback(() => {
    setIsLoading(false);
    console.warn('Loader timeout reached');
  }, []);

  return {
    isLoading,
    loadingMessage,
    timeoutSeconds,
    showLoader,
    hideLoader,
    withLoader,
    handleTimeout
  };
};