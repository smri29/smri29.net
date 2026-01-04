const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: 'default.jpg' }, 
  category: { 
    type: String, 
    enum: ['Development', 'Research Paper', 'Certification'], 
    required: true 
  },
  subCategory: { 
    type: String, 
    required: true 
    // Examples: "AI/ML", "MERN", "Conference", "Journal", "Kaggle", etc.
  },
  liveLink: { type: String },
  repoLink: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);