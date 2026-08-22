const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { noStore, requireAllowedOrigin } = require('../middleware/securityMiddleware');
const { getAnalyticsSummary, trackAnalyticsEvent } = require('../controllers/analyticsController');

const router = express.Router();

router.post('/track', noStore, requireAllowedOrigin, trackAnalyticsEvent);
router.get('/summary', noStore, requireAllowedOrigin, protect, getAnalyticsSummary);

module.exports = router;
