const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { Notification } = require('../models/Badge');

// @POST /api/social/request/:userId - send friend request
router.post('/request/:userId', protect, async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot add yourself' });
    }

    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const alreadyFriends = targetUser.friends.includes(req.user._id);
    if (alreadyFriends) return res.status(400).json({ success: false, message: 'Already buddies' });

    const existingRequest = targetUser.friendRequests.find(
      r => r.from.toString() === req.user._id.toString() && r.status === 'pending'
    );
    if (existingRequest) return res.status(400).json({ success: false, message: 'Request already sent' });

    targetUser.friendRequests.push({ from: req.user._id, status: 'pending' });
    await targetUser.save();

    await Notification.create({
      userId: targetUser._id,
      type: 'friend_request',
      title: '👋 New Buddy Request',
      message: `${req.user.name} wants to be your accountability buddy!`,
      data: { fromUserId: req.user._id }
    });

    res.json({ success: true, message: 'Request sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/social/respond/:requestId - accept/reject friend request
router.post('/respond/:fromUserId', protect, async (req, res) => {
  try {
    const { accept } = req.body;
    const user = await User.findById(req.user._id);

    const request = user.friendRequests.find(
      r => r.from.toString() === req.params.fromUserId && r.status === 'pending'
    );
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = accept ? 'accepted' : 'rejected';

    if (accept) {
      user.friends.push(request.from);
      await User.findByIdAndUpdate(request.from, { $push: { friends: user._id } });
    }

    await user.save();
    res.json({ success: true, message: accept ? 'Buddy added!' : 'Request declined' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/social/requests - pending requests
router.get('/requests', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests.from', 'name email avatar');
    const pending = user.friendRequests.filter(r => r.status === 'pending');
    res.json({ success: true, requests: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/social/buddies - get buddy list with their status
router.get('/buddies', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name avatar level globalStreak');
    const today = new Date().toISOString().split('T')[0];

    const buddies = await Promise.all(user.friends.map(async friend => {
      const completedToday = await HabitLog.countDocuments({
        userId: friend._id, date: today, completed: true
      });
      return {
        _id: friend._id,
        name: friend.name,
        avatar: friend.avatar,
        level: friend.level,
        globalStreak: friend.globalStreak,
        completedToday: completedToday > 0
      };
    }));

    res.json({ success: true, buddies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/social/nudge/:buddyId - send encouraging emoji nudge
router.post('/nudge/:buddyId', protect, async (req, res) => {
  try {
    const { emoji } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.friends.includes(req.params.buddyId)) {
      return res.status(403).json({ success: false, message: 'Not your buddy' });
    }

    await Notification.create({
      userId: req.params.buddyId,
      type: 'buddy_nudge',
      title: `${emoji || '👋'} Nudge from ${user.name}`,
      message: `${user.name} is cheering you on! Don't forget today's habits.`,
      data: { fromUserId: user._id, emoji: emoji || '👋' }
    });

    res.json({ success: true, message: 'Nudge sent!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/social/leaderboard - opt-in leaderboard among buddies
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name avatar globalStreak level xp');

    const leaderboard = [
      { _id: user._id, name: user.name + ' (You)', avatar: user.avatar, globalStreak: user.globalStreak, level: user.level, xp: user.xp },
      ...user.friends.map(f => ({ _id: f._id, name: f.name, avatar: f.avatar, globalStreak: f.globalStreak, level: f.level, xp: f.xp }))
    ].sort((a, b) => b.globalStreak - a.globalStreak);

    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/social/search?email=...
router.get('/search', protect, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('name email avatar');
    if (!user) return res.status(404).json({ success: false, message: 'No user found with that email' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'That\'s you!' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
