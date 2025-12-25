const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapist.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// Gestão de pacientes
router.get('/patients', auth, role('therapist', 'admin'), therapistController.getPatients);
router.get('/patients/:patientId/progress', auth, role('therapist', 'admin'), therapistController.getPatientDetailedProgress);
router.put('/patients/notes', auth, role('therapist', 'admin'), therapistController.addPatientNotes);
router.put('/patients/goals', auth, role('therapist', 'admin'), therapistController.setTherapyGoals);

module.exports = router;