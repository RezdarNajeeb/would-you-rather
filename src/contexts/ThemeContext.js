import React, { createContext, useState, useEffect } from "react";

// Create context
export const ThemeContext = createContext();

// Define theme constants
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

// Color schemes for light and dark modes
export const themeColors = {
  [THEMES.LIGHT]: {
    primary: "#8b5cf6",
    secondary: "#ec4899",
    accent: "#06b6d4",
    background: "#f9fafb",
    cardBg: "#ffffff",
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
  },
  [THEMES.DARK]: {
    primary: "#a78bfa",
    secondary: "#f472b6",
    accent: "#22d3ee",
    background: "#111827",
    cardBg: "#1f2937",
    textPrimary: "#f9fafb",
    textSecondary: "#d1d5db",
  },
};

const ThemeProvider = ({ children }) => {
  // Get saved theme from localStorage or use light as default
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || THEMES.LIGHT;
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme);

    // Apply theme colors to CSS variables
    Object.entries(themeColors[theme]).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });

    // Add data-theme attribute to document for additional CSS selectors
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
