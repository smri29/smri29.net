const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  role: {
    type: String,
    required: [true, 'Job role is required'], // e.g., "Frontend Intern"
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  duration: {
    type: String,
    required: true, // e.g., "Jan 2025 - Present" or "Summer 2024"
    trim: true
  },
  location: {
    type: String, // e.g., "Remote" or "Dhaka, Bangladesh"
    trim: true
  },
  description: {
    type: String, // Full text description of responsibilities
    required: true
  },
  // --- ORDER FIELD FOR DRAG & DROP ---
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);