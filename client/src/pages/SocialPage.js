import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, Trophy } from 'lucide-react';
import api from '../utils/api';

const NUDGE_EMOJIS = ['👋', '💪', '🔥', '🌟', '🌱'];

const SocialPage = () => {
  const [buddies, setBuddies] = useState([]);
  const [requests, setRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState('buddies');
  const [actionMsg, setActionMsg] = useState('');

  const loadAll = async () => {
    const [buddiesRes, requestsRes, leaderboardRes] = await Promise.all([
      api.get('/social/buddies'),
      api.get('/social/requests'),
      api.get('/social/leaderboard'),
    ]);
    setBuddies(buddiesRes.data.buddies);
    setRequests(requestsRes.data.requests);
    setLeaderboard(leaderboardRes.data.leaderboard);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    setSearching(true);
    try {
      const { data } = await api.get('/social/search', { params: { email: searchEmail } });
      setSearchResult(data.user);
    } catch (err) {
      setSearchError(err.response?.data?.message || 'No user found');
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (userId) => {
    await api.post(`/social/request/${userId}`);
    setActionMsg('Buddy request sent!');
    setSearchResult(null);
    setSearchEmail('');
    setTimeout(() => setActionMsg(''), 3000);
  };

  const respondRequest = async (fromUserId, accept) => {
    await api.post(`/social/respond/${fromUserId}`, { accept });
    loadAll();
  };

  const sendNudge = async (buddyId, emoji) => {
    await api.post(`/social/nudge/${buddyId}`, { emoji });
    setActionMsg('Nudge sent! 🎉');
    setTimeout(() => setActionMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">Buddies</h1>
        <p className="text-ink-500 dark:text-ink-400 text-sm mt-1">Habits stick better when someone's cheering you on.</p>
      </div>

      {actionMsg && (
        <div className="rounded-lg bg-moss-50 dark:bg-moss-900/30 border border-moss-200 dark:border-moss-800 px-4 py-2 text-sm text-moss-700 dark:text-moss-300">
          {actionMsg}
        </div>
      )}

      {/* Add buddy search */}
      <section className="rounded-2xl border border-ink-200/50 dark:border-ink-700/50 bg-white/70 dark:bg-ink-900/40 p-5">
        <h2 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-100 mb-3">Add a buddy</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Their email address"
            className="flex-1 px-3 py-2 rounded-lg border border-ink-300/50 dark:border-ink-600/50 bg-white/60 dark:bg-ink-800/40 text-sm"
          />
          <button type="submit" disabled={searching} className="px-4 py-2 rounded-lg bg-moss-600 hover:bg-moss-700 text-white text-sm font-medium flex items-center gap-1.5">
            <Search size={14} /> Find
          </button>
        </form>
        {searchError && <p className="text-xs text-clay-600 dark:text-clay-400 mt-2">{searchError}</p>}
        {searchResult && (
          <div className="mt-3 flex items-center justify-between bg-ink-50 dark:bg-ink-800/40 rounded-lg p-3">
            <div className="text-sm font-medium text-ink-800 dark:text-ink-100">{searchResult.name}</div>
            <button onClick={() => sendRequest(searchResult._id)} className="flex items-center gap-1 text-xs font-medium text-moss-700 dark:text-moss-400">
              <UserPlus size={14} /> Send request
            </button>
          </div>
        )}
      </section>

      {/* Pending requests */}
      {requests.length > 0 && (
        <section className="rounded-2xl border border-sun/30 bg-sun/5 dark:bg-sun/10 p-5">
          <h2 className="font-display text-base font-semibold text-ink-800 dark:text-ink-100 mb-3">
            Pending requests ({requests.length})
          </h2>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r._id} className="flex items-center justify-between bg-white/60 dark:bg-ink-800/40 rounded-lg p-3">
                <span className="text-sm font-medium text-ink-800 dark:text-ink-100">{r.from?.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => respondRequest(r.from._id, true)} className="p-1.5 rounded-full bg-moss-100 dark:bg-moss-900/40 text-moss-700 dark:text-moss-300" aria-label="Accept">
                    <Check size={14} />
                  </button>
                  <button onClick={() => respondRequest(r.from._id, false)} className="p-1.5 rounded-full bg-clay-100 dark:bg-clay-900/30 text-clay-700 dark:text-clay-300" aria-label="Decline">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-1">
        {['buddies', 'leaderboard'].map((t) => (
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

      {tab === 'buddies' ? (
        buddies.length === 0 ? (
          <p className="text-sm text-ink-400 py-8 text-center">No buddies yet. Search by email to add one.</p>
        ) : (
          <div className="space-y-2.5">
            {buddies.map((b) => (
              <div key={b._id} className="rounded-2xl border border-ink-200/50 dark:border-ink-700/50 bg-white/70 dark:bg-ink-900/40 p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-moss-500 text-white flex items-center justify-center font-display font-semibold shrink-0">
                  {b.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-800 dark:text-ink-100">{b.name}</div>
                  <div className="text-xs text-ink-500 dark:text-ink-400">
                    🔥 {b.globalStreak}d streak · Level {b.level}
                  </div>
                </div>
                {b.completedToday ? (
                  <span className="text-xs font-medium text-moss-600 dark:text-moss-400">Active today</span>
                ) : (
                  <div className="flex gap-1">
                    {NUDGE_EMOJIS.slice(0, 3).map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => sendNudge(b._id, emoji)}
                        className="w-8 h-8 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center justify-center text-base"
                        aria-label={`Nudge with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-ink-200/50 dark:border-ink-700/50 bg-white/70 dark:bg-ink-900/40 overflow-hidden">
          {leaderboard.map((u, i) => (
            <div key={u._id} className={`flex items-center gap-3 px-4 py-3 ${i !== leaderboard.length - 1 ? 'border-b border-ink-100 dark:border-ink-700' : ''}`}>
              <div className="w-6 text-center font-display font-semibold text-ink-400">
                {i === 0 ? <Trophy size={16} className="text-sun mx-auto" /> : i + 1}
              </div>
              <div className="flex-1 text-sm font-medium text-ink-800 dark:text-ink-100">{u.name}</div>
              <div className="text-xs text-ink-500 dark:text-ink-400">Lvl {u.level}</div>
              <div className="text-sm font-semibold text-clay-600 dark:text-clay-400">🔥 {u.globalStreak}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialPage;
