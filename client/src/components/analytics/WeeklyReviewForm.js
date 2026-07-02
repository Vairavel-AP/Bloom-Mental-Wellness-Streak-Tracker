import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import api from '../../utils/api';

const isSunday = () => new Date().getDay() === 0;

const WeeklyReviewForm = () => {
  const [form, setForm] = useState({ wentWell: '', challenges: '', rating: 3 });
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    api.get('/analytics/weekly-reviews').then(({ data }) => setHistory(data.reviews));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/analytics/weekly-review', form);
    setSaved(true);
    const { data } = await api.get('/analytics/weekly-reviews');
    setHistory(data.reviews);
  };

  return (
    <section className="rounded-2xl border border-ink-200/50 dark:border-ink-700/50 bg-white/70 dark:bg-ink-900/40 p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100">Weekly reflection</h2>
        {isSunday() && <span className="text-[10px] uppercase tracking-wide font-semibold text-sun bg-sun/10 px-2 py-0.5 rounded-full">It's Sunday</span>}
      </div>
      <p className="text-xs text-ink-500 dark:text-ink-400 mb-4">A brief check-in with yourself. Takes two minutes.</p>

      {saved ? (
        <div className="flex items-center gap-2 text-moss-700 dark:text-moss-400 text-sm py-4">
          <Check size={16} /> Saved. See you next week.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1">What went well this week?</label>
            <textarea
              value={form.wentWell}
              onChange={(e) => setForm({ ...form, wentWell: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-ink-300/50 dark:border-ink-600/50 bg-white/60 dark:bg-ink-800/40 text-sm resize-none"
              placeholder="Even small wins count…"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1">What felt challenging?</label>
            <textarea
              value={form.challenges}
              onChange={(e) => setForm({ ...form, challenges: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-ink-300/50 dark:border-ink-600/50 bg-white/60 dark:bg-ink-800/40 text-sm resize-none"
              placeholder="No judgment, just noticing…"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-2">Overall, how was your week?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setForm({ ...form, rating: r })}
                  className={`w-9 h-9 rounded-full text-sm font-medium border-2 transition-colors ${
                    form.rating === r ? 'border-moss-500 bg-moss-100 dark:bg-moss-900/40 text-moss-800 dark:text-moss-200' : 'border-ink-200 dark:border-ink-700 text-ink-500 dark:text-ink-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="px-5 py-2 rounded-lg bg-moss-600 hover:bg-moss-700 text-white text-sm font-medium">
            Save reflection
          </button>
        </form>
      )}

      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-ink-100 dark:border-ink-700">
          <button onClick={() => setShowHistory((s) => !s)} className="text-xs font-medium text-moss-700 dark:text-moss-400">
            {showHistory ? 'Hide' : 'View'} past reflections ({history.length})
          </button>
          {showHistory && (
            <div className="mt-3 space-y-2">
              {history.map((r) => (
                <div key={r.week} className="text-xs bg-ink-50 dark:bg-ink-800/40 rounded-lg p-3">
                  <div className="font-semibold text-ink-700 dark:text-ink-200">{r.week} · rated {r.rating}/5</div>
                  {r.wentWell && <div className="text-ink-500 dark:text-ink-400 mt-1">✓ {r.wentWell}</div>}
                  {r.challenges && <div className="text-ink-500 dark:text-ink-400">△ {r.challenges}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default WeeklyReviewForm;
