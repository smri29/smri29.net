const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    publicContentCache,
    noStore,
    publicWriteRateLimiter,
    adminRateLimiter,
    requireAllowedOrigin,
} = require('../middleware/securityMiddleware');
const { chatWithAI, getAISettings, updateAISettings } = require('../controllers/aiController');
const {
    getProjects, addProject, updateProject, deleteProject,
    getResearch, addResearch, updateResearch, deleteResearch,
    getCertificates, addCertificate, updateCertificate, deleteCertificate,
    getHeroContent, updateHeroContent,
    getIntroduction, updateIntroduction,
    getExperience, addExperience, updateExperience, deleteExperience, // NEW
    getEducation, addEducation, updateEducation, deleteEducation,
    getHobbies, addHobby, updateHobby, deleteHobby, // NEW
    getMessages, sendMessage, deleteMessage, reorderItems
} = require('../controllers/dataController');

// PUBLIC ROUTES
router.get('/projects', publicContentCache, getProjects);
router.get('/research', publicContentCache, getResearch);
router.get('/certificates', publicContentCache, getCertificates);
router.get('/hero', noStore, getHeroContent);
router.get('/introduction', publicContentCache, getIntroduction);
router.get('/experience', publicContentCache, getExperience); // NEW
router.get('/education', publicContentCache, getEducation);
router.get('/hobbies', publicContentCache, getHobbies);       // NEW
router.post('/contact', noStore, requireAllowedOrigin, publicWriteRateLimiter, sendMessage);
router.post('/chat', noStore, requireAllowedOrigin, publicWriteRateLimiter, chatWithAI);

// ADMIN PROTECTED - REORDER
router.put('/reorder', noStore, requireAllowedOrigin, adminRateLimiter, protect, reorderItems);

// ADMIN PROTECTED - CRUD
router.route('/research').post(noStore, requireAllowedOrigin, adminRateLimiter, protect, addResearch);
router.route('/research/:id').put(noStore, requireAllowedOrigin, adminRateLimiter, protect, updateResearch).delete(noStore, requireAllowedOrigin, adminRateLimiter, protect, deleteResearch);

router.route('/projects').post(noStore, requireAllowedOrigin, adminRateLimiter, protect, addProject);
router.route('/projects/:id').put(noStore, requireAllowedOrigin, adminRateLimiter, protect, updateProject).delete(noStore, requireAllowedOrigin, adminRateLimiter, protect, deleteProject);

router.route('/certificates').post(noStore, requireAllowedOrigin, adminRateLimiter, protect, addCertificate);
router.route('/certificates/:id').put(noStore, requireAllowedOrigin, adminRateLimiter, protect, updateCertificate).delete(noStore, requireAllowedOrigin, adminRateLimiter, protect, deleteCertificate);

router.route('/hero').post(noStore, requireAllowedOrigin, adminRateLimiter, protect, updateHeroContent);
router.route('/introduction').post(noStore, requireAllowedOrigin, adminRateLimiter, protect, updateIntroduction);
router.route('/ai-settings').get(noStore, requireAllowedOrigin, adminRateLimiter, protect, getAISettings).post(noStore, requireAllowedOrigin, adminRateLimiter, protect, updateAISettings);

// NEW: EXPERIENCE ROUTES
router.route('/experience').post(noStore, requireAllowedOrigin, adminRateLimiter, protect, addExperience);
router.route('/experience/:id').put(noStore, requireAllowedOrigin, adminRateLimiter, protect, updateExperience).delete(noStore, requireAllowedOrigin, adminRateLimiter, protect, deleteExperience);

router.route('/education').post(noStore, requireAllowedOrigin, adminRateLimiter, protect, addEducation);
router.route('/education/:id').put(noStore, requireAllowedOrigin, adminRateLimiter, protect, updateEducation).delete(noStore, requireAllowedOrigin, adminRateLimiter, protect, deleteEducation);

// NEW: HOBBY ROUTES
router.route('/hobbies').post(noStore, requireAllowedOrigin, adminRateLimiter, protect, addHobby);
router.route('/hobbies/:id').put(noStore, requireAllowedOrigin, adminRateLimiter, protect, updateHobby).delete(noStore, requireAllowedOrigin, adminRateLimiter, protect, deleteHobby);

router.get('/messages', noStore, requireAllowedOrigin, adminRateLimiter, protect, getMessages);
router.delete('/messages/:id', noStore, requireAllowedOrigin, adminRateLimiter, protect, deleteMessage);

module.exports = router;
