import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../analytics/tracker';

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(`${location.pathname}${location.hash || ''}`);
  }, [location.hash, location.pathname]);

  return null;
};

export default AnalyticsTracker;
