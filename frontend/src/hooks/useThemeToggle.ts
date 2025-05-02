// src/hooks/useThemeToggle.ts
import { useEffect, useState } from "react";

const THEME_KEY = "theme_preference";

export type ThemeMode = "light" | "dark";

export function useThemeToggle(): [ThemeMode, () => void] {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute("data-theme", storedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return [theme, toggleTheme];
}
