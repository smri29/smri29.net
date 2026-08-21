const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { publicWriteRateLimiter, adminRateLimiter, requireAllowedOrigin } = require('../middleware/securityMiddleware');
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
router.post('/contact', requireAllowedOrigin, publicWriteRateLimiter, sendMessage);
router.post('/chat', requireAllowedOrigin, publicWriteRateLimiter, chatWithAI);

// ADMIN PROTECTED - REORDER
router.put('/reorder', requireAllowedOrigin, adminRateLimiter, protect, reorderItems);

// ADMIN PROTECTED - CRUD
router.route('/research').post(requireAllowedOrigin, adminRateLimiter, protect, addResearch);
router.route('/research/:id').put(requireAllowedOrigin, adminRateLimiter, protect, updateResearch).delete(requireAllowedOrigin, adminRateLimiter, protect, deleteResearch);

router.route('/projects').post(requireAllowedOrigin, adminRateLimiter, protect, addProject);
router.route('/projects/:id').put(requireAllowedOrigin, adminRateLimiter, protect, updateProject).delete(requireAllowedOrigin, adminRateLimiter, protect, deleteProject);

router.route('/certificates').post(requireAllowedOrigin, adminRateLimiter, protect, addCertificate);
router.route('/certificates/:id').put(requireAllowedOrigin, adminRateLimiter, protect, updateCertificate).delete(requireAllowedOrigin, adminRateLimiter, protect, deleteCertificate);

router.route('/hero').post(requireAllowedOrigin, adminRateLimiter, protect, updateHeroContent);
router.route('/introduction').post(requireAllowedOrigin, adminRateLimiter, protect, updateIntroduction);
router.route('/ai-settings').get(requireAllowedOrigin, adminRateLimiter, protect, getAISettings).post(requireAllowedOrigin, adminRateLimiter, protect, updateAISettings);

router.route('/skills').post(requireAllowedOrigin, adminRateLimiter, protect, updateSkills);
router.route('/skills/:id').delete(requireAllowedOrigin, adminRateLimiter, protect, deleteSkill);

// NEW: EXPERIENCE ROUTES
router.route('/experience').post(requireAllowedOrigin, adminRateLimiter, protect, addExperience);
router.route('/experience/:id').put(requireAllowedOrigin, adminRateLimiter, protect, updateExperience).delete(requireAllowedOrigin, adminRateLimiter, protect, deleteExperience);

router.route('/education').post(requireAllowedOrigin, adminRateLimiter, protect, addEducation);
router.route('/education/:id').put(requireAllowedOrigin, adminRateLimiter, protect, updateEducation).delete(requireAllowedOrigin, adminRateLimiter, protect, deleteEducation);

// NEW: HOBBY ROUTES
router.route('/hobbies').post(requireAllowedOrigin, adminRateLimiter, protect, addHobby);
router.route('/hobbies/:id').put(requireAllowedOrigin, adminRateLimiter, protect, updateHobby).delete(requireAllowedOrigin, adminRateLimiter, protect, deleteHobby);

router.get('/messages', requireAllowedOrigin, adminRateLimiter, protect, getMessages);
router.delete('/messages/:id', requireAllowedOrigin, adminRateLimiter, protect, deleteMessage);

module.exports = router;
