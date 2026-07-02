const mongoose = require('mongoose');

// Badge definitions
const BADGE_DEFINITIONS = [
  { id: 'first_step', name: 'First Step', description: 'Complete your first habit', icon: '👶', condition: { type: 'total_completions', value: 1 } },
  { id: 'week_warrior', name: '7 Days Strong', description: 'Maintain a 7-day streak', icon: '🔥', condition: { type: 'streak', value: 7 } },
  { id: 'two_weeks', name: 'Fortnight Fighter', description: 'Maintain a 14-day streak', icon: '⚡', condition: { type: 'streak', value: 14 } },
  { id: 'thirty_champion', name: '30 Day Champion', description: 'Maintain a 30-day streak', icon: '🏆', condition: { type: 'streak', value: 30 } },
  { id: 'century', name: 'Century Club', description: 'Complete 100 habits total', icon: '💯', condition: { type: 'total_completions', value: 100 } },
  { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5', icon: '⭐', condition: { type: 'level', value: 5 } },
  { id: 'level_10', name: 'Wellness Pro', description: 'Reach Level 10', icon: '🌟', condition: { type: 'level', value: 10 } },
  { id: 'multi_habit', name: 'Juggler', description: 'Track 5+ habits at once', icon: '🎪', condition: { type: 'habits_count', value: 5 } },
  { id: 'streak_saver', name: 'Streak Saver', description: 'Use a streak freeze', icon: '❄️', condition: { type: 'freeze_used', value: 1 } },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Add your first buddy', icon: '🦋', condition: { type: 'friends_count', value: 1 } },
  { id: 'perfect_week', name: 'Perfect Week', description: 'Complete all habits for 7 consecutive days', icon: '✨', condition: { type: 'perfect_week', value: 1 } },
  { id: 'sixty_days', name: 'Two Month Legend', description: 'Maintain a 60-day streak', icon: '👑', condition: { type: 'streak', value: 60 } }
];

const BadgeSchema = new mongoose.Schema({
  definitions: { type: Array, default: BADGE_DEFINITIONS }
});

BadgeSchema.statics.BADGE_DEFINITIONS = BADGE_DEFINITIONS;

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['streak_alert', 'buddy_nudge', 'badge_unlock', 'daily_quote', 'weekly_review', 'friend_request'],
    required: true
  },
  title: String,
  message: String,
  data: mongoose.Schema.Types.Mixed,
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = {
  Notification: mongoose.model('Notification', NotificationSchema),
  BADGE_DEFINITIONS
};
