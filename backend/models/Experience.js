const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  currentlyWorking: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  location: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  // Legacy fields kept so older records remain readable while the new UI rolls out.
  company: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);
