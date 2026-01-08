const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load Config
dotenv.config();

// Connect Database
connectDB();

const app = express();

// --- SMART CORS CONFIGURATION ---
const corsOptions = {
  // We allow an ARRAY of origins. The backend will accept requests from ANY of these.
  origin: [
    "http://localhost:5173",                 // 1. Your Local Frontend (Vite)
    "https://smri29net.vercel.app",          // 2. Your Live Vercel Frontend
    "https://smri29.net",                    // 3. Your Future Domain (Pre-approved)
    process.env.FRONTEND_URL                 // 4. Any extra overrides from .env
  ].filter(Boolean),                         // This removes any empty/null values if variables aren't set
  
  credentials: true, // Allows cookies/headers if needed
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json()); // Allows us to accept JSON data in the body

// Main Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/data', require('./routes/dataRoutes'));

// Root Route (Health Check)
app.get('/', (req, res) => res.send('API is running...'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));