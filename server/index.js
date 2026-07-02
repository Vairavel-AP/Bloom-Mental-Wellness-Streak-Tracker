const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/habits", require("./routes/habits"));
app.use("/api/logs", require("./routes/logs"));
app.use("/api/streaks", require("./routes/streaks"));
app.use("/api/badges", require("./routes/badges"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/social", require("./routes/social"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/users", require("./routes/users"));

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "OK", timestamp: new Date() }),
);

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/wellness-tracker",
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Cron Jobs
// Daily midnight reset - check streaks
cron.schedule("0 0 * * *", async () => {
  console.log("🕛 Running daily streak check...");
  const { checkAndUpdateStreaks } = require("./controllers/streakController");
  await checkAndUpdateStreaks();
});

// Evening reminder check at 8 PM
cron.schedule("0 20 * * *", async () => {
  console.log("🔔 Running evening streak alert check...");
  const { sendStreakAlerts } = require("./controllers/notificationController");
  await sendStreakAlerts();
});

const session = require("express-session");
const passport = require("./config/passport");

// Session (required by passport, even with JWT)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

// Passport
app.use(passport.initialize());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
