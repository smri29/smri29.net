const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireAllowedOrigin } = require('../middleware/securityMiddleware');
const { getAnalyticsSummary, trackAnalyticsEvent } = require('../controllers/analyticsController');

const router = express.Router();

router.post('/track', requireAllowedOrigin, trackAnalyticsEvent);
router.get('/summary', requireAllowedOrigin, protect, getAnalyticsSummary);

module.exports = router;
