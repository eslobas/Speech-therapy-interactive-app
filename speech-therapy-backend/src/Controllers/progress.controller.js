const PatientProgress = require('../models/PatientProgress.model');
const DailyMission = require('../models/DailyMission.model');
const User = require('../models/User.model');

// Obter progresso do paciente
exports.getPatientProgress = async (req, res) => {
  try {
    const progress = await PatientProgress.find({
      patient: req.userId
    }).populate('mission').sort({ createdAt: -1 });

    const stats = {
      totalMissions: progress.length,
      completed: progress.filter(p => p.status === 'completed').length,
      inProgress: progress.filter(p => p.status === 'in_progress').length,
      totalScore: progress.reduce((sum, p) => sum + p.score, 0),
      avgScore: progress.length > 0 ? 
        progress.reduce((sum, p) => sum + p.score, 0) / progress.length : 0
    };

    res.json({ progress, stats });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar progresso' });
  }
};

// Obter ranking diário/semanal
exports.getRanking = async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    const now = new Date();
    let startDate;

    if (period === 'daily') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period === 'weekly') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else {
      startDate = new Date(0); // All time
    }

    // Buscar progressos no período
    const progressData = await PatientProgress.aggregate([
      {
        $match: {
          completedAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$patient',
          completedMissions: { $sum: 1 },
          avgScore: { $avg: '$score' },
          totalTime: { $sum: '$timeSpent' },
          lastCompletion: { $max: '$completedAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      {
        $unwind: '$patientInfo'
      },
      {
        $project: {
          patientId: '$_id',
          name: '$patientInfo.name',
          completedMissions: 1,
          avgScore: { $round: ['$avgScore', 2] },
          totalTime: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedMissions', 3] }, // Assumindo 3 missões diárias
              100
            ]
          },
          lastCompletion: 1
        }
      },
      {
        $sort: { completionRate: -1, avgScore: -1 }
      }
    ]);

    res.json(progressData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar ranking' });
  }
};

// Obter estatísticas do terapeuta sobre seus pacientes
exports.getTherapistStats = async (req, res) => {
  try {
    // Buscar pacientes do terapeuta
    const therapistPatients = await TherapistPatient.find({
      therapist: req.userId
    }).populate('patient');

    const patientIds = therapistPatients.map(tp => tp.patient._id);

    // Estatísticas de progresso
    const progressStats = await PatientProgress.aggregate([
      {
        $match: {
          patient: { $in: patientIds }
        }
      },
      {
        $group: {
          _id: '$patient',
          totalMissions: { $sum: 1 },
          completedMissions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          avgScore: { $avg: '$score' },
          totalPracticeTime: { $sum: '$timeSpent' }
        }
      }
    ]);

    // Calcular percentagens
    const statsWithPercentages = progressStats.map(stat => ({
      ...stat,
      completionRate: (stat.completedMissions / stat.totalMissions) * 100 || 0
    }));

    res.json(statsWithPercentages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};