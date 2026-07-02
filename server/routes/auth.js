const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { generateToken, protect } = require("../middleware/auth");

const passport = require("passport");
require("../config/passport");

// @GET /api/auth/google — redirect to Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// @GET /api/auth/google/callback — Google redirects here after login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    // Generate JWT for the user
    const token = generateToken(req.user._id);

    // Redirect to frontend with token in URL
    res.redirect(
      `${process.env.CLIENT_URL}/auth/google/success?token=${token}`,
    );
  },
);

// @POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("timezone").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });

      const { name, email, password, timezone } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res
          .status(400)
          .json({ success: false, message: "Email already registered" });

      const user = await User.create({
        name,
        email,
        password,
        timezone: timezone || "UTC",
      });
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          level: user.level,
          xp: user.xp,
          globalStreak: user.globalStreak,
          timezone: user.timezone,
          darkMode: user.darkMode,
          badges: user.badges,
          freezesAvailable: user.freezesAvailable,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

// @POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      if (!user || !user.password) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch)
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });

      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          level: user.level,
          xp: user.xp,
          globalStreak: user.globalStreak,
          timezone: user.timezone,
          darkMode: user.darkMode,
          badges: user.badges,
          freezesAvailable: user.freezesAvailable,
          notificationsEnabled: user.notificationsEnabled,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

// @GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends",
      "name email level globalStreak avatar",
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @PUT /api/auth/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const {
      name,
      timezone,
      darkMode,
      silentHoursStart,
      silentHoursEnd,
      notificationsEnabled,
      dailyQuoteEnabled,
    } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (timezone) updates.timezone = timezone;
    if (darkMode !== undefined) updates.darkMode = darkMode;
    if (silentHoursStart) updates.silentHoursStart = silentHoursStart;
    if (silentHoursEnd) updates.silentHoursEnd = silentHoursEnd;
    if (notificationsEnabled !== undefined)
      updates.notificationsEnabled = notificationsEnabled;
    if (dailyQuoteEnabled !== undefined)
      updates.dailyQuoteEnabled = dailyQuoteEnabled;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
