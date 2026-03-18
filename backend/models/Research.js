const mongoose = require('mongoose');

const researchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  abstract: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['Journal', 'Conference'],
    required: true
  },
  publicationName: {
    type: String,
    required: [true, 'Journal or Conference name is required']
  },
  publicationDate: {
    type: Date,
    required: true
  },
  doiLink: {
    type: String,
    trim: true
  },
  authors: [{
    type: String,
    trim: true
  }],
  isPeerReviewed: {
    type: Boolean,
    default: true
  },
  // --- NEW FIELD FOR REORDERING ---
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Research', researchSchema);
