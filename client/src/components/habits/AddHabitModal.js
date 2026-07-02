import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../utils/api';

const COLOR_OPTIONS = ['#7C3AED', '#2563EB', '#059669', '#0EA5E9', '#D97706', '#DB2777', '#EF4444', '#14B8A6', '#6366F1', '#78716C'];
const ICON_OPTIONS = ['⭐', '🌱', '🎯', '🧘', '📓', '🚶', '💧', '📚', '🙏', '😴', '💪', '🌬️', '📵', '🤸', '✨', '🎨', '🎵', '🍎'];

const AddHabitModal = ({ onClose, onCreated }) => {
  const [tab, setTab] = useState('presets');
  const [presets, setPresets] = useState([]);
  const [existingPresetIds, setExistingPresetIds] = useState([]);
  const [custom, setCustom] = useState({ name: '', icon: '⭐', color: COLOR_OPTIONS[0] });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/habits/presets').then(({ data }) => setPresets(data.presets));
    api.get('/habits').then(({ data }) => setExistingPresetIds(data.habits.filter(h => h.presetId).map(h => h.presetId)));
  }, []);

  const addPreset = async (preset) => {
    setCreating(true);
    try {
      await api.post('/habits', {
        name: preset.name,
        icon: preset.icon,
        color: preset.color,
        category: preset.category,
        isPreset: true,
        presetId: preset.id,
        isPartial: !!preset.isPartial,
        totalUnits: preset.totalUnits || null,
        unitLabel: preset.unitLabel || null,
      });
      onCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const addCustom = async () => {
    if (!custom.name.trim()) return;
    setCreating(true);
    try {
      await api.post('/habits', {
        name: custom.name.trim(),
        icon: custom.icon,
        color: custom.color,
        category: 'custom',
      });
      onCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-ink-950/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#fbf6f1] dark:bg-ink-900 rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl border border-ink-200/50 dark:border-ink-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#fbf6f1] dark:bg-ink-900 flex items-center justify-between px-5 py-4 border-b border-ink-200/50 dark:border-ink-700/50">
          <h2 className="font-display text-lg font-semibold">Add a habit</h2>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-4">
          {['presets', 'custom'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                tab === t ? 'bg-moss-600 text-white' : 'text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'presets' ? (
          <div className="grid grid-cols-2 gap-2.5 p-5">
            {presets.map((p) => {
              const added = existingPresetIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  disabled={added || creating}
                  onClick={() => addPreset(p)}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    added
                      ? 'opacity-40 border-ink-200 dark:border-ink-700 cursor-not-allowed'
                      : 'border-ink-200/60 dark:border-ink-700/60 hover:border-moss-400 hover:bg-moss-50/50 dark:hover:bg-moss-900/20'
                  }`}
                >
                  <div className="text-2xl mb-1">{p.icon}</div>
                  <div className="text-xs font-medium text-ink-800 dark:text-ink-100">{p.name}</div>
                  {added && <div className="text-[10px] text-moss-600 dark:text-moss-400 mt-1">Added</div>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1.5">Habit name</label>
              <input
                type="text"
                value={custom.name}
                onChange={(e) => setCustom({ ...custom, name: e.target.value })}
                placeholder="e.g. Call a friend"
                className="w-full px-3 py-2 rounded-lg border border-ink-300/50 dark:border-ink-600/50 bg-white/60 dark:bg-ink-800/40 text-sm"
                maxLength={60}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setCustom({ ...custom, icon })}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-colors ${
                      custom.icon === icon ? 'border-moss-500 bg-moss-50 dark:bg-moss-900/30' : 'border-transparent hover:bg-ink-100 dark:hover:bg-ink-800'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCustom({ ...custom, color })}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      custom.color === color ? 'scale-110 border-ink-900 dark:border-white' : 'border-transparent'
                    }`}
                    aria-label={`Choose color ${color}`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={addCustom}
              disabled={!custom.name.trim() || creating}
              className="w-full py-2.5 rounded-lg bg-moss-600 hover:bg-moss-700 disabled:opacity-50 text-white text-sm font-medium"
            >
              {creating ? 'Creating…' : 'Create habit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddHabitModal;
