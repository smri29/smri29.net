const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // URL from Cloudinary or local path
  tags: [String], // ["MERN", "Python", "ML"]
  category: { type: String, enum: ['Development', 'Machine Learning'], default: 'Development' },
  liveLink: { type: String },
  repoLink: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);