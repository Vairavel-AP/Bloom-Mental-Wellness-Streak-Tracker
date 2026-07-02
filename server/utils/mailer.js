const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bloom Wellness" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};

// Email templates
const templates = {
  welcome: (name) => ({
    subject: "🌱 Welcome to Bloom!",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: auto; padding: 32px;">
        <h1 style="color: #516b2d;">Welcome, ${name}!</h1>
        <p>Your wellness journey starts today. Plant small habits, watch them grow.</p>
        <a href="${process.env.CLIENT_URL}" 
           style="display:inline-block; margin-top:16px; padding:12px 24px; 
                  background:#6b8c3c; color:white; border-radius:8px; text-decoration:none;">
          Open Bloom
        </a>
        <p style="color:#888; font-size:12px; margin-top:32px;">Bloom Wellness Tracker</p>
      </div>
    `,
  }),

  streakAlert: (name, habits) => ({
    subject: "⏰ Don't Break the Chain!",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: auto; padding: 32px;">
        <h2 style="color: #bc6d36;">Hey ${name}, your streak is at risk!</h2>
        <p>You haven't completed these habits today:</p>
        <ul>
          ${habits.map((h) => `<li style="margin:8px 0;">${h.icon} <strong>${h.name}</strong> — ${h.currentStreak} day streak</li>`).join("")}
        </ul>
        <p>Complete them before midnight to keep your streak alive!</p>
        <a href="${process.env.CLIENT_URL}" 
           style="display:inline-block; margin-top:16px; padding:12px 24px; 
                  background:#6b8c3c; color:white; border-radius:8px; text-decoration:none;">
          Complete Now
        </a>
      </div>
    `,
  }),

  dailyQuote: (name, quote) => ({
    subject: "✨ Your Daily Affirmation",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: auto; padding: 32px;">
        <h2 style="color: #516b2d;">Good morning, ${name}!</h2>
        <blockquote style="border-left: 4px solid #6b8c3c; padding-left: 16px; 
                           font-style: italic; color: #5a5444; font-size: 18px;">
          "${quote}"
        </blockquote>
        <a href="${process.env.CLIENT_URL}" 
           style="display:inline-block; margin-top:24px; padding:12px 24px; 
                  background:#6b8c3c; color:white; border-radius:8px; text-decoration:none;">
          Log Today's Habits
        </a>
      </div>
    `,
  }),

  buddyNudge: (name, fromName, emoji) => ({
    subject: `${emoji} ${fromName} is cheering you on!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: auto; padding: 32px;">
        <h2 style="color: #516b2d;">${emoji} Nudge from ${fromName}!</h2>
        <p>Hey ${name}, <strong>${fromName}</strong> noticed you haven't logged today's habits yet.</p>
        <p>They're cheering you on — don't let them down!</p>
        <a href="${process.env.CLIENT_URL}" 
           style="display:inline-block; margin-top:16px; padding:12px 24px; 
                  background:#6b8c3c; color:white; border-radius:8px; text-decoration:none;">
          Log Habits Now
        </a>
      </div>
    `,
  }),

  badgeUnlock: (name, badge) => ({
    subject: `${badge.icon} Badge Unlocked — ${badge.name}!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: auto; padding: 32px;">
        <div style="text-align:center;">
          <div style="font-size: 64px;">${badge.icon}</div>
          <h2 style="color: #516b2d;">Badge Unlocked!</h2>
          <h3>${badge.name}</h3>
          <p style="color:#5a5444;">${badge.description}</p>
        </div>
        <a href="${process.env.CLIENT_URL}/badges" 
           style="display:block; text-align:center; margin-top:24px; padding:12px 24px; 
                  background:#6b8c3c; color:white; border-radius:8px; text-decoration:none;">
          View All Badges
        </a>
      </div>
    `,
  }),
};

module.exports = { sendMail, templates };
