const mongoose = require('mongoose');

const patientProgressSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: true
  },
  dailyMission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyMission'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // em segundos
    default: 0
  },
  completedAt: {
    type: Date
  },
  feedback: {
    type: String
  },
  audioRecordings: [{
    url: String,
    duration: Number,
    createdAt: Date
  }],
  details: {
    correctAnswers: Number,
    totalQuestions: Number,
    mistakes: [{
      word: String,
      expectedSound: String,
      userSound: String
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

patientProgressSchema.index({ patient: 1, mission: 1 }, { unique: true });

module.exports = mongoose.model('PatientProgress', patientProgressSchema);