const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');
const User = require('../models/User');

// @GET /api/analytics/success-rate/:habitId?days=30
router.get('/success-rate/:habitId', protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const logs = await HabitLog.find({
      userId: req.user._id,
      habitId: req.params.habitId,
      date: { $gte: startDateStr },
      completed: true
    });

    const successRate = Math.round((logs.length / days) * 100);

    res.json({
      success: true,
      successRate,
      completedDays: logs.length,
      totalDays: days
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/analytics/mood-correlation
router.get('/mood-correlation', protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const logs = await HabitLog.find({
      userId: req.user._id,
      date: { $gte: startDateStr },
      mood: { $ne: null }
    });

    // Group by date — calculate completions and avg mood per day
    const dailyData = {};
    logs.forEach(log => {
      if (!dailyData[log.date]) {
        dailyData[log.date] = { completions: 0, total: 0, moods: [] };
      }
      if (log.completed) dailyData[log.date].completions++;
      dailyData[log.date].total++;
      if (log.mood) dailyData[log.date].moods.push(log.mood);
    });

    const correlationData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      completionRate: data.total > 0 ? Math.round((data.completions / data.total) * 100) : 0,
      avgMood: data.moods.length > 0
        ? Math.round((data.moods.reduce((a, b) => a + b, 0) / data.moods.length) * 10) / 10
        : null
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ success: true, data: correlationData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/analytics/summary - dashboard summary stats
router.get('/summary', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    const user = await User.findById(req.user._id);

    const today = new Date().toISOString().split('T')[0];
    const todayLogs = await HabitLog.find({ userId: req.user._id, date: today, completed: true });

    const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);
    const avgStreak = habits.length > 0
      ? Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length)
      : 0;
    const longestEverStreak = Math.max(...habits.map(h => h.longestStreak), 0);

    res.json({
      success: true,
      summary: {
        totalHabits: habits.length,
        completedToday: todayLogs.length,
        globalStreak: user.globalStreak,
        totalCompletions,
        avgStreak,
        longestEverStreak,
        level: user.level,
        xp: user.xp,
        freezesAvailable: user.freezesAvailable,
        badgeCount: user.badges.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/analytics/weekly-review
router.post('/weekly-review', protect, async (req, res) => {
  try {
    const { wentWell, challenges, rating } = req.body;
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil((((now - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
    const weekKey = `${year}-W${String(week).padStart(2, '0')}`;

    const user = await User.findById(req.user._id);

    // Replace existing entry for this week, if any
    user.weeklyReflections = user.weeklyReflections.filter(r => r.week !== weekKey);
    user.weeklyReflections.push({ week: weekKey, wentWell, challenges, rating });
    await user.save();

    res.json({ success: true, week: weekKey });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/analytics/weekly-reviews
router.get('/weekly-reviews', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('weeklyReflections');
    res.json({ success: true, reviews: user.weeklyReflections.sort((a, b) => b.week.localeCompare(a.week)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
