import React, { useState } from 'react';
import { Check } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const TIMEZONES = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['UTC'];

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [form, setForm] = useState({
    name: user?.name || '',
    timezone: user?.timezone || 'UTC',
    notificationsEnabled: user?.notificationsEnabled ?? true,
    dailyQuoteEnabled: user?.dailyQuoteEnabled ?? true,
    silentHoursStart: user?.silentHoursStart || '22:00',
    silentHoursEnd: user?.silentHoursEnd || '07:00',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    const { data } = await api.put('/auth/profile', form);
    updateUser(data.user);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">Settings</h1>
        <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">Tend to the app the way you like.</p>
      </div>

      <Section title="Profile">
        <FieldRow label="Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input"
          />
        </FieldRow>
        <FieldRow label="Email">
          <input type="email" value={user?.email || ''} disabled className="input opacity-60" />
        </FieldRow>
        <FieldRow label="Timezone">
          <select
            value={form.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="input"
          >
            {TIMEZONES.slice(0, 200).map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </FieldRow>
      </Section>

      <Section title="Appearance">
        <ToggleRow
          label="Dark mode"
          description="A soothing dark theme for late-night journaling"
          checked={darkMode}
          onChange={toggleDarkMode}
        />
      </Section>

      <Section title="Notifications">
        <ToggleRow
          label="Push notifications"
          description="Reminders, streak alerts, and buddy nudges"
          checked={form.notificationsEnabled}
          onChange={(v) => handleChange('notificationsEnabled', v)}
        />
        <ToggleRow
          label="Daily affirmations"
          description="One motivational quote each morning"
          checked={form.dailyQuoteEnabled}
          onChange={(v) => handleChange('dailyQuoteEnabled', v)}
        />
        <FieldRow label="Silent hours start">
          <input
            type="time"
            value={form.silentHoursStart}
            onChange={(e) => handleChange('silentHoursStart', e.target.value)}
            className="input"
          />
        </FieldRow>
        <FieldRow label="Silent hours end">
          <input
            type="time"
            value={form.silentHoursEnd}
            onChange={(e) => handleChange('silentHoursEnd', e.target.value)}
            className="input"
          />
        </FieldRow>
        <p className="text-xs text-ink-400 dark:text-ink-500 -mt-1">No notifications will be sent during these hours.</p>
      </Section>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-moss-600 hover:bg-moss-700 text-white text-sm font-medium"
      >
        {saved ? <><Check size={15} /> Saved</> : 'Save changes'}
      </button>

      <style>{`.input { width: 100%; padding: 0.55rem 0.75rem; border-radius: 0.5rem; border: 1px solid rgba(170,165,150,0.4); background: rgba(255,255,255,0.6); font-size: 0.875rem; } .dark .input { background: rgba(40,38,32,0.6); border-color: rgba(90,84,68,0.5); color: #e8e7e1; }`}</style>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section className="rounded-2xl border border-ink-200/50 dark:border-ink-700/50 bg-white/70 dark:bg-ink-900/40 p-5 space-y-4">
    <h2 className="font-display text-base font-semibold text-ink-800 dark:text-ink-100">{title}</h2>
    {children}
  </section>
);

const FieldRow = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1.5">{label}</span>
    {children}
  </label>
);

const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <div className="text-sm font-medium text-ink-800 dark:text-ink-100">{label}</div>
      {description && <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`shrink-0 w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-moss-600' : 'bg-ink-300 dark:bg-ink-700'}`}
      aria-pressed={checked}
      aria-label={label}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  </div>
);

export default SettingsPage;
