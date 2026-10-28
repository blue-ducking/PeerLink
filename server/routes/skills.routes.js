const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skills.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', skillsController.listSkills);
router.get('/categories', skillsController.listCategories);
router.get('/my', requireAuth, skillsController.getMySkills);
router.post('/my', requireAuth, skillsController.addStudentSkill);
router.delete('/my/:id', requireAuth, skillsController.removeStudentSkill);

module.exports = router;
