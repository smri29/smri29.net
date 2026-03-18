const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { chatWithAI, getAISettings, updateAISettings } = require('../controllers/aiController');
const {
    getProjects, addProject, updateProject, deleteProject,
    getResearch, addResearch, updateResearch, deleteResearch,
    getCertificates, addCertificate, updateCertificate, deleteCertificate,
    getHeroContent, updateHeroContent,
    getIntroduction, updateIntroduction,
    getSkills, updateSkills, deleteSkill,
    getExperience, addExperience, updateExperience, deleteExperience, // NEW
    getEducation, addEducation, updateEducation, deleteEducation,
    getHobbies, addHobby, updateHobby, deleteHobby, // NEW
    getMessages, sendMessage, deleteMessage, reorderItems
} = require('../controllers/dataController');

// PUBLIC ROUTES
router.get('/projects', getProjects);
router.get('/research', getResearch);
router.get('/certificates', getCertificates);
router.get('/hero', getHeroContent);
router.get('/introduction', getIntroduction);
router.get('/skills', getSkills);
router.get('/experience', getExperience); // NEW
router.get('/education', getEducation);
router.get('/hobbies', getHobbies);       // NEW
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

router.route('/hero').post(protect, updateHeroContent);
router.route('/introduction').post(protect, updateIntroduction);
router.route('/ai-settings').get(protect, getAISettings).post(protect, updateAISettings);

router.route('/skills').post(protect, updateSkills);
router.route('/skills/:id').delete(protect, deleteSkill);

// NEW: EXPERIENCE ROUTES
router.route('/experience').post(protect, addExperience);
router.route('/experience/:id').put(protect, updateExperience).delete(protect, deleteExperience);

router.route('/education').post(protect, addEducation);
router.route('/education/:id').put(protect, updateEducation).delete(protect, deleteEducation);

// NEW: HOBBY ROUTES
router.route('/hobbies').post(protect, addHobby);
router.route('/hobbies/:id').put(protect, updateHobby).delete(protect, deleteHobby);

router.get('/messages', protect, getMessages);
router.delete('/messages/:id', protect, deleteMessage);

module.exports = router;
