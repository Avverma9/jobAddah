import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change — include search so navigating to
    // the same pathname with different query params (e.g. /post?_id=...) resets scroll.
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (err) {
      window.scrollTo(0, 0);
    }
  // include pathname and search explicitly to catch query changes
  }, [location.pathname, location.search]);

  return null;
}
