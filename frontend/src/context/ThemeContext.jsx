import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    bg: '#f5f5f0',
    cardBg: '#ffffff',
    text: '#1a1a1a',
    textMuted: '#71717a',
    textSecondary: '#a1a1aa',
    border: '#e4e4e7',
    sidebarBg: '#ffffff',
    sidebarText: '#71717a',
    sidebarHover: '#f4f4f5',
    sidebarActive: '#ecfccb',
    sidebarActiveText: '#3f6212',
    tableHeaderBg: '#fafafa',
    inputBg: '#f4f4f5',
    inputBorder: '#d4d4d8',
    primary: '#84cc16',
    primaryHover: '#65a30d',
    primaryText: '#1a1a1a',
    accent: '#84cc16',
    accentBg: 'rgba(132, 204, 22, 0.08)',
    dangerBg: '#fef2f2',
    dangerBorder: '#fecaca',
    dangerText: '#dc2626',
    successBg: '#f0fdf4',
    successBorder: '#bbf7d0',
    successText: '#16a34a',
    warningBg: '#fffbeb',
    warningBorder: '#fde68a',
    warningText: '#d97706',
    chartGrid: '#e4e4e7',
    statIcon1: '#84cc16', // green
    statIcon2: '#3b82f6', // blue
    statIcon3: '#a855f7', // purple
    statIcon4: '#f59e0b', // amber
  },
  dark: {
    bg: '#09090b',
    cardBg: '#18181b',
    text: '#fafafa',
    textMuted: '#71717a',
    textSecondary: '#52525b',
    border: '#27272a',
    sidebarBg: '#0f0f12',
    sidebarText: '#a1a1aa',
    sidebarHover: 'rgba(132, 204, 22, 0.06)',
    sidebarActive: 'rgba(132, 204, 22, 0.12)',
    sidebarActiveText: '#a3e635',
    tableHeaderBg: '#1f1f23',
    inputBg: '#27272a',
    inputBorder: '#3f3f46',
    primary: '#84cc16',
    primaryHover: '#65a30d',
    primaryText: '#09090b',
    accent: '#a3e635',
    accentBg: 'rgba(163, 230, 53, 0.08)',
    dangerBg: 'rgba(239, 68, 68, 0.1)',
    dangerBorder: '#7f1d1d',
    dangerText: '#fca5a5',
    successBg: 'rgba(34, 197, 94, 0.1)',
    successBorder: '#166534',
    successText: '#86efac',
    warningBg: 'rgba(245, 158, 11, 0.1)',
    warningBorder: '#92400e',
    warningText: '#fcd34d',
    chartGrid: '#27272a',
    statIcon1: '#84cc16',
    statIcon2: '#3b82f6',
    statIcon3: '#a855f7',
    statIcon4: '#f59e0b',
  }
};

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('hrms_theme');
    return stored ? stored === 'dark' : true; // Default to dark
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