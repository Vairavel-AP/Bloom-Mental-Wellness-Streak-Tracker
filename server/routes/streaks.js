const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Habit = require('../models/Habit');
const User = require('../models/User');
const { useStreakFreeze } = require('../controllers/streakController');

// @GET /api/streaks - get all streak info
router.get('/', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true });
    const user = await User.findById(req.user._id);

    const streaks = habits.map(h => ({
      habitId: h._id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      currentStreak: h.currentStreak,
      longestStreak: h.longestStreak,
      totalCompletions: h.totalCompletions,
      streakFreezeUsed: h.streakFreezeUsed
    }));

    res.json({
      success: true,
      streaks,
      globalStreak: user.globalStreak,
      freezesAvailable: user.freezesAvailable
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/streaks/freeze/:habitId - use a streak freeze
router.post('/freeze/:habitId', protect, async (req, res) => {
  try {
    const result = await useStreakFreeze(req.user._id, req.params.habitId);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
