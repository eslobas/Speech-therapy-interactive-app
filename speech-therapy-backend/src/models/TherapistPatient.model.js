const mongoose = require('mongoose');

const therapistPatientSchema = new mongoose.Schema({
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapistCode: {
    type: String,
    required: true,
    unique: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  },
  therapyGoals: [{
    goal: String,
    targetSound: String,
    targetDate: Date,
    currentLevel: Number,
    targetLevel: Number
  }],
  nextSession: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

therapistPatientSchema.index({ therapist: 1, patient: 1 }, { unique: true });

module.exports = mongoose.model('TherapistPatient', therapistPatientSchema);