const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const VISITOR_ID_KEY = 'portfolio_visitor_id';
const SESSION_ID_KEY = 'portfolio_session_id';
const EXCLUDED_PATH_PREFIXES = ['/dashboard', '/admin', '/login'];
const GATE_STORAGE_KEY = 'turnstile_gate_pass';

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
export const getTurnstileGateToken = () => {
  try {
    const raw = window.localStorage.getItem(GATE_STORAGE_KEY);
    if (!raw) {
      return '';
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.expiresAt || !parsed?.token) {
      return '';
    }

    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      window.localStorage.removeItem(GATE_STORAGE_KEY);
      return '';
    }

    return String(parsed.token);
  } catch {
    return '';
  }
};

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
        ...(getTurnstileGateToken() ? { 'x-turnstile-gate-token': getTurnstileGateToken() } : {}),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.warn('Analytics tracking failed.', error);
  }
};

const isAnalyticsExcludedPath = (path) =>
  EXCLUDED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

export const trackAnalyticsEvent = (eventType, eventName, metadata = {}, overrides = {}) => {
  const pagePath = overrides.pagePath || `${window.location.pathname}${window.location.hash || ''}`;
  if (isAnalyticsExcludedPath(pagePath)) {
    return;
  }

  const payload = {
    ...buildBasePayload(),
    eventType,
    eventName,
    metadata,
    pagePath,
    ...overrides,
  };

  void postAnalytics(payload);
};

export const trackPageView = (pathOverride = '') => {
  const path = pathOverride || `${window.location.pathname}${window.location.hash || ''}`;
  if (isAnalyticsExcludedPath(path)) {
    return;
  }

  const fingerprint = `${path}|${document.title}`;
  if (lastPageViewFingerprint === fingerprint) {
    return;
  }

  lastPageViewFingerprint = fingerprint;
  trackAnalyticsEvent('page_view', 'page_view', {}, { pagePath: path });
};
