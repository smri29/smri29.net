const mongoose = require('mongoose');

const introductionHighlightSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: '',
    },
    detail: {
      type: String,
      trim: true,
      default: '',
    },
    iconKey: {
      type: String,
      trim: true,
      default: 'education',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const introductionSchema = new mongoose.Schema(
  {
    introLabel: {
      type: String,
      trim: true,
      default: 'Introduction',
    },
    headingPrimary: {
      type: String,
      trim: true,
      default: '',
    },
    headingAccent: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    highlights: {
      type: [introductionHighlightSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Introduction', introductionSchema);
