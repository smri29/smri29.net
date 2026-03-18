const mongoose = require('mongoose');

const heroContentSchema = new mongoose.Schema(
  {
    availabilityText: {
      type: String,
      trim: true,
      default: '',
    },
    roleTitles: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HeroContent', heroContentSchema);
