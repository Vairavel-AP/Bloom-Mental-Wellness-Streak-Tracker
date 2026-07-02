import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const BadgesPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/badges/me').then(({ data }) => {
      setData(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="h-64 rounded-2xl bg-ink-100/60 dark:bg-ink-800/40 animate-pulse" />;
  }

  const xpProgress = data ? Math.min(100, Math.round(((data.xp % 100) / 100) * 100)) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">Badges</h1>
        <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">Milestones earned through consistency.</p>
      </div>

      {/* Level progress */}
      <section className="rounded-2xl border border-ink-200/50 dark:border-ink-700/50 bg-white/70 dark:bg-ink-900/40 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100">Level {data.level}</span>
          <span className="text-xs text-ink-500 dark:text-ink-400">{data.xpToNextLevel} XP to next level</span>
        </div>
        <div className="h-2.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-moss-400 to-moss-600 rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
        </div>
      </section>

      {/* Earned badges */}
      <section>
        <h2 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100 mb-3">
          Earned ({data.earned.length})
        </h2>
        {data.earned.length === 0 ? (
          <p className="text-sm text-ink-400">No badges yet. Build a 7-day streak to earn your first.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.earned.map((b) => (
              <div key={b.badgeId} className="rounded-2xl border border-sun/30 bg-sun/5 dark:bg-sun/10 p-4 text-center">
                <div className="text-3xl mb-1.5">{b.icon}</div>
                <div className="text-sm font-semibold text-ink-800 dark:text-ink-100">{b.name}</div>
                <div className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">{b.description}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Locked badges */}
      <section>
        <h2 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100 mb-3">
          Still to unlock ({data.locked.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {data.locked.map((b) => (
            <div key={b.id} className="rounded-2xl border border-ink-200/50 dark:border-ink-700/50 p-4 text-center opacity-60">
              <div className="text-3xl mb-1.5 grayscale">{b.icon}</div>
              <div className="text-sm font-semibold text-ink-700 dark:text-ink-300">{b.name}</div>
              <div className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">{b.description}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BadgesPage;
