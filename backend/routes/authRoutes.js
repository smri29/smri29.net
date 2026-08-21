const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireAllowedOrigin, requireTurnstileGate } = require('../middleware/securityMiddleware');
const {
  registerUser,
  loginUser,
  getTurnstileConfig,
  verifyTurnstileToken,
  getCurrentUser,
  logoutUser,
} = require('../controllers/authController');

router.get('/turnstile/config', getTurnstileConfig);
router.post('/turnstile/verify', requireAllowedOrigin, verifyTurnstileToken);
router.get('/me', requireAllowedOrigin, getCurrentUser);
router.post('/logout', requireAllowedOrigin, protect, logoutUser);
router.post('/register', requireAllowedOrigin, requireTurnstileGate, registerUser);
router.post('/login', requireAllowedOrigin, requireTurnstileGate, loginUser);

module.exports = router;
