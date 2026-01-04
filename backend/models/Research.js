const mongoose = require('mongoose');

const researchSchema = mongoose.Schema({
  title: { type: String, required: true },
  conference: { type: String, required: true }, // e.g., "ICCIT 2025"
  publicationLink: { type: String },
  status: { type: String, default: 'Published' }, // Published, Accepted, Under Review
}, { timestamps: true });

module.exports = mongoose.model('Research', researchSchema);