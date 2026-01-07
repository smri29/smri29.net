const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load Config
dotenv.config();

// Connect Database
connectDB();

const app = express();

// --- SECURE CORS CONFIGURATION ---
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Uses your Vercel URL in prod, or allows all if var is missing
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