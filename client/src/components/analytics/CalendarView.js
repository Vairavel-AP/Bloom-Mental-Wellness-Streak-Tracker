import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const CalendarView = ({ habitId, color }) => {
  const [date, setDate] = useState(new Date());
  const [calendar, setCalendar] = useState({});
  const [loading, setLoading] = useState(true);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  useEffect(() => {
    setLoading(true);
    api.get(`/logs/calendar/${habitId}`, { params: { year, month } })
      .then(({ data }) => setCalendar(data.calendar))
      .catch(() => setCalendar({}))
      .finally(() => setLoading(false));
  }, [habitId, year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const todayStr = new Date().toISOString().split('T')[0];

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr, data: calendar[dateStr] });
  }

  const changeMonth = (delta) => {
    setDate(new Date(year, month - 1 + delta, 1));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{MONTH_NAMES[month - 1]} {year}</span>
        <button onClick={() => changeMonth(1)} className="p-1.5 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Next month">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-[10px] text-ink-400 dark:text-ink-500 font-medium">{d}</div>
        ))}
        {cells.map((cell, idx) => {
          if (!cell) return <div key={idx} />;
          const isToday = cell.dateStr === todayStr;
          const completed = cell.data?.completed;
          return (
            <div
              key={idx}
              className={`aspect-square rounded-lg flex items-center justify-center text-[11px] relative ${
                isToday ? 'ring-1 ring-moss-500' : ''
              }`}
              style={{
                backgroundColor: completed ? `${color}cc` : 'transparent',
                color: completed ? 'white' : undefined,
              }}
            >
              <span className={completed ? 'font-semibold' : 'text-ink-400 dark:text-ink-500'}>{cell.day}</span>
              {cell.data?.mood && (
                <span className="absolute -bottom-0.5 -right-0.5 text-[8px]">
                  {['😔','😕','🙂','😊','😄'][cell.data.mood - 1]}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {loading && <div className="text-center text-xs text-ink-400 mt-2">Loading…</div>}
    </div>
  );
};

export default CalendarView;
