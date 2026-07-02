const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @GET /api/users/:id/public - public profile (limited info for buddies)
router.get('/:id/public', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name avatar level globalStreak badges');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
