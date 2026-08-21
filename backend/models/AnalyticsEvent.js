const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    sessionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    visitorId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    pagePath: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    pageTitle: {
      type: String,
      trim: true,
      default: '',
    },
    pageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    referrer: {
      type: String,
      trim: true,
      default: '',
    },
    referrerHost: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    source: {
      type: String,
      trim: true,
      default: 'website',
    },
    browser: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    os: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    deviceType: {
      type: String,
      trim: true,
      default: 'desktop',
      index: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'Unknown',
      index: true,
    },
    region: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    timezone: {
      type: String,
      trim: true,
      default: '',
    },
    language: {
      type: String,
      trim: true,
      default: '',
    },
    screenWidth: {
      type: Number,
      default: null,
    },
    screenHeight: {
      type: Number,
      default: null,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

analyticsEventSchema.index({ createdAt: -1 });
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ eventName: 1, createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
