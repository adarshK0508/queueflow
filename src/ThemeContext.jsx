import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage to remember choice, default to TRUE (Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('appTheme');
    return savedTheme ? JSON.parse(savedTheme) : true;
  });

  // Save to localStorage whenever theme changes
  useEffect(() => {
    localStorage.setItem('appTheme', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);