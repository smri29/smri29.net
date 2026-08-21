const AnalyticsEvent = require('../models/AnalyticsEvent');

const MAX_STRING_LENGTH = 2048;
const MAX_EVENT_METADATA_LENGTH = 200;

const normalizeString = (value, maxLength = MAX_STRING_LENGTH) => String(value ?? '').trim().slice(0, maxLength);
const normalizeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const isValidUrl = (value) => {
  const url = normalizeString(value, MAX_STRING_LENGTH);
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const getReferrerHost = (value) => {
  if (!isValidUrl(value)) {
    return '';
  }

  try {
    return new URL(value).hostname || '';
  } catch {
    return '';
  }
};

const getBrowserName = (userAgent) => {
  const ua = String(userAgent || '').toLowerCase();
  if (!ua) return 'Unknown';
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('opr/') || ua.includes('opera')) return 'Opera';
  if (ua.includes('chrome/') && !ua.includes('edg/')) return 'Chrome';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('msie') || ua.includes('trident/')) return 'Internet Explorer';
  return 'Unknown';
};

const getOsName = (userAgent) => {
  const ua = String(userAgent || '').toLowerCase();
  if (!ua) return 'Unknown';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) return 'iOS';
  if (ua.includes('mac os x') || ua.includes('macintosh')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  return 'Unknown';
};

const getDeviceType = (userAgent) => {
  const ua = String(userAgent || '').toLowerCase();
  if (!ua) return 'desktop';
  if (ua.includes('ipad') || ua.includes('tablet')) return 'tablet';
  if (ua.includes('mobi') || ua.includes('iphone') || ua.includes('android')) return 'mobile';
  return 'desktop';
};

const sanitizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(metadata).slice(0, 24).map(([key, value]) => {
      const safeKey = normalizeString(key, 60);
      if (!safeKey) {
        return [null, null];
      }

      if (typeof value === 'number' || typeof value === 'boolean') {
        return [safeKey, value];
      }

      if (Array.isArray(value)) {
        return [safeKey, value.map((item) => normalizeString(item, MAX_EVENT_METADATA_LENGTH)).filter(Boolean).slice(0, 12)];
      }

      return [safeKey, normalizeString(value, MAX_EVENT_METADATA_LENGTH)];
    }).filter(([key]) => Boolean(key))
  );
};

const getLocationDetails = (req, payload) => ({
  country:
    normalizeString(req.headers['x-vercel-ip-country'], 120) ||
    normalizeString(req.headers['cf-ipcountry'], 120) ||
    normalizeString(payload.country, 120) ||
    'Unknown',
  region:
    normalizeString(req.headers['x-vercel-ip-country-region'], 120) ||
    normalizeString(payload.region, 120),
  city:
    normalizeString(req.headers['x-vercel-ip-city'], 120) ||
    normalizeString(payload.city, 120),
});

const buildEventDocument = (req, payload = {}) => {
  const eventType = normalizeString(payload.eventType, 60) || 'custom';
  const eventName = normalizeString(payload.eventName, 120) || 'unknown_event';
  const sessionId = normalizeString(payload.sessionId, 120);
  const visitorId = normalizeString(payload.visitorId, 120);
  const pagePath = normalizeString(payload.pagePath, 300);
  const pageTitle = normalizeString(payload.pageTitle, 300);
  const pageUrl = normalizeString(payload.pageUrl, MAX_STRING_LENGTH);
  const referrer = normalizeString(payload.referrer, MAX_STRING_LENGTH);
  const source = normalizeString(payload.source, 120) || 'website';
  const timezone = normalizeString(payload.timezone, 120);
  const language = normalizeString(payload.language, 120);
  const screenWidth = normalizeNumber(payload.screenWidth);
  const screenHeight = normalizeNumber(payload.screenHeight);
  const contactEmail = normalizeString(payload.contactEmail, 160).toLowerCase();
  const userAgent = normalizeString(req.headers['user-agent'], 1000);
  const location = getLocationDetails(req, payload);

  return {
    eventType,
    eventName,
    sessionId,
    visitorId,
    pagePath,
    pageTitle,
    pageUrl,
    referrer,
    referrerHost: getReferrerHost(referrer),
    source,
    browser: getBrowserName(userAgent),
    os: getOsName(userAgent),
    deviceType: getDeviceType(userAgent),
    country: location.country,
    region: location.region,
    city: location.city,
    timezone,
    language,
    screenWidth,
    screenHeight,
    contactEmail,
    metadata: sanitizeMetadata(payload.metadata),
  };
};

const recordAnalyticsEvent = async (req, payload) => {
  const event = buildEventDocument(req, payload);
  if (!event.sessionId || !event.eventName) {
    return null;
  }

  return AnalyticsEvent.create(event);
};

const trackAnalyticsEvent = async (req, res) => {
  const created = await recordAnalyticsEvent(req, req.body || {});
  if (!created) {
    return res.status(400).json({ message: 'Analytics event is missing required fields' });
  }

  return res.status(201).json({ success: true });
};

const resolveOrDefault = async (operation, fallbackValue, label) => {
  try {
    return await operation();
  } catch (error) {
    console.error(`Analytics summary segment failed: ${label}`, error);
    return fallbackValue;
  }
};

const getAnalyticsSummary = async (req, res) => {
  const days = Math.min(180, Math.max(7, Number(req.query.days) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const match = { createdAt: { $gte: since } };

  const [
    totalEvents,
    totalPageViews,
    uniqueVisitors,
    uniqueSessions,
    contactSubmissions,
    chatPrompts,
    topPages,
    topClicks,
    topReferrers,
    geography,
    devices,
    browsers,
    dailyActivity,
    recentEvents,
    contactEmails,
  ] = await Promise.all([
    resolveOrDefault(() => AnalyticsEvent.countDocuments(match), 0, 'totalEvents'),
    resolveOrDefault(() => AnalyticsEvent.countDocuments({ ...match, eventType: 'page_view' }), 0, 'totalPageViews'),
    resolveOrDefault(() => AnalyticsEvent.distinct('visitorId', { ...match, visitorId: { $ne: '' } }), [], 'uniqueVisitors'),
    resolveOrDefault(() => AnalyticsEvent.distinct('sessionId', match), [], 'uniqueSessions'),
    resolveOrDefault(() => AnalyticsEvent.countDocuments({ ...match, eventName: 'contact_form_submit' }), 0, 'contactSubmissions'),
    resolveOrDefault(() => AnalyticsEvent.countDocuments({ ...match, eventName: 'chat_prompt_submit' }), 0, 'chatPrompts'),
    resolveOrDefault(
      () => AnalyticsEvent.aggregate([
        { $match: { ...match, eventType: 'page_view', pagePath: { $ne: '' } } },
        { $group: { _id: '$pagePath', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, pagePath: '$_id', count: 1 } },
      ]),
      [],
      'topPages'
    ),
    resolveOrDefault(
      () => AnalyticsEvent.aggregate([
        { $match: { ...match, eventType: 'click' } },
        { $group: { _id: '$eventName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, eventName: '$_id', count: 1 } },
      ]),
      [],
      'topClicks'
    ),
    resolveOrDefault(
      () => AnalyticsEvent.aggregate([
        { $match: { ...match, referrerHost: { $ne: '' } } },
        { $group: { _id: '$referrerHost', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, host: '$_id', count: 1 } },
      ]),
      [],
      'topReferrers'
    ),
    resolveOrDefault(
      () => AnalyticsEvent.aggregate([
        { $match: { ...match, country: { $ne: 'Unknown' } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, country: '$_id', count: 1 } },
      ]),
      [],
      'geography'
    ),
    resolveOrDefault(
      () => AnalyticsEvent.aggregate([
        { $match: match },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, deviceType: '$_id', count: 1 } },
      ]),
      [],
      'devices'
    ),
    resolveOrDefault(
      () => AnalyticsEvent.aggregate([
        { $match: match },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, browser: '$_id', count: 1 } },
      ]),
      [],
      'browsers'
    ),
    resolveOrDefault(
      () => AnalyticsEvent.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
                onNull: 'unknown',
              },
            },
            events: { $sum: 1 },
            pageViews: {
              $sum: {
                $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0],
              },
            },
          },
        },
        { $match: { _id: { $ne: 'unknown' } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', events: 1, pageViews: 1 } },
      ]),
      [],
      'dailyActivity'
    ),
    resolveOrDefault(
      () => AnalyticsEvent.find(match).sort({ createdAt: -1 }).limit(30).lean(),
      [],
      'recentEvents'
    ),
    resolveOrDefault(
      () => AnalyticsEvent.aggregate([
        { $match: { ...match, contactEmail: { $ne: '' } } },
        {
          $group: {
            _id: '$contactEmail',
            submissions: { $sum: 1 },
            lastSeenAt: { $max: '$createdAt' },
          },
        },
        { $sort: { submissions: -1, lastSeenAt: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, email: '$_id', submissions: 1, lastSeenAt: 1 } },
      ]),
      [],
      'contactEmails'
    ),
  ]);

  res.json({
    range: {
      days,
      since,
      until: new Date(),
    },
    overview: {
      totalEvents,
      totalPageViews,
      uniqueVisitors: uniqueVisitors.length,
      uniqueSessions: uniqueSessions.length,
      contactSubmissions,
      chatPrompts,
    },
    topPages,
    topClicks,
    topReferrers,
    geography,
    devices,
    browsers,
    dailyActivity,
    recentEvents,
    contactEmails,
  });
};

module.exports = {
  recordAnalyticsEvent,
  trackAnalyticsEvent,
  getAnalyticsSummary,
};
