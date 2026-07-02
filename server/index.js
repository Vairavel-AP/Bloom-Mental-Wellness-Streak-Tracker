const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");
const session = require("express-session");
const passport = require("./config/passport");

dotenv.config();

const app = express();

// ✅ Fixed: was "pp.use"
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://bloom-wellness-nine.vercel.app",
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.options("*", cors());

app.use(express.json());

// ✅ Session & Passport moved before routes
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());

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
cron.schedule("0 0 * * *", async () => {
  console.log("🕛 Running daily streak check...");
  const { checkAndUpdateStreaks } = require("./controllers/streakController");
  await checkAndUpdateStreaks();
});

cron.schedule("0 20 * * *", async () => {
  console.log("🔔 Running evening streak alert check...");
  const { sendStreakAlerts } = require("./controllers/notificationController");
  await sendStreakAlerts();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
