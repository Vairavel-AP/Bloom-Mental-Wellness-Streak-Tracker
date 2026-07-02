const User = require('../models/User');
const Habit = require('../models/Habit');
const { BADGE_DEFINITIONS } = require('../models/Badge');

const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const habits = await Habit.find({ userId, isActive: true });
    const existingBadgeIds = user.badges.map(b => b.badgeId);
    const newBadges = [];

    const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);
    const maxStreak = Math.max(...habits.map(h => h.currentStreak), 0);
    const friendsCount = user.friends.length;

    for (const badge of BADGE_DEFINITIONS) {
      if (existingBadgeIds.includes(badge.id)) continue;

      let earned = false;

      switch (badge.condition.type) {
        case 'total_completions':
          earned = totalCompletions >= badge.condition.value;
          break;
        case 'streak':
          earned = maxStreak >= badge.condition.value;
          break;
        case 'level':
          earned = user.level >= badge.condition.value;
          break;
        case 'habits_count':
          earned = habits.length >= badge.condition.value;
          break;
        case 'freeze_used':
          earned = habits.some(h => h.streakFreezeUsed);
          break;
        case 'friends_count':
          earned = friendsCount >= badge.condition.value;
          break;
        case 'perfect_week':
          // Check if all habits were completed every day for the past 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const minStreak = Math.min(...habits.map(h => h.currentStreak));
          earned = minStreak >= 7 && habits.length > 0;
          break;
      }

      if (earned) {
        user.badges.push({
          badgeId: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          unlockedAt: new Date()
        });
        newBadges.push(badge);
      }
    }

    if (newBadges.length > 0) {
      await user.save();
    }

    return newBadges;
  } catch (error) {
    console.error('Badge check error:', error);
    return [];
  }
};

module.exports = { checkAndAwardBadges, BADGE_DEFINITIONS };
