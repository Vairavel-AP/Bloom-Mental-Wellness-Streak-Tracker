import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sprout, BarChart3, Award, Users, Settings, LogOut, Moon, Sun, Bell, Menu, X
} from 'lucide-react';
import api from '../../utils/api';

const NAV_ITEMS = [
  { to: '/', label: 'Today', icon: Sprout, end: true },
  { to: '/analytics', label: 'Growth', icon: BarChart3 },
  { to: '/badges', label: 'Badges', icon: Award },
  { to: '/social', label: 'Buddies', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#f6f3eb] dark:bg-[#1a1812] text-ink-900 dark:text-ink-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-ink-200/40 dark:border-ink-700/40 px-6 py-8 shrink-0">
        <Logo />
        <nav className="mt-10 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg font-body text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-moss-100 dark:bg-moss-900/40 text-moss-800 dark:text-moss-200'
                    : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100/60 dark:hover:bg-ink-800/40'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <UserSummary user={user} />
          <div className="flex gap-2">
            <button
              onClick={toggleDarkMode}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-ink-600 dark:text-ink-300 hover:bg-ink-100/60 dark:hover:bg-ink-800/40 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              {darkMode ? 'Light' : 'Dark'}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-ink-600 dark:text-ink-300 hover:bg-clay-100/60 dark:hover:bg-clay-900/30 transition-colors"
            >
              <LogOut size={15} />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 bg-[#f6f3eb]/95 dark:bg-[#1a1812]/95 backdrop-blur-sm border-b border-ink-200/40 dark:border-ink-700/40">
        <Logo compact />
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotifs((s) => !s)} className="relative p-2 rounded-full hover:bg-ink-100/60 dark:hover:bg-ink-800/40" aria-label="Notifications">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-clay-500" />
            )}
          </button>
          <button onClick={() => setMobileOpen((s) => !s)} className="p-2 rounded-full hover:bg-ink-100/60 dark:hover:bg-ink-800/40" aria-label="Menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-[#f6f3eb] dark:bg-[#1a1812] pt-16 px-6">
          <nav className="flex flex-col gap-1 mt-4">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm font-medium ${
                    isActive ? 'bg-moss-100 dark:bg-moss-900/40 text-moss-800 dark:text-moss-200' : 'text-ink-600 dark:text-ink-300'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 flex gap-2">
            <button onClick={toggleDarkMode} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border border-ink-200 dark:border-ink-700">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />} {darkMode ? 'Light mode' : 'Dark mode'}
            </button>
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border border-clay-300 text-clay-700 dark:text-clay-300 dark:border-clay-700">
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      )}

      {/* Notification panel (desktop trigger lives in dashboard top bar; mobile uses bell) */}
      {showNotifs && (
        <div className="md:hidden fixed top-14 right-4 z-40 w-[calc(100%-2rem)] max-w-sm bg-white dark:bg-ink-900 rounded-xl shadow-xl border border-ink-200 dark:border-ink-700 max-h-96 overflow-y-auto">
          <NotifList notifications={notifications} onMarkAll={markAllRead} />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 md:pt-0 pt-16 pb-10">
        <div className="max-w-5xl mx-auto px-5 md:px-10 py-8">
          <Outlet context={{ notifications, unreadCount, markAllRead, refreshNotifications: fetchNotifications }} />
        </div>
      </main>
    </div>
  );
};

const Logo = ({ compact }) => (
  <div className="flex items-center gap-2.5">
    <SproutMark size={compact ? 26 : 32} />
    {!compact && (
      <div>
        <div className="font-display text-xl font-semibold leading-none text-ink-900 dark:text-ink-50">Bloom</div>
        <div className="text-[10px] uppercase tracking-widest text-ink-400 dark:text-ink-500 mt-0.5">wellness journal</div>
      </div>
    )}
  </div>
);

// Hand-drawn signature sprout mark — grows fuller as a visual metaphor for streaks
export const SproutMark = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <path d="M16 28V14" stroke="#516b2d" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M16 18C16 18 8 18 8 10C8 10 16 9 16 18Z"
      fill="#87a854"
      stroke="#516b2d"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M16 14C16 14 24 14 24 6C24 6 16 5 16 14Z"
      fill="#a8c179"
      stroke="#516b2d"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <ellipse cx="16" cy="29" rx="6" ry="1.5" fill="#516b2d" opacity="0.2" />
  </svg>
);

const UserSummary = ({ user }) => {
  if (!user) return null;
  return (
    <div className="rounded-xl bg-white/60 dark:bg-ink-800/40 border border-ink-200/50 dark:border-ink-700/50 p-3.5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-moss-500 text-white flex items-center justify-center font-display font-semibold text-sm">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate text-ink-800 dark:text-ink-100">{user.name}</div>
          <div className="text-[11px] text-ink-500 dark:text-ink-400">Level {user.level} · {user.xp} XP</div>
        </div>
      </div>
    </div>
  );
};

export const NotifList = ({ notifications, onMarkAll }) => (
  <div>
    <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-700">
      <span className="font-semibold text-sm">Notifications</span>
      <button onClick={onMarkAll} className="text-xs text-moss-600 dark:text-moss-400 font-medium">Mark all read</button>
    </div>
    {notifications.length === 0 ? (
      <div className="px-4 py-8 text-center text-sm text-ink-400">All caught up. No notifications yet.</div>
    ) : (
      <div className="divide-y divide-ink-100 dark:divide-ink-700">
        {notifications.slice(0, 15).map((n) => (
          <div key={n._id} className={`px-4 py-3 text-sm ${!n.read ? 'bg-moss-50/60 dark:bg-moss-900/20' : ''}`}>
            <div className="font-medium text-ink-800 dark:text-ink-100">{n.title}</div>
            <div className="text-ink-500 dark:text-ink-400 text-xs mt-0.5">{n.message}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Layout;
