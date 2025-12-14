# Loader System Usage Guide

## Overview
The JobsAddah app now includes a comprehensive loader system with a 50-second countdown timer and the JobsAddah logo for all API calls and network requests.

## Components Created

### 1. `Loader.jsx` - Main Loader Component
- Displays JobsAddah logo with animation
- Shows countdown timer (default 50 seconds)
- Includes progress bar and loading message
- Responsive design with dark mode support

### 2. `GlobalLoader.jsx` - Context Provider
- Provides global loader state management
- Wraps the entire app for consistent loading experience
- Includes `LoaderProvider` and `useGlobalLoader` hook

### 3. `useLoader.js` - Local Loader Hook
- For component-specific loading states
- Can be used independently without global context

### 4. `apiWithLoader.js` - API Utility
- Wrapper for axios calls with automatic loader
- Provides GET, POST, PUT, DELETE methods with loader integration

## Usage Examples

### 1. Using Global Loader in Components

```jsx
import { useGlobalLoader } from '../components/GlobalLoader';

const MyComponent = () => {
  const { showLoader, hideLoader, withLoader } = useGlobalLoader();

  // Method 1: Manual control
  const handleManualLoader = async () => {
    showLoader('Processing request...', 30);
    try {
      // Your API call here
      await someApiCall();
    } finally {
      hideLoader();
    }
  };

  // Method 2: Automatic with withLoader
  const handleAutoLoader = async () => {
    try {
      const result = await withLoader(
        () => someApiCall(),
        'Loading data...',
        45
      );
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={handleManualLoader}>Manual Loader</button>
      <button onClick={handleAutoLoader}>Auto Loader</button>
    </div>
  );
};
```

### 2. Using API Utility with Loader

```jsx
import { useGlobalLoader } from '../components/GlobalLoader';
import { createApiWithLoader } from '../utils/apiWithLoader';

const DataComponent = () => {
  const loaderHook = useGlobalLoader();
  const api = createApiWithLoader(loaderHook);

  const fetchJobs = async () => {
    try {
      const jobs = await api.get(
        '/api/jobs',
        {},
        'Loading latest jobs...',
        40
      );
      setJobs(jobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const submitApplication = async (data) => {
    try {
      const result = await api.post(
        '/api/applications',
        data,
        {},
        'Submitting application...',
        60
      );
      console.log('Application submitted:', result);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <div>
      <button onClick={fetchJobs}>Load Jobs</button>
      <button onClick={() => submitApplication(formData)}>
        Submit Application
      </button>
    </div>
  );
};
```

### 3. Using Local Loader Hook

```jsx
import { useLoader } from '../hooks/useLoader';
import Loader from '../components/Loader';

const LocalLoaderComponent = () => {
  const {
    isLoading,
    loadingMessage,
    timeoutSeconds,
    showLoader,
    hideLoader,
    withLoader,
    handleTimeout
  } = useLoader(45); // 45 second default timeout

  const fetchData = async () => {
    try {
      const data = await withLoader(
        () => fetch('/api/data').then(res => res.json()),
        'Fetching important data...',
        30
      );
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      
      <Loader
        isVisible={isLoading}
        message={loadingMessage}
        countdownSeconds={timeoutSeconds}
        onTimeout={handleTimeout}
      />
    </div>
  );
};
```

## Integration in Existing Code

### Updated Pages with Loader Integration

#### 1. `homescreen.jsx`
- **Dynamic Sections API**: "Loading latest job sections..." (50s timeout)
- **Private Jobs API**: "Loading private job opportunities..." (50s timeout)  
- **Reminders API**: "Loading job reminders and deadlines..." (50s timeout)
- **Featured Posts API**: "Loading featured job posts..." (50s timeout)

#### 2. `view-all.jsx`
- **Category Data API**: "Loading {Category Name}..." (50s timeout)
- Handles different post types (JOB, ADMIT_CARD, RESULT, etc.)

#### 3. `post.jsx`
- **Job Details API**: "Loading job details..." (50s timeout)
- Handles both URL and ID-based post fetching

### Ad Control Hook (No Loader)
The `useAdControl.js` hook does NOT use loader as it's for ad configuration, not main content:

```jsx
// Ad control - NO loader (fast background operation)
const res = await axios.get(`${baseUrl}/ad-config`, {
  headers: { "X-Publisher-ID": PUBLISHER_ID }
});
```

## Customization Options

### Loader Props
- `isVisible`: Boolean to show/hide loader
- `message`: Custom loading message
- `countdownSeconds`: Timeout duration (default: 50)
- `onTimeout`: Callback when timeout reaches 0

### Styling
The loader uses Tailwind CSS classes and supports:
- Dark mode with `dark:` prefixes
- Responsive design
- Smooth animations and transitions
- JobsAddah brand colors (teal/cyan gradient)

## Best Practices

1. **Use Global Loader** for most API calls to maintain consistency
2. **Set appropriate timeouts** based on expected response times
3. **Provide meaningful messages** that describe what's loading
4. **Handle timeouts gracefully** with proper error handling
5. **Use Local Loader** only when you need isolated loading states

## Timeout Handling

When the countdown reaches 0:
- Loader automatically hides
- `onTimeout` callback is triggered
- Console warning is logged
- Component can handle timeout state as needed

## Performance Notes

- Loader uses efficient React hooks and context
- Animations are CSS-based for smooth performance
- Countdown timer uses `setInterval` with proper cleanup
- No unnecessary re-renders with proper memoization

This loader system ensures a consistent, professional loading experience across the entire JobsAddah application while providing flexibility for different use cases.