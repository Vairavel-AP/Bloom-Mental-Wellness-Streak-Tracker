const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const User = require('../models/User');

const getDateDiff = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const updateUserStreak = async (userId, habitId, date, isCompleted) => {
  try {
    const habit = await Habit.findById(habitId);
    if (!habit) return null;

    if (isCompleted) {
      const lastDate = habit.lastCompletedDate
        ? habit.lastCompletedDate.toISOString().split('T')[0]
        : null;

      if (!lastDate) {
        habit.currentStreak = 1;
      } else {
        const diff = getDateDiff(lastDate, date);
        if (diff === 1) {
          habit.currentStreak += 1;
        } else if (diff === 0) {
          // Same day, no change
        } else {
          habit.currentStreak = 1;
        }
      }

      habit.lastCompletedDate = new Date(date);
      habit.totalCompletions += 1;

      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }

      // Award freeze every 7-day streak milestone
      if (habit.currentStreak % 7 === 0 && habit.currentStreak > 0) {
        await User.findByIdAndUpdate(userId, { $inc: { freezesAvailable: 1 } });
      }
    } else {
      // Uncompleting — reduce streak
      habit.currentStreak = Math.max(0, habit.currentStreak - 1);
      habit.totalCompletions = Math.max(0, habit.totalCompletions - 1);
    }

    await habit.save();

    // Update global streak
    await updateGlobalStreak(userId, date);

    return {
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalCompletions: habit.totalCompletions
    };
  } catch (error) {
    console.error('Error updating streak:', error);
    return null;
  }
};

const updateGlobalStreak = async (userId, date) => {
  try {
    const completedToday = await HabitLog.countDocuments({
      userId,
      date,
      completed: true
    });

    if (completedToday > 0) {
      const user = await User.findById(userId);
      const lastActive = user.globalStreakLastUpdated
        ? user.globalStreakLastUpdated.toISOString().split('T')[0]
        : null;

      if (!lastActive) {
        user.globalStreak = 1;
      } else {
        const diff = getDateDiff(lastActive, date);
        if (diff === 1) {
          user.globalStreak += 1;
        } else if (diff > 1) {
          user.globalStreak = 1;
        }
      }

      user.globalStreakLastUpdated = new Date(date);
      await user.save();
    }
  } catch (error) {
    console.error('Error updating global streak:', error);
  }
};

// Nightly cron job to check broken streaks
const checkAndUpdateStreaks = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const habits = await Habit.find({ isActive: true, currentStreak: { $gt: 0 } });

    for (const habit of habits) {
      if (!habit.lastCompletedDate) continue;
      const lastDate = habit.lastCompletedDate.toISOString().split('T')[0];
      const diff = getDateDiff(lastDate, yesterdayStr);

      if (diff > 1) {
        // Check if user has a freeze
        const user = await User.findById(habit.userId);
        if (user && user.freezesAvailable > 0) {
          // Use freeze
          user.freezesAvailable -= 1;
          await user.save();
          habit.streakFreezeUsed = true;
        } else {
          // Break streak
          habit.currentStreak = 0;
          habit.streakFreezeUsed = false;
        }
        await habit.save();
      }
    }

    console.log('✅ Streak check complete');
  } catch (error) {
    console.error('Streak check error:', error);
  }
};

const useStreakFreeze = async (userId, habitId) => {
  try {
    const user = await User.findById(userId);
    if (!user || user.freezesAvailable <= 0) {
      return { success: false, message: 'No freezes available' };
    }

    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) return { success: false, message: 'Habit not found' };

    user.freezesAvailable -= 1;
    await user.save();

    // Extend last completed date by 1 day to preserve streak
    const lastDate = new Date(habit.lastCompletedDate);
    lastDate.setDate(lastDate.getDate() + 1);
    habit.lastCompletedDate = lastDate;
    habit.streakFreezeUsed = true;
    await habit.save();

    return { success: true, freezesRemaining: user.freezesAvailable };
  } catch (error) {
    return { success: false, message: 'Server error' };
  }
};

module.exports = { updateUserStreak, checkAndUpdateStreaks, useStreakFreeze };
