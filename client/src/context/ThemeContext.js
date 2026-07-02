import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('wellness_dark') === 'true'
  );

  useEffect(() => {
    if (user?.darkMode !== undefined) {
      setDarkMode(user.darkMode);
    }
  }, [user]);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('wellness_dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = async () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    try {
      await api.put('/auth/profile', { darkMode: newVal });
    } catch (err) {
      // silent fail, local state already updated
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
