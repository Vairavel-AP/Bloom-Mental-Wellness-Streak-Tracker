import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../utils/api';
import WeeklyReviewForm from '../components/analytics/WeeklyReviewForm';

const AnalyticsPage = () => {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [successRate, setSuccessRate] = useState(null);
  const [period, setPeriod] = useState(30);
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/habits').then(({ data }) => {
      setHabits(data.habits);
      if (data.habits.length > 0) setSelectedHabit(data.habits[0]._id);
    });
    api.get('/analytics/mood-correlation', { params: { days: 30 } }).then(({ data }) => {
      setMoodData(data.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedHabit) return;
    api.get(`/analytics/success-rate/${selectedHabit}`, { params: { days: period } })
      .then(({ data }) => setSuccessRate(data));
  }, [selectedHabit, period]);

  const chartData = moodData.map((d) => ({
    date: d.date.slice(5),
    completion: d.completionRate,
    mood: d.avgMood,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">Your growth</h1>
        <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">Patterns worth noticing, in your own data.</p>
      </div>

      {/* Success rate */}
      <section className="rounded-2xl border border-ink-200/50 dark:border-ink-700/50 bg-white/70 dark:bg-ink-900/40 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100">Success rate</h2>
          <div className="flex gap-2">
            <select
              value={selectedHabit || ''}
              onChange={(e) => setSelectedHabit(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border border-ink-300/50 dark:border-ink-600/50 bg-white/60 dark:bg-ink-800/40"
            >
              {habits.map((h) => <option key={h._id} value={h._id}>{h.icon} {h.name}</option>)}
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="text-sm px-3 py-1.5 rounded-lg border border-ink-300/50 dark:border-ink-600/50 bg-white/60 dark:bg-ink-800/40"
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </div>

        {successRate && (
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-ink-100 dark:text-ink-800" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="#6b8c3c" strokeWidth="10"
                  strokeDasharray={`${(successRate.successRate / 100) * 264} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
                {successRate.successRate}%
              </div>
            </div>
            <div className="text-sm text-ink-600 dark:text-ink-300">
              Completed <span className="font-semibold text-moss-700 dark:text-moss-400">{successRate.completedDays}</span> out of{' '}
              <span className="font-semibold">{successRate.totalDays}</span> days
            </div>
          </div>
        )}
      </section>

      {/* Mood correlation */}
      <section className="rounded-2xl border border-ink-200/50 dark:border-ink-700/50 bg-white/70 dark:bg-ink-900/40 p-5">
        <h2 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100 mb-1">Mood &amp; consistency</h2>
        <p className="text-xs text-ink-500 dark:text-ink-400 mb-4">How your daily completion rate tracks alongside your mood, last 30 days.</p>
        {loading ? (
          <div className="h-56 rounded-xl bg-ink-100/60 dark:bg-ink-800/40 animate-pulse" />
        ) : chartData.length === 0 ? (
          <div className="text-center text-sm text-ink-400 py-12">Log a few mood check-ins to see your trend here.</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1cfc3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#8a846d" />
              <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#87a854" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} tick={{ fontSize: 11 }} stroke="#d6577a" />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #d1cfc3' }} />
              <Line yAxisId="left" type="monotone" dataKey="completion" stroke="#6b8c3c" strokeWidth={2} dot={false} name="Completion %" />
              <Line yAxisId="right" type="monotone" dataKey="mood" stroke="#d6577a" strokeWidth={2} dot={{ r: 3 }} name="Avg mood" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Weekly review */}
      <WeeklyReviewForm />
    </div>
  );
};

export default AnalyticsPage;
