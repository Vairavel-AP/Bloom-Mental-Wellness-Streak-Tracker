const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// @GET /api/habits/presets
router.get('/presets', protect, (req, res) => {
  res.json({ success: true, presets: Habit.PRESET_HABITS });
});

// @GET /api/habits
router.get('/', protect, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true }).sort({ order: 1 });
    res.json({ success: true, habits });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/habits
router.post('/', protect, async (req, res) => {
  try {
    const { name, icon, color, category, isPreset, presetId, isPartial, totalUnits, unitLabel, reminderTime } = req.body;

    const existingCount = await Habit.countDocuments({ userId: req.user._id, isActive: true });

    const habit = await Habit.create({
      userId: req.user._id,
      name,
      icon: icon || '⭐',
      color: color || '#7C3AED',
      category: category || 'custom',
      isPreset: isPreset || false,
      presetId: presetId || null,
      isPartial: isPartial || false,
      totalUnits: totalUnits || null,
      unitLabel: unitLabel || null,
      reminderEnabled: !!reminderTime,
      reminderTime: reminderTime || null,
      order: existingCount
    });

    res.status(201).json({ success: true, habit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @PUT /api/habits/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

    const { name, icon, color, category, reminderTime, reminderEnabled, order } = req.body;
    if (name) habit.name = name;
    if (icon) habit.icon = icon;
    if (color) habit.color = color;
    if (category) habit.category = category;
    if (reminderTime !== undefined) habit.reminderTime = reminderTime;
    if (reminderEnabled !== undefined) habit.reminderEnabled = reminderEnabled;
    if (order !== undefined) habit.order = order;

    await habit.save();
    res.json({ success: true, habit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @DELETE /api/habits/:id (soft delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, message: 'Habit removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/habits/today - get today's habits with completion status
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const habits = await Habit.find({ userId: req.user._id, isActive: true }).sort({ order: 1 });
    const logs = await HabitLog.find({ userId: req.user._id, date: today });

    const logMap = {};
    logs.forEach(log => { logMap[log.habitId.toString()] = log; });

    const habitsWithStatus = habits.map(habit => ({
      ...habit.toObject(),
      todayLog: logMap[habit._id.toString()] || null,
      completedToday: logMap[habit._id.toString()]?.completed || false
    }));

    res.json({ success: true, habits: habitsWithStatus, date: today });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
