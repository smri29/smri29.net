const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const {
  securityHeaders,
  authRateLimiter,
  authSessionRateLimiter,
  analyticsRateLimiter,
  rejectSuspiciousPayload,
  requireTurnstileGate,
} = require('./middleware/securityMiddleware');

// Load Config
dotenv.config();

const requiredEnvs = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = requiredEnvs.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  throw new Error(`Missing required env vars: ${missingEnv.join(', ')}`);
}

// Connect Database
connectDB();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'https://smri29net.vercel.app',
  'https://smri29.net',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(rejectSuspiciousPayload);

// Main Routes
app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);
app.use('/api/auth/turnstile/verify', authRateLimiter);
app.use('/api/auth/me', authSessionRateLimiter);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/data', requireTurnstileGate, require('./routes/dataRoutes'));
app.use('/api/analytics', analyticsRateLimiter, requireTurnstileGate, require('./routes/analyticsRoutes'));

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-store, max-age=0');
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store, max-age=0');
  res.send('API is running');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
