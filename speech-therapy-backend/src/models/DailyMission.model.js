const mongoose = require('mongoose');

const dailyMissionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isMandatory: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('DailyMission', dailyMissionSchema);