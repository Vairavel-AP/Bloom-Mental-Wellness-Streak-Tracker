import React, { useState, useEffect } from 'react';
import { Trash2, Bell, BellOff, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';
import AddHabitModal from '../components/habits/AddHabitModal';
import CalendarView from '../components/analytics/CalendarView';

const HabitsPage = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchHabits = async () => {
    try {
      const { data } = await api.get('/habits');
      setHabits(data.habits);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this habit? Your history will be kept but it will no longer appear on your dashboard.')) return;
    await api.delete(`/habits/${id}`);
    fetchHabits();
  };

  const toggleReminder = async (habit) => {
    const reminderEnabled = !habit.reminderEnabled;
    await api.put(`/habits/${habit._id}`, {
      reminderEnabled,
      reminderTime: reminderEnabled ? (habit.reminderTime || '09:00') : habit.reminderTime,
    });
    fetchHabits();
  };

  const updateReminderTime = async (habit, time) => {
    await api.put(`/habits/${habit._id}`, { reminderTime: time, reminderEnabled: true });
    fetchHabits();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">Your habits</h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">Manage, tweak, and review what you're growing.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-moss-600 hover:bg-moss-700 text-white text-sm font-medium"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-ink-100/60 dark:bg-ink-800/40 animate-pulse" />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12 text-ink-500 dark:text-ink-400 text-sm">No habits yet. Add your first one above.</div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const expanded = expandedId === habit._id;
            return (
              <div key={habit._id} className="rounded-2xl border border-ink-200/50 dark:border-ink-700/50 bg-white/70 dark:bg-ink-900/40 overflow-hidden">
                <div className="p-4 flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: `${habit.color}22`, border: `2px solid ${habit.color}` }}
                  >
                    {habit.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-ink-800 dark:text-ink-100">{habit.name}</div>
                    <div className="text-xs text-ink-500 dark:text-ink-400">
                      🔥 {habit.currentStreak}d current · 🏆 {habit.longestStreak}d best · {habit.totalCompletions} total
                    </div>
                  </div>
                  <button
                    onClick={() => toggleReminder(habit)}
                    className="p-2 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500 dark:text-ink-400"
                    aria-label={habit.reminderEnabled ? 'Disable reminder' : 'Enable reminder'}
                  >
                    {habit.reminderEnabled ? <Bell size={16} className="text-moss-600" /> : <BellOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(habit._id)}
                    className="p-2 rounded-full hover:bg-clay-50 dark:hover:bg-clay-900/30 text-ink-400 hover:text-clay-600"
                    aria-label="Delete habit"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setExpandedId(expanded ? null : habit._id)}
                    className="p-2 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500 dark:text-ink-400"
                    aria-label="Toggle details"
                  >
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {expanded && (
                  <div className="px-4 pb-4 border-t border-ink-100 dark:border-ink-700 pt-4 space-y-4">
                    {habit.reminderEnabled && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Remind me at</label>
                        <input
                          type="time"
                          value={habit.reminderTime || '09:00'}
                          onChange={(e) => updateReminderTime(habit, e.target.value)}
                          className="px-2 py-1 rounded-lg border border-ink-300/50 dark:border-ink-600/50 bg-white/60 dark:bg-ink-800/40 text-sm"
                        />
                      </div>
                    )}
                    <CalendarView habitId={habit._id} color={habit.color} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddHabitModal onClose={() => setShowAddModal(false)} onCreated={() => { setShowAddModal(false); fetchHabits(); }} />
      )}
    </div>
  );
};

export default HabitsPage;
