const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_PASS_TTL_MS = 12 * 60 * 60 * 1000;
const AUTH_COOKIE_NAME = 'admin_session';

const getAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 12 * 60 * 60 * 1000,
  path: '/',
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '12h' });
};

const generateTurnstilePassToken = () => {
  return jwt.sign({ type: 'turnstile_gate' }, process.env.JWT_SECRET, { expiresIn: '12h' });
};

const hasTurnstileConfig = () =>
  Boolean(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);

const getAllowedTurnstileHostnames = () => {
  const configured = String(process.env.TURNSTILE_ALLOWED_HOSTNAMES || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const inferred = [
    process.env.FRONTEND_URL,
    'https://smri29.net',
    'https://smri29net.vercel.app',
    'http://localhost:5173',
  ]
    .map((value) => {
      try {
        return value ? new URL(value).hostname.toLowerCase() : '';
      } catch {
        return '';
      }
    })
    .filter(Boolean);

  return [...new Set([...configured, ...inferred])];
};

const verifyTurnstileWithCloudflare = async ({ token, remoteip }) => {
  const params = new URLSearchParams({
    secret: String(process.env.TURNSTILE_SECRET_KEY || ''),
    response: String(token || ''),
  });

  if (remoteip) {
    params.set('remoteip', remoteip);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Turnstile verification request failed');
  }

  return response.json();
};

const getEnvAdminConfig = () => {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  const name = String(process.env.ADMIN_NAME || 'Portfolio Admin').trim();
  return { email, password, name };
};

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });
};

const getOrSyncEnvAdminUser = async () => {
  const envAdmin = getEnvAdminConfig();
  if (!envAdmin.email || !envAdmin.password) {
    return null;
  }

  let user = await User.findOne({ email: envAdmin.email });
  if (!user) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(envAdmin.password, salt);
    user = await User.create({
      name: envAdmin.name,
      email: envAdmin.email,
      password: hashedPassword,
    });
    return user;
  }

  const passwordMatches = await bcrypt.compare(envAdmin.password, user.password);
  if (!passwordMatches || user.name !== envAdmin.name) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(envAdmin.password, salt);
    user.name = envAdmin.name;
    await user.save();
  }

  return user;
};

const registerUser = async (req, res) => {
  const { name, email, password, registrationKey } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const trimmedName = String(name).trim();
  const normalizedEmail = String(email).trim().toLowerCase();
  const rawPassword = String(password);

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (rawPassword.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  const hasRegistrationKey = Boolean(process.env.ADMIN_REGISTRATION_KEY);
  const isValidKey = hasRegistrationKey && registrationKey === process.env.ADMIN_REGISTRATION_KEY;
  if (!isValidKey) {
    return res.status(403).json({ message: 'Admin registration is disabled' });
  }

  const adminCount = await User.estimatedDocumentCount();
  if (adminCount > 0) {
    return res.status(403).json({ message: 'Admin registration is disabled' });
  }

  const userExists = await User.findOne({ email: normalizedEmail }).lean();
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);

  const user = await User.create({
    name: trimmedName,
    email: normalizedEmail,
    password: hashedPassword,
  });

  const token = generateToken(user.id);
  setAuthCookie(res, token);

  return res.status(201).json({
    _id: user.id,
    name: user.name,
    email: user.email,
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const rawPassword = String(password);
  const envAdmin = getEnvAdminConfig();

  if (
    envAdmin.email &&
    envAdmin.password &&
    normalizedEmail === envAdmin.email &&
    rawPassword === envAdmin.password
  ) {
    const envUser = await getOrSyncEnvAdminUser();
    if (envUser) {
      const token = generateToken(envUser.id);
      setAuthCookie(res, token);
      return res.json({
        _id: envUser.id,
        name: envUser.name,
        email: envUser.email,
      });
    }
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (user && (await bcrypt.compare(rawPassword, user.password))) {
    const token = generateToken(user.id);
    setAuthCookie(res, token);
    return res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  return res.status(401).json({ message: 'Invalid admin credentials' });
};

const getTurnstileConfig = async (req, res) => {
  res.json({
    enabled: hasTurnstileConfig(),
    siteKey: process.env.TURNSTILE_SITE_KEY || '',
  });
};

const verifyTurnstileToken = async (req, res) => {
  if (!hasTurnstileConfig()) {
    return res.json({
      success: true,
      token: '',
      expiresAt: null,
      skipReason: 'turnstile_not_configured',
    });
  }

  const token = String(req.body?.token || '').trim();
  if (!token) {
    return res.status(400).json({ message: 'Turnstile token is required' });
  }

  const remoteip =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip;

  try {
    const result = await verifyTurnstileWithCloudflare({ token, remoteip });
    if (!result.success) {
      return res.status(400).json({
        message: 'Human verification failed',
        errorCodes: Array.isArray(result['error-codes']) ? result['error-codes'] : [],
      });
    }

    const allowedHostnames = getAllowedTurnstileHostnames();
    const verifiedHostname = String(result.hostname || '').trim().toLowerCase();
    if (allowedHostnames.length > 0 && verifiedHostname && !allowedHostnames.includes(verifiedHostname)) {
      return res.status(400).json({ message: 'Turnstile hostname verification failed' });
    }

    const expiresAt = new Date(Date.now() + TURNSTILE_PASS_TTL_MS).toISOString();
    return res.json({
      success: true,
      token: generateTurnstilePassToken(),
      expiresAt,
    });
  } catch (error) {
    return res.status(502).json({ message: 'Unable to verify Turnstile at the moment' });
  }
};

const getCurrentUser = async (req, res) => {
  const token = String(req.cookies?.[AUTH_COOKIE_NAME] || '').trim();
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ message: 'Not authorized' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    clearAuthCookie(res);
    return res.status(401).json({ message: 'Not authorized' });
  }
};

const logoutUser = async (req, res) => {
  clearAuthCookie(res);
  return res.json({ success: true });
};

module.exports = {
  registerUser,
  loginUser,
  getTurnstileConfig,
  verifyTurnstileToken,
  getCurrentUser,
  logoutUser,
};
