const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { noStore, requireAllowedOrigin, requireTurnstileGate } = require('../middleware/securityMiddleware');
const {
  registerUser,
  loginUser,
  getTurnstileConfig,
  verifyTurnstileToken,
  getCurrentUser,
  logoutUser,
} = require('../controllers/authController');

router.get('/turnstile/config', noStore, getTurnstileConfig);
router.post('/turnstile/verify', noStore, requireAllowedOrigin, verifyTurnstileToken);
router.get('/me', noStore, requireAllowedOrigin, getCurrentUser);
router.post('/logout', noStore, requireAllowedOrigin, protect, logoutUser);
router.post('/register', noStore, requireAllowedOrigin, requireTurnstileGate, registerUser);
router.post('/login', noStore, requireAllowedOrigin, requireTurnstileGate, loginUser);

module.exports = router;
