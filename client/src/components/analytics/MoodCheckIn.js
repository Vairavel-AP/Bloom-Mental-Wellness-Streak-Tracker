import React, { useState } from 'react';
import api from '../../utils/api';

const MOODS = [
  { value: 1, emoji: '😔', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '🙂', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

const MoodCheckIn = ({ initialMood, onLogged }) => {
  const [selected, setSelected] = useState(initialMood || null);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (value) => {
    setSelected(value);
    setSaving(true);
    try {
      await api.post('/logs/mood', { mood: value });
      onLogged?.(value);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ink-200/50 dark:border-ink-700/50 bg-white/70 dark:bg-ink-900/40 p-4">
      <div className="text-sm font-medium text-ink-700 dark:text-ink-200 mb-3">How are you feeling today?</div>
      <div className="flex justify-between gap-1">
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => handleSelect(m.value)}
            disabled={saving}
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
              selected === m.value ? 'bg-sun/15 scale-105' : 'hover:bg-ink-100/60 dark:hover:bg-ink-800/40'
            }`}
            aria-label={m.label}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-[10px] text-ink-500 dark:text-ink-400">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodCheckIn;
