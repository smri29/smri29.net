const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  techStack: [{
    type: String, // e.g., ["React", "PyTorch", "FastAPI"]
    trim: true
  }],
  category: {
    type: String,
    enum: ['AI/ML', 'MERN', 'Flutter', 'Others'],
    default: 'Others'
  },
  githubLink: {
    type: String,
    trim: true
  },
  liveLink: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    default: 'Lead Developer'
  },
  contributors: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    trim: true,
    default: ''
  },
  imagePublicId: {
    type: String,
    trim: true,
    default: ''
  },
  // --- NEW FIELD FOR REORDERING ---
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
