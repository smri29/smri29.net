const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    // REMOVED ENUM: This allows you to create custom categories (like 'Cloud') in the dashboard
  },
  skillsList: [{
    type: String,
    required: true,
    trim: true
  }],
  // --- NEW FIELD FOR REORDERING ---
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);