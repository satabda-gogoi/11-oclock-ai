import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // theme choice can be: 'light', 'dark', 'system'
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
    return "system"; // Default to 'system' auto-detection on first visit
  });

  // Resolved darkMode boolean that components use for coloring
  const [darkMode, setDarkMode] = useState(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return theme === "dark";
  });

  // Update resolved theme whenever theme choice or system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const updateTheme = () => {
      if (theme === "system") {
        setDarkMode(mediaQuery.matches);
      } else {
        setDarkMode(theme === "dark");
      }
    };

    updateTheme();

    // Listen for OS system theme changes
    const listener = (e) => {
      if (theme === "system") {
        setDarkMode(e.matches);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", listener);
    } else {
      mediaQuery.addListener(listener);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", listener);
      } else {
        mediaQuery.removeListener(listener);
      }
    };
  }, [theme]);

  // Apply the resolved class to HTML document tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Exposed wrapper function to change theme and save to localStorage
  const setTheme = (newTheme) => {
    if (newTheme === "light" || newTheme === "dark" || newTheme === "system") {
      setThemeState(newTheme);
      localStorage.setItem("theme", newTheme);
    }
  };

  // Compatibility helper: toggleTheme (toggles manual selection)
  const toggleTheme = () => {
    setTheme(darkMode ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      darkMode, 
      setDarkMode: toggleTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for faster semantic usage across files
export const useTheme = () => useContext(ThemeContext);