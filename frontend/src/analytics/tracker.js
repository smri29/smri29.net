const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const VISITOR_ID_KEY = 'portfolio_visitor_id';
const SESSION_ID_KEY = 'portfolio_session_id';

let lastPageViewFingerprint = '';

const createId = (prefix) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

const getStorageValue = (storage, key, prefix) => {
  try {
    const existing = storage.getItem(key);
    if (existing) {
      return existing;
    }

    const nextValue = createId(prefix);
    storage.setItem(key, nextValue);
    return nextValue;
  } catch {
    return createId(prefix);
  }
};

export const getVisitorId = () => getStorageValue(window.localStorage, VISITOR_ID_KEY, 'visitor');
export const getSessionId = () => getStorageValue(window.sessionStorage, SESSION_ID_KEY, 'session');

const buildBasePayload = () => ({
  visitorId: getVisitorId(),
  sessionId: getSessionId(),
  pagePath: `${window.location.pathname}${window.location.hash || ''}`,
  pageTitle: document.title,
  pageUrl: window.location.href,
  referrer: document.referrer || '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  language: navigator.language || '',
  screenWidth: window.screen?.width || null,
  screenHeight: window.screen?.height || null,
  source: 'portfolio-frontend',
});

const postAnalytics = async (payload) => {
  try {
    await fetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.warn('Analytics tracking failed.', error);
  }
};

export const trackAnalyticsEvent = (eventType, eventName, metadata = {}, overrides = {}) => {
  const payload = {
    ...buildBasePayload(),
    eventType,
    eventName,
    metadata,
    ...overrides,
  };

  void postAnalytics(payload);
};

export const trackPageView = (pathOverride = '') => {
  const path = pathOverride || `${window.location.pathname}${window.location.hash || ''}`;
  const fingerprint = `${path}|${document.title}`;
  if (lastPageViewFingerprint === fingerprint) {
    return;
  }

  lastPageViewFingerprint = fingerprint;
  trackAnalyticsEvent('page_view', 'page_view', {}, { pagePath: path });
};
