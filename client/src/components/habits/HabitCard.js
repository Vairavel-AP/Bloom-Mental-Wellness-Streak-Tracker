import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Snowflake, Minus, Plus, Bell } from 'lucide-react';
import api from '../../utils/api';

const fireConfetti = (color) => {
  confetti({
    particleCount: 60,
    spread: 65,
    startVelocity: 28,
    origin: { y: 0.7 },
    colors: [color, '#87a854', '#e0a72e', '#d6577a'],
    scalar: 0.85,
    ticks: 180,
  });
};

const HabitCard = ({ habit, onUpdate, onBadgesEarned }) => {
  const [busy, setBusy] = useState(false);
  const [localProgress, setLocalProgress] = useState(habit.todayLog?.partialProgress || 0);

  const completed = habit.completedToday;

  const toggleComplete = async () => {
    if (busy || habit.isPartial) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/logs/complete/${habit._id}`);
      if (data.action === 'completed') {
        fireConfetti(habit.color);
      }
      onUpdate();
      if (data.newBadges?.length) onBadgesEarned(data.newBadges);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const adjustPartial = async (delta) => {
    if (busy) return;
    const next = Math.max(0, Math.min(habit.totalUnits, localProgress + delta));
    setLocalProgress(next);
    setBusy(true);
    try {
      const { data } = await api.post(`/logs/partial/${habit._id}`, { progress: next });
      if (data.isComplete && !completed) fireConfetti(habit.color);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border p-4 transition-all duration-200 ${
        completed
          ? 'bg-moss-50/80 dark:bg-moss-900/20 border-moss-300/60 dark:border-moss-700/50'
          : 'bg-white/70 dark:bg-ink-900/40 border-ink-200/50 dark:border-ink-700/50 hover:border-ink-300 dark:hover:border-ink-600'
      }`}
    >
      <div className="flex items-center gap-3.5">
        {!habit.isPartial ? (
          <button
            onClick={toggleComplete}
            disabled={busy}
            aria-label={completed ? `Mark ${habit.name} as not done` : `Mark ${habit.name} as done`}
            className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all duration-200 ${
              completed
                ? 'animate-sprout scale-100'
                : 'hover:scale-105 active:scale-95'
            }`}
            style={{
              backgroundColor: completed ? habit.color : `${habit.color}22`,
              border: `2px solid ${habit.color}`,
            }}
          >
            <span style={{ filter: completed ? 'none' : 'opacity(0.55)' }}>{habit.icon}</span>
          </button>
        ) : (
          <div
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl"
            style={{ backgroundColor: `${habit.color}22`, border: `2px solid ${habit.color}` }}
          >
            {habit.icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm truncate ${completed ? 'text-moss-800 dark:text-moss-200' : 'text-ink-800 dark:text-ink-100'}`}>
              {habit.name}
            </span>
            {habit.reminderEnabled && (
              <Bell size={11} className="text-ink-400 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {habit.currentStreak > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-clay-600 dark:text-clay-400 font-medium">
                <Flame size={12} fill="currentColor" /> {habit.currentStreak} day{habit.currentStreak !== 1 ? 's' : ''}
              </span>
            )}
            {habit.streakFreezeUsed && (
              <span className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400">
                <Snowflake size={12} /> freeze used
              </span>
            )}
          </div>
        </div>

        {habit.isPartial && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => adjustPartial(-1)}
              disabled={busy || localProgress <= 0}
              className="w-7 h-7 rounded-full border border-ink-300 dark:border-ink-600 flex items-center justify-center disabled:opacity-30 hover:bg-ink-100 dark:hover:bg-ink-800"
              aria-label={`Decrease ${habit.name} progress`}
            >
              <Minus size={13} />
            </button>
            <span className="text-xs font-mono w-12 text-center text-ink-600 dark:text-ink-300">
              {localProgress}/{habit.totalUnits}
            </span>
            <button
              onClick={() => adjustPartial(1)}
              disabled={busy || localProgress >= habit.totalUnits}
              className="w-7 h-7 rounded-full border border-ink-300 dark:border-ink-600 flex items-center justify-center disabled:opacity-30 hover:bg-ink-100 dark:hover:bg-ink-800"
              aria-label={`Increase ${habit.name} progress`}
            >
              <Plus size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitCard;
