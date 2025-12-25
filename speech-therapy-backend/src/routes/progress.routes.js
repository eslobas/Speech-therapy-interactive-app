const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// Progresso do paciente
router.get('/my-progress', auth, role('patient'), progressController.getPatientProgress);

// Ranking
router.get('/ranking', auth, progressController.getRanking);

// Estatísticas do terapeuta
router.get('/therapist/stats', auth, role('therapist', 'admin'), progressController.getTherapistStats);

module.exports = router;