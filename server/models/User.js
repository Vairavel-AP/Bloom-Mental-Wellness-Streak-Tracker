const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  googleId: {
    type: String,
    default: null
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  globalStreak: {
    type: Number,
    default: 0
  },
  globalStreakLastUpdated: {
    type: Date,
    default: null
  },
  freezesAvailable: {
    type: Number,
    default: 0
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  silentHoursStart: {
    type: String, // "22:00"
    default: '22:00'
  },
  silentHoursEnd: {
    type: String, // "07:00"
    default: '07:00'
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  dailyQuoteEnabled: {
    type: Boolean,
    default: true
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
  badges: [{
    badgeId: String,
    name: String,
    description: String,
    icon: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  lastActiveDate: {
    type: Date,
    default: null
  },
  weeklyReflections: [{
    week: String, // "2024-W01"
    wentWell: String,
    challenges: String,
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate level from XP
UserSchema.methods.updateLevel = function() {
  const xpPerLevel = 100;
  this.level = Math.floor(this.xp / xpPerLevel) + 1;
};

module.exports = mongoose.model('User', UserSchema);
