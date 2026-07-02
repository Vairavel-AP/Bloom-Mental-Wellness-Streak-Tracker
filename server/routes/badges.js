const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { BADGE_DEFINITIONS } = require('../controllers/badgeController');

// @GET /api/badges/all - all possible badges
router.get('/all', protect, (req, res) => {
  res.json({ success: true, badges: BADGE_DEFINITIONS });
});

// @GET /api/badges/me - user's earned badges
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('badges level xp');
    const earnedIds = user.badges.map(b => b.badgeId);
    const locked = BADGE_DEFINITIONS.filter(b => !earnedIds.includes(b.id));

    res.json({
      success: true,
      earned: user.badges,
      locked,
      level: user.level,
      xp: user.xp,
      xpToNextLevel: (user.level * 100) - user.xp
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
