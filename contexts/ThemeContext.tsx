import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: typeof Colors.light | typeof Colors.dark;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme() as 'light' | 'dark';
  const [theme, setTheme] = useState<'light' | 'dark'>(systemColorScheme || 'light');

  // Update theme if system theme changes
  useEffect(() => {
    setTheme(systemColorScheme || 'light');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const colors = Colors[theme];

  const value = {
    theme,
    toggleTheme,
    colors,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 