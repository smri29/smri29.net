const mongoose = require('mongoose');

const researchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  abstract: {
    type: String,
    required: [true, 'Abstract is required']
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
  }
}, { timestamps: true });

module.exports = mongoose.model('Research', researchSchema);