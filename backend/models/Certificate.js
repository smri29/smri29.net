const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  issuingOrganization: {
    type: String,
    required: true, // e.g., "DeepLearning.AI", "Kaggle"
    trim: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  verificationLink: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['AI/ML', 'Kaggle', 'Research', 'Professional', 'Others'],
    required: true
  },
  featuredOnHome: {
    type: Boolean,
    default: false
  },
  // --- NEW FIELD FOR REORDERING ---
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
