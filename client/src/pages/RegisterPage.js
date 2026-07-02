import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SproutMark } from '../components/layout/Layout';
import { Field, BackgroundSprigs } from './LoginPage';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await register(form.name, form.email, form.password, timezone);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Could not create account.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f3eb] dark:bg-[#1a1812] px-5 relative overflow-hidden">
      <BackgroundSprigs />
      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <SproutMark size={44} className="animate-sway" />
          <h1 className="font-display text-3xl font-semibold mt-3 text-ink-900 dark:text-ink-50">Plant your first habit</h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1 text-center">Small, daily care. That's all it takes.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/70 dark:bg-ink-900/50 border border-ink-200/50 dark:border-ink-700/50 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
          {error && (
            <div className="text-sm text-clay-700 dark:text-clay-300 bg-clay-50 dark:bg-clay-900/30 border border-clay-200 dark:border-clay-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <Field label="Name">
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="Your name"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              placeholder="At least 6 characters"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-moss-600 hover:bg-moss-700 disabled:opacity-60 text-white font-medium text-sm transition-colors"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-6">
          Already growing things?{' '}
          <Link to="/login" className="text-moss-700 dark:text-moss-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      <style>{`.input-field { width: 100%; padding: 0.6rem 0.85rem; border-radius: 0.5rem; border: 1px solid rgba(170,165,150,0.4); background: rgba(255,255,255,0.6); font-size: 0.875rem; } .dark .input-field { background: rgba(40,38,32,0.6); border-color: rgba(90,84,68,0.5); color: #e8e7e1; }`}</style>
    </div>
  );
};

export default RegisterPage;
