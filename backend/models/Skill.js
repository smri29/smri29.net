const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'Programming', 
      'AI/ML', 
      'Research', 
      'MLOps & Deployment', 
      'Full Stack Development', 
      'Tools & Platform', 
      'Soft Skills', 
      'Languages'
    ]
  },
  skillsList: [{
    type: String,
    required: true,
    trim: true
  }]
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);