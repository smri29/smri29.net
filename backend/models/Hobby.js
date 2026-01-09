const mongoose = require('mongoose');

const hobbySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "Photography", "Chess"
    trim: true
  },
  description: {
    type: String, // Short snippet: "I love capturing landscapes..."
    trim: true
  },
  icon: {
    type: String, // Optional: User can paste an emoji here like "📷" or "♟️"
    default: '✨'
  },
  // --- ORDER FIELD FOR DRAG & DROP ---
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Hobby', hobbySchema);