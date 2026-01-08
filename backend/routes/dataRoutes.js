const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { chatWithAI } = require('../controllers/aiController');
const {
    getProjects, addProject, updateProject, deleteProject,
    getResearch, addResearch, updateResearch, deleteResearch,
    getCertificates, addCertificate, updateCertificate, deleteCertificate,
    getSkills, updateSkills, deleteSkill,
    getMessages, sendMessage, reorderItems
} = require('../controllers/dataController');

// PUBLIC
router.get('/projects', getProjects);
router.get('/research', getResearch);
router.get('/certificates', getCertificates);
router.get('/skills', getSkills);
router.post('/contact', sendMessage);
router.post('/chat', chatWithAI);

// ADMIN PROTECTED - REORDER
router.put('/reorder', protect, reorderItems);

// ADMIN PROTECTED - CRUD
router.route('/research').post(protect, addResearch);
router.route('/research/:id').put(protect, updateResearch).delete(protect, deleteResearch);

router.route('/projects').post(protect, addProject);
router.route('/projects/:id').put(protect, updateProject).delete(protect, deleteProject);

router.route('/certificates').post(protect, addCertificate);
router.route('/certificates/:id').put(protect, updateCertificate).delete(protect, deleteCertificate);

router.route('/skills').post(protect, updateSkills);
router.route('/skills/:id').delete(protect, deleteSkill);

router.get('/messages', protect, getMessages);

module.exports = router;