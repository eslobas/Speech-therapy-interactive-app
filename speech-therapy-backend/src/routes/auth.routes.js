const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/therapist/register', authController.registerTherapist);
router.post('/patient/register', authController.registerPatient);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getProfile);

module.exports = router;