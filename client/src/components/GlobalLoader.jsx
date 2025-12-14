import React, { createContext, useContext, useState, useCallback } from 'react';
import Loader from './Loader';

const LoaderContext = createContext();

export const useGlobalLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useGlobalLoader must be used within a LoaderProvider');
  }
  return context;
};

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [timeoutSeconds, setTimeoutSeconds] = useState(50);

  const showLoader = useCallback((message = 'Loading...', timeout = 50) => {
    setLoadingMessage(message);
    setTimeoutSeconds(timeout);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoader = useCallback(async (
    asyncFunction, 
    message = 'Loading...', 
    timeout = 50
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
  }, [showLoader, hideLoader]);

  const handleTimeout = useCallback(() => {
    setIsLoading(false);
    console.warn('Global loader timeout reached');
  }, []);

  const value = {
    isLoading,
    loadingMessage,
    timeoutSeconds,
    showLoader,
    hideLoader,
    withLoader,
    handleTimeout
  };

  return (
    <LoaderContext.Provider value={value}>
      {children}
      <Loader
        isVisible={isLoading}
        message={loadingMessage}
        countdownSeconds={timeoutSeconds}
        onTimeout={handleTimeout}
      />
    </LoaderContext.Provider>
  );
};