const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['articular_sons', 'palavras_complexas', 'pronunciar_in', 'sons_especificos'],
    required: true
  },
  difficulty: {
    type: Number,
    enum: [1, 2, 3],
    required: true
  },
  targetSounds: [{
    type: String,
    enum: ['s', 'z', 'j', 'f', 'v', 'l', 'd', 'r', 'ch', 'lh', 'nh']
  }],
  targetVowels: [{
    type: String,
    enum: ['A', 'E', 'I', 'O', 'U']
  }],
  ageRange: {
    min: { type: Number, min: 0, max: 100 },
    max: { type: Number, min: 0, max: 100 }
  },
  words: [{
    word: String,
    image: String,
    audio: String
  }],
  instructions: {
    type: String
  },
  maxScore: {
    type: Number,
    default: 100
  },
  estimatedTime: {
    type: Number, // em minutos
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mission', missionSchema);