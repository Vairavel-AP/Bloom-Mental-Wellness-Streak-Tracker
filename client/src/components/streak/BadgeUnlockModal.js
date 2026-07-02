import React, { useState } from 'react';

const BadgeUnlockModal = ({ badges, onClose }) => {
  const [index, setIndex] = useState(0);
  if (!badges || badges.length === 0) return null;
  const badge = badges[index];

  const handleNext = () => {
    if (index < badges.length - 1) {
      setIndex(index + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-sm px-5" onClick={handleNext}>
      <div
        className="bg-[#fbf6f1] dark:bg-ink-900 rounded-2xl p-8 max-w-xs w-full text-center shadow-2xl border border-sun/30 animate-sprout"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-3">{badge.icon}</div>
        <div className="text-xs uppercase tracking-widest text-sun font-semibold mb-1">Badge unlocked</div>
        <div className="font-display text-2xl font-semibold text-ink-900 dark:text-ink-50">{badge.name}</div>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-2">{badge.description}</p>
        <button
          onClick={handleNext}
          className="mt-6 px-6 py-2 rounded-lg bg-moss-600 hover:bg-moss-700 text-white text-sm font-medium"
        >
          {index < badges.length - 1 ? 'Next badge' : 'Nice!'}
        </button>
      </div>
    </div>
  );
};

export default BadgeUnlockModal;
