const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getProjects, addProject, deleteProject, 
  getResearch, addResearch,
  sendMessage, getMessages 
} = require('../controllers/dataController');
const { chatWithAI } = require('../controllers/aiController');
// Public Routes (For everyone to see)
router.get('/projects', getProjects);
router.get('/research', getResearch);
router.post('/contact', sendMessage);
router.post('/chat', chatWithAI);

// Protected Routes (Only for You - The Admin)
router.post('/projects', protect, addProject);
router.delete('/projects/:id', protect, deleteProject);
router.post('/research', protect, addResearch);
router.get('/messages', protect, getMessages);

module.exports = router;