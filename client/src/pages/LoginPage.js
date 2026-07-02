import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SproutMark } from "../components/layout/Layout";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not sign in. Check your details.",
      );
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL.replace("/api", "")}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f3eb] dark:bg-[#1a1812] px-5 relative overflow-hidden">
      <BackgroundSprigs />
      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <SproutMark size={44} className="animate-sway" />
          <h1 className="font-display text-3xl font-semibold mt-3 text-ink-900 dark:text-ink-50">
            Welcome back
          </h1>
          <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">
            Your habits have been waiting.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/70 dark:bg-ink-900/50 border border-ink-200/50 dark:border-ink-700/50 rounded-2xl p-6 space-y-4 backdrop-blur-sm"
        >
          {error && (
            <div className="text-sm text-clay-700 dark:text-clay-300 bg-clay-50 dark:bg-clay-900/30 border border-clay-200 dark:border-clay-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
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
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              placeholder="••••••••"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-moss-600 hover:bg-moss-700 disabled:opacity-60 text-white font-medium text-sm transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-200 dark:border-ink-700" />
            </div>
            <div className="relative flex justify-center text-xs text-ink-400">
              <span className="bg-white/70 dark:bg-ink-900/50 px-3">or</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-ink-300/50 dark:border-ink-600/50 bg-white/60 dark:bg-ink-800/40 text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-6">
          New here?{" "}
          <Link
            to="/register"
            className="text-moss-700 dark:text-moss-400 font-medium hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
      <style>{`.input-field { width: 100%; padding: 0.6rem 0.85rem; border-radius: 0.5rem; border: 1px solid rgba(170,165,150,0.4); background: rgba(255,255,255,0.6); font-size: 0.875rem; } .dark .input-field { background: rgba(40,38,32,0.6); border-color: rgba(90,84,68,0.5); color: #e8e7e1; }`}</style>
    </div>
  );
};

export const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1.5">
      {label}
    </span>
    {children}
  </label>
);

export const BackgroundSprigs = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.07] dark:opacity-[0.05]"
    preserveAspectRatio="none"
  >
    <defs>
      <pattern id="sprig" width="80" height="80" patternUnits="userSpaceOnUse">
        <path
          d="M10 70 L10 50 M10 50 C10 50 4 46 4 40 M10 50 C10 50 16 46 16 40"
          stroke="#516b2d"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#sprig)" />
  </svg>
);

export default LoginPage;
