const Mission = require('../models/Mission.model');
const DailyMission = require('../models/DailyMission.model');
const PatientProgress = require('../models/PatientProgress.model');

// Criar nova missão (para terapeutas/admins)
exports.createMission = async (req, res) => {
  try {
    const mission = new Mission({
      ...req.body,
      createdBy: req.userId
    });

    await mission.save();
    res.status(201).json(mission);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar missão' });
  }
};

// Listar missões disponíveis
exports.getMissions = async (req, res) => {
  try {
    const { difficulty, sounds, vowels, type, age } = req.query;
    const filter = { isActive: true };

    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    if (sounds) filter.targetSounds = { $in: sounds.split(',') };
    if (vowels) filter.targetVowels = { $in: vowels.split(',') };
    
    // Filtrar por idade se fornecida
    if (age) {
      filter.$or = [
        { ageRange: { $exists: false } },
        {
          $and: [
            { 'ageRange.min': { $lte: age } },
            { 'ageRange.max': { $gte: age } }
          ]
        }
      ];
    }

    const missions = await Mission.find(filter);
    res.json(missions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar missões' });
  }
};

// Obter missões do dia para um paciente
exports.getDailyMissions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyMissions = await DailyMission.find({
      date: today,
      $or: [
        { assignedTo: req.userId },
        { assignedTo: { $size: 0 } } // Missões gerais
      ]
    }).populate('mission');

    res.json(dailyMissions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar missões diárias' });
  }
};

// Programar missão diária (terapeuta)
exports.scheduleDailyMission = async (req, res) => {
  try {
    const { date, missionId, patientIds, isMandatory } = req.body;

    const dailyMission = new DailyMission({
      date: new Date(date),
      mission: missionId,
      assignedTo: patientIds || [],
      isMandatory
    });

    await dailyMission.save();
    res.status(201).json(dailyMission);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao programar missão' });
  }
};

// Iniciar uma missão
exports.startMission = async (req, res) => {
  try {
    const { missionId, dailyMissionId } = req.body;

    let progress = await PatientProgress.findOne({
      patient: req.userId,
      mission: missionId
    });

    if (!progress) {
      progress = new PatientProgress({
        patient: req.userId,
        mission: missionId,
        dailyMission: dailyMissionId,
        status: 'in_progress'
      });
      await progress.save();
    } else if (progress.status === 'completed') {
      // Reset para nova tentativa
      progress.status = 'in_progress';
      progress.attempts += 1;
      await progress.save();
    }

    const mission = await Mission.findById(missionId);
    res.json({
      mission,
      progress: {
        status: progress.status,
        attempts: progress.attempts,
        bestScore: progress.bestScore
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao iniciar missão' });
  }
};

// Submeter resultado da missão
exports.submitMission = async (req, res) => {
  try {
    const { missionId, score, timeSpent, details } = req.body;

    let progress = await PatientProgress.findOne({
      patient: req.userId,
      mission: missionId
    });

    if (!progress) {
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }

    // Atualizar progresso
    progress.status = score >= 70 ? 'completed' : 'failed';
    progress.score = score;
    progress.timeSpent = timeSpent;
    progress.details = details;
    progress.attempts += 1;

    if (score > progress.bestScore) {
      progress.bestScore = score;
    }

    if (progress.status === 'completed') {
      progress.completedAt = new Date();
    }

    await progress.save();

    res.json({
      message: 'Missão submetida com sucesso',
      progress
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao submeter missão' });
  }
};