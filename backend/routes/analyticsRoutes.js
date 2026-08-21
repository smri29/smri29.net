const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getAnalyticsSummary, trackAnalyticsEvent } = require('../controllers/analyticsController');

const router = express.Router();

router.post('/track', trackAnalyticsEvent);
router.get('/summary', protect, getAnalyticsSummary);

module.exports = router;
