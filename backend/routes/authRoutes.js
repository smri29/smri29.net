const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getTurnstileConfig,
  verifyTurnstileToken,
} = require('../controllers/authController');

router.get('/turnstile/config', getTurnstileConfig);
router.post('/turnstile/verify', verifyTurnstileToken);
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
