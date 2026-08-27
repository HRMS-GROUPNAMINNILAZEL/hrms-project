import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    sidebarBg: '#182232',
    sidebarText: '#94a3b8',
    sidebarHover: '#1f2d42',
    sidebarActive: '#24324a',
    tableHeaderBg: '#f8fafc',
    inputBg: '#ffffff',
    inputBorder: '#cbd5e1',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryText: '#ffffff',
  },
  dark: {
    bg: '#090d16',          // Deep, rich midnight blue background
    cardBg: '#131d2e',      // Modern slate-blue card container
    text: '#f8fafc',        // Crisp clean white for main titles
    textMuted: '#94a3b8',   // Soft steel blue for secondary text
    border: '#1e293b',      // Elegant subtle navy-slate borders
    sidebarBg: '#05080f',   // Darker shade for sidebar depth
    sidebarText: '#94a3b8',
    sidebarHover: '#131d2e',
    sidebarActive: '#2563eb', // Vibrant professional blue active state
    tableHeaderBg: '#0f172a',
    inputBg: '#090d16',
    inputBorder: '#334155',   // Clean border definition for input fields
    primary: '#3b82f6',      // Modern electric blue button
    primaryHover: '#2563eb', // Rich dark royal blue hover
    primaryText: '#ffffff',  // High-contrast clean white button text
  }
};

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('hrms_theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('hrms_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const theme = isDarkMode ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);