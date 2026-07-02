const User = require('../models/User');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { Notification } = require('../models/Badge');

const QUOTES = [
  "Small steps every day lead to big changes.",
  "You don't have to be perfect, just consistent.",
  "Progress, not perfection.",
  "Your mental health is worth the effort.",
  "One habit at a time builds a better you.",
  "Showing up today is enough.",
  "Consistency is the quiet force behind growth.",
  "Be proud of how far you've come.",
  "Rest is productive too.",
  "Every streak starts with a single day."
];

const isWithinSilentHours = (user) => {
  if (!user.silentHoursStart || !user.silentHoursEnd) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = user.silentHoursStart.split(':').map(Number);
  const [endH, endM] = user.silentHoursEnd.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Overnight range (e.g. 22:00 - 07:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
};

// Evening "Don't Break the Chain" alerts
const sendStreakAlerts = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const users = await User.find({ notificationsEnabled: true });

    for (const user of users) {
      if (isWithinSilentHours(user)) continue;

      const habits = await Habit.find({ userId: user._id, isActive: true, currentStreak: { $gt: 0 } });
      if (habits.length === 0) continue;

      const logs = await HabitLog.find({ userId: user._id, date: today, completed: true });
      const completedHabitIds = logs.map(l => l.habitId.toString());

      const atRiskHabits = habits.filter(h => !completedHabitIds.includes(h._id.toString()));

      if (atRiskHabits.length > 0) {
        const habitNames = atRiskHabits.map(h => h.name).join(', ');
        await Notification.create({
          userId: user._id,
          type: 'streak_alert',
          title: '⏰ Don\'t Break the Chain!',
          message: `Your streak for ${habitNames} is at risk. Complete it before midnight!`,
          data: { habitIds: atRiskHabits.map(h => h._id) }
        });
      }
    }

    console.log('✅ Streak alerts sent');
  } catch (error) {
    console.error('Streak alert error:', error);
  }
};

// Daily motivational quote
const sendDailyQuotes = async () => {
  try {
    const users = await User.find({ dailyQuoteEnabled: true, notificationsEnabled: true });
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    for (const user of users) {
      if (isWithinSilentHours(user)) continue;

      await Notification.create({
        userId: user._id,
        type: 'daily_quote',
        title: '✨ Today\'s Affirmation',
        message: quote
      });
    }
  } catch (error) {
    console.error('Daily quote error:', error);
  }
};

module.exports = { sendStreakAlerts, sendDailyQuotes, isWithinSilentHours, QUOTES };
