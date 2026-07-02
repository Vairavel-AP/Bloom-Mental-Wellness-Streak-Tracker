import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Flame, Snowflake, Sparkles } from 'lucide-react';
import api from '../utils/api';
import HabitCard from '../components/habits/HabitCard';
import AddHabitModal from '../components/habits/AddHabitModal';
import BadgeUnlockModal from '../components/streak/BadgeUnlockModal';
import MoodCheckIn from '../components/analytics/MoodCheckIn';
import { useAuth } from '../context/AuthContext';

const QUOTES = [
  "Small steps every day lead to big changes.",
  "You don't have to be perfect, just consistent.",
  "Progress, not perfection.",
  "Showing up today is enough.",
  "Every streak starts with a single day.",
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const DashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [todayMood, setTodayMood] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [habitsRes, summaryRes] = await Promise.all([
        api.get('/habits/today'),
        api.get('/analytics/summary'),
      ]);
      setHabits(habitsRes.data.habits);
      setSummary(summaryRes.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdate = async () => {
    await fetchData();
    refreshUser();
  };

  const handleBadgesEarned = (badges) => {
    setNewBadges(badges);
  };

  const completedCount = habits.filter((h) => h.completedToday).length;
  const allDone = habits.length > 0 && completedCount === habits.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1 italic">"{quote}"</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-moss-600 hover:bg-moss-700 text-white text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={16} /> Add habit
        </button>
      </div>

      {/* Stats row */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<Flame size={18} className="text-clay-500" fill="currentColor" />} label="Global streak" value={`${summary.globalStreak}d`} />
          <StatCard icon={<Snowflake size={18} className="text-sky-500" />} label="Freezes" value={summary.freezesAvailable} />
          <StatCard icon={<Sparkles size={18} className="text-sun" />} label="Level" value={summary.level} sub={`${user?.xp} XP`} />
        </div>
      )}

      {/* Daily checklist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100">Today's habits</h2>
          {habits.length > 0 && (
            <span className="text-xs font-medium text-ink-500 dark:text-ink-400">
              {completedCount}/{habits.length} done
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[68px] rounded-2xl bg-ink-100/60 dark:bg-ink-800/40 animate-pulse" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <EmptyState onAdd={() => setShowAddModal(true)} />
        ) : (
          <div className="space-y-2.5">
            {habits.map((habit) => (
              <HabitCard key={habit._id} habit={habit} onUpdate={handleUpdate} onBadgesEarned={handleBadgesEarned} />
            ))}
          </div>
        )}

        {allDone && (
          <div className="mt-4 rounded-2xl bg-moss-50 dark:bg-moss-900/20 border border-moss-200 dark:border-moss-800 px-4 py-3 text-center text-sm font-medium text-moss-700 dark:text-moss-300">
            🌿 All habits done for today. Well tended.
          </div>
        )}
      </div>

      {/* Mood check-in */}
      {habits.length > 0 && (
        <MoodCheckIn initialMood={todayMood} onLogged={setTodayMood} />
      )}

      {showAddModal && (
        <AddHabitModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            fetchData();
          }}
        />
      )}

      {newBadges.length > 0 && (
        <BadgeUnlockModal badges={newBadges} onClose={() => setNewBadges([])} />
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, sub }) => (
  <div className="rounded-2xl border border-ink-200/50 dark:border-ink-700/50 bg-white/70 dark:bg-ink-900/40 p-3.5 flex flex-col gap-1.5">
    <div className="flex items-center gap-1.5">{icon}<span className="text-[11px] text-ink-500 dark:text-ink-400 font-medium">{label}</span></div>
    <div className="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">{value}{sub && <span className="text-xs font-body font-normal text-ink-400 ml-1.5">{sub}</span>}</div>
  </div>
);

const EmptyState = ({ onAdd }) => (
  <div className="text-center py-12 px-6 rounded-2xl border-2 border-dashed border-ink-200 dark:border-ink-700">
    <div className="text-4xl mb-3">🌱</div>
    <h3 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100">Nothing planted yet</h3>
    <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 max-w-xs mx-auto">
      Add your first micro-habit — even one tiny daily ritual can grow into something lasting.
    </p>
    <button
      onClick={onAdd}
      className="mt-4 px-5 py-2 rounded-full bg-moss-600 hover:bg-moss-700 text-white text-sm font-medium"
    >
      Plant a habit
    </button>
  </div>
);

export default DashboardPage;
