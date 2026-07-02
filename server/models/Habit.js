const mongoose = require('mongoose');

const PRESET_HABITS = [
  { id: 'meditate', name: 'Meditate 5 min', icon: '🧘', color: '#7C3AED', category: 'mindfulness' },
  { id: 'journal', name: 'Journal', icon: '📓', color: '#2563EB', category: 'mindfulness' },
  { id: 'walk', name: 'Take a Walk', icon: '🚶', color: '#059669', category: 'movement' },
  { id: 'water', name: 'Drink 8 Glasses', icon: '💧', color: '#0EA5E9', category: 'health', isPartial: true, totalUnits: 8, unitLabel: 'glasses' },
  { id: 'read', name: 'Read 10 Pages', icon: '📚', color: '#D97706', category: 'growth', isPartial: true, totalUnits: 10, unitLabel: 'pages' },
  { id: 'gratitude', name: '3 Gratitudes', icon: '🙏', color: '#DB2777', category: 'mindfulness' },
  { id: 'sleep', name: 'Sleep 8 Hours', icon: '😴', color: '#6366F1', category: 'health' },
  { id: 'exercise', name: 'Exercise 30 min', icon: '💪', color: '#EF4444', category: 'movement' },
  { id: 'breathe', name: 'Deep Breathing', icon: '🌬️', color: '#14B8A6', category: 'mindfulness' },
  { id: 'noscreen', name: 'No Screen 1hr', icon: '📵', color: '#78716C', category: 'digital' },
  { id: 'stretch', name: 'Stretch', icon: '🤸', color: '#F59E0B', category: 'movement' },
  { id: 'affirmation', name: 'Say Affirmations', icon: '✨', color: '#EC4899', category: 'mindfulness' }
];

const HabitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    maxlength: [60, 'Habit name too long']
  },
  icon: {
    type: String,
    default: '⭐'
  },
  color: {
    type: String,
    default: '#7C3AED'
  },
  category: {
    type: String,
    enum: ['mindfulness', 'movement', 'health', 'growth', 'digital', 'social', 'custom'],
    default: 'custom'
  },
  isPreset: {
    type: Boolean,
    default: false
  },
  presetId: {
    type: String,
    default: null
  },
  isPartial: {
    type: Boolean,
    default: false
  },
  totalUnits: {
    type: Number,
    default: null
  },
  unitLabel: {
    type: String,
    default: null
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalCompletions: {
    type: Number,
    default: 0
  },
  lastCompletedDate: {
    type: Date,
    default: null
  },
  streakFreezeUsed: {
    type: Boolean,
    default: false
  },
  reminderEnabled: {
    type: Boolean,
    default: false
  },
  reminderTime: {
    type: String, // "09:00"
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

HabitSchema.statics.PRESET_HABITS = PRESET_HABITS;

module.exports = mongoose.model('Habit', HabitSchema);
