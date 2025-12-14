// src/components/ads/AdContainer.jsx
// Smart container that manages space when ads are hidden

import React from 'react';
import { useAdControl } from '../../hooks/useAdControl';
import SmartAdSense from './SmartAdSense';

const AdContainer = ({ 
  placement,
  pageType = 'default',
  children,
  className = '',
  adProps = {},
  showPlaceholder = false,
  placeholderText = 'Advertisement'
}) => {
  const { shouldShow, isLoading } = useAdControl(placement, pageType);

  // Loading state - don't take space
  if (isLoading) {
    return null;
  }

  // Ad should show
  if (shouldShow) {
    return (
      <div className={className}>
        <SmartAdSense 
          placement={placement}
          pageType={pageType}
          {...adProps}
        />
        {children}
      </div>
    );
  }

  // Ad hidden - show placeholder or children only
  if (showPlaceholder && import.meta.env.DEV) {
    return (
      <div className={className}>
        <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{placeholderText} (Hidden)</p>
        </div>
        {children}
      </div>
    );
  }

  // Just return children without ad space
  return children ? <div className={className}>{children}</div> : null;
};

export default AdContainer;