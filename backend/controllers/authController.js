const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '12h' });
};

const getEnvAdminConfig = () => {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  const name = String(process.env.ADMIN_NAME || 'Portfolio Admin').trim();
  return { email, password, name };
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

  const adminCount = await User.estimatedDocumentCount();
  const hasRegistrationKey = Boolean(process.env.ADMIN_REGISTRATION_KEY);
  const isValidKey = hasRegistrationKey && registrationKey === process.env.ADMIN_REGISTRATION_KEY;
  if (adminCount > 0 && !isValidKey) {
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

  return res.status(201).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    token: generateToken(user.id),
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
      return res.json({
        _id: envUser.id,
        name: envUser.name,
        email: envUser.email,
        token: generateToken(envUser.id),
      });
    }
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (user && (await bcrypt.compare(rawPassword, user.password))) {
    return res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  }

  return res.status(401).json({ message: 'Invalid admin credentials' });
};

module.exports = { registerUser, loginUser };
