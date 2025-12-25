const TherapistPatient = require('../models/TherapistPatient.model');
const User = require('../models/User.model');
const PatientProgress = require('../models/PatientProgress.model');

// Listar pacientes do terapeuta
exports.getPatients = async (req, res) => {
  try {
    const therapistPatients = await TherapistPatient.find({
      therapist: req.userId,
      isActive: true
    }).populate('patient');

    const patients = therapistPatients.map(tp => ({
      ...tp.patient.toObject(),
      therapistNotes: tp.notes,
      therapyGoals: tp.therapyGoals,
      nextSession: tp.nextSession
    }));

    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pacientes' });
  }
};

// Adicionar notas a um paciente
exports.addPatientNotes = async (req, res) => {
  try {
    const { patientId, notes } = req.body;

    const therapistPatient = await TherapistPatient.findOneAndUpdate(
      { therapist: req.userId, patient: patientId },
      { notes },
      { new: true }
    );

    if (!therapistPatient) {
      return res.status(404).json({ error: 'Relação não encontrada' });
    }

    res.json(therapistPatient);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar notas' });
  }
};

// Definir objetivos de terapia
exports.setTherapyGoals = async (req, res) => {
  try {
    const { patientId, goals } = req.body;

    const therapistPatient = await TherapistPatient.findOneAndUpdate(
      { therapist: req.userId, patient: patientId },
      { therapyGoals: goals },
      { new: true }
    );

    res.json(therapistPatient);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao definir objetivos' });
  }
};

// Obter progresso detalhado de um paciente
exports.getPatientDetailedProgress = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verificar se o terapeuta tem acesso a este paciente
    const relationship = await TherapistPatient.findOne({
      therapist: req.userId,
      patient: patientId
    });

    if (!relationship) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    // Buscar progresso
    const progress = await PatientProgress.find({
      patient: patientId
    }).populate('mission').sort({ completedAt: -1 });

    // Estatísticas por som
    const soundStats = {};
    progress.forEach(p => {
      if (p.mission && p.mission.targetSounds) {
        p.mission.targetSounds.forEach(sound => {
          if (!soundStats[sound]) {
            soundStats[sound] = { attempts: 0, totalScore: 0 };
          }
          soundStats[sound].attempts += 1;
          soundStats[sound].totalScore += p.score;
        });
      }
    });

    // Calcular médias
    Object.keys(soundStats).forEach(sound => {
      soundStats[sound].avgScore = 
        soundStats[sound].totalScore / soundStats[sound].attempts;
    });

    res.json({
      progress,
      soundStats,
      patientInfo: await User.findById(patientId),
      therapyGoals: relationship.therapyGoals
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar progresso detalhado' });
  }
};