const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');
const User = require('../models/User');
const { checkAndAwardBadges } = require('../controllers/badgeController');
const { updateUserStreak } = require('../controllers/streakController');

// @POST /api/logs/complete/:habitId - Complete or uncomplete a habit for today
router.post('/complete/:habitId', protect, async (req, res) => {
  try {
    const { partialProgress, mood, note } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user._id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

    // Upsert log
    let log = await HabitLog.findOne({ userId: req.user._id, habitId: habit._id, date: today });

    const isCompleting = !log?.completed;

    if (log) {
      log.completed = !log.completed;
      if (log.completed) {
        log.completedAt = new Date();
        if (partialProgress !== undefined) log.partialProgress = partialProgress;
      } else {
        log.completedAt = null;
      }
      if (mood) log.mood = mood;
      if (note) log.note = note;
      await log.save();
    } else {
      log = await HabitLog.create({
        userId: req.user._id,
        habitId: habit._id,
        date: today,
        completed: true,
        completedAt: new Date(),
        partialProgress: partialProgress || null,
        mood: mood || null,
        note: note || null
      });
    }

    // Update streak
    const streakResult = await updateUserStreak(req.user._id, habit._id, today, log.completed);

    // Update XP if completing
    if (isCompleting && log.completed) {
      const xpGain = 10;
      const user = await User.findById(req.user._id);
      user.xp += xpGain;
      user.updateLevel();
      user.lastActiveDate = new Date();
      await user.save();

      // Check badges
      const newBadges = await checkAndAwardBadges(user._id);

      return res.json({
        success: true,
        log,
        streak: streakResult,
        xpGained: xpGain,
        newBadges,
        action: 'completed'
      });
    }

    res.json({ success: true, log, streak: streakResult, action: log.completed ? 'completed' : 'uncompleted' });
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/logs/partial/:habitId
router.post('/partial/:habitId', protect, async (req, res) => {
  try {
    const { progress } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user._id });
    if (!habit || !habit.isPartial) return res.status(400).json({ success: false, message: 'Not a partial habit' });

    const isComplete = progress >= habit.totalUnits;

    const log = await HabitLog.findOneAndUpdate(
      { userId: req.user._id, habitId: habit._id, date: today },
      {
        partialProgress: progress,
        completed: isComplete,
        completedAt: isComplete ? new Date() : null
      },
      { upsert: true, new: true }
    );

    // Award XP if just completed
    if (isComplete) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 10 } });
    }

    res.json({ success: true, log, isComplete });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/logs/mood - Log daily mood
router.post('/mood', protect, async (req, res) => {
  try {
    const { mood, date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Update all of today's logs with the mood rating
    await HabitLog.updateMany(
      { userId: req.user._id, date: targetDate },
      { mood }
    );

    res.json({ success: true, mood, date: targetDate });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/logs/calendar/:habitId?year=2024&month=1
router.get('/calendar/:habitId', protect, async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const logs = await HabitLog.find({
      userId: req.user._id,
      habitId: req.params.habitId,
      date: { $gte: startDate, $lte: endDate }
    });

    const calendarData = {};
    logs.forEach(log => {
      calendarData[log.date] = {
        completed: log.completed,
        partialProgress: log.partialProgress,
        mood: log.mood
      };
    });

    res.json({ success: true, calendar: calendarData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/logs/overview - Get all habits calendar
router.get('/overview', protect, async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const logs = await HabitLog.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
      completed: true
    });

    // Group by date
    const overview = {};
    logs.forEach(log => {
      if (!overview[log.date]) overview[log.date] = 0;
      overview[log.date]++;
    });

    res.json({ success: true, overview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
