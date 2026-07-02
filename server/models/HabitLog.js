const mongoose = require('mongoose');

const HabitLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  date: {
    type: String, // "2024-01-15" (YYYY-MM-DD in user's timezone)
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  partialProgress: {
    type: Number, // e.g., 3 out of 8 glasses
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  mood: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  note: {
    type: String,
    maxlength: 200,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for efficient lookup
HabitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });
HabitLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('HabitLog', HabitLogSchema);
