const express = require('express');
const router = express.Router();
const missionController = require('../controllers/mission.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// Rotas públicas de missões
router.get('/', missionController.getMissions);
router.get('/daily', auth, missionController.getDailyMissions);

// Rotas protegidas para pacientes
router.post('/start', auth, role('patient'), missionController.startMission);
router.post('/submit', auth, role('patient'), missionController.submitMission);

// Rotas para terapeutas
router.post('/', auth, role('therapist', 'admin'), missionController.createMission);
router.post('/schedule', auth, role('therapist', 'admin'), missionController.scheduleDailyMission);

module.exports = router;