import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export const THEMES = [
  {
    id: "light",
    name: "Studio Light",
    description: "Clean slate surfaces with a teal finance accent.",
    swatches: ["#f8fafc", "#0f766e", "#f59e0b"],
    isDark: false,
  },
  {
    id: "dark",
    name: "Midnight Slate",
    description: "High-contrast dark mode for late sessions.",
    swatches: ["#0b1020", "#2dd4bf", "#fbbf24"],
    isDark: true,
  },
  {
    id: "emerald",
    name: "Emerald Ledger",
    description: "Fresh green tones for savings-first workflows.",
    swatches: ["#f0fdf4", "#059669", "#14b8a6"],
    isDark: false,
  },
  {
    id: "indigo",
    name: "Indigo Focus",
    description: "Calm blue-violet accents with crisp panels.",
    swatches: ["#eef2ff", "#4f46e5", "#06b6d4"],
    isDark: false,
  },
  {
    id: "rose",
    name: "Rose Premium",
    description: "Warm editorial accents without losing dashboard clarity.",
    swatches: ["#fff1f2", "#e11d48", "#f97316"],
    isDark: false,
  },
  {
    id: "graphite",
    name: "Graphite Pro",
    description: "Quiet dark graphite with electric cyan emphasis.",
    swatches: ["#09090b", "#22d3ee", "#a78bfa"],
    isDark: true,
  },
];

const THEME_IDS = THEMES.map((theme) => theme.id);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    return THEME_IDS.includes(savedTheme) ? savedTheme : "light";
  });

  const activeTheme = THEMES.find((item) => item.id === theme) || THEMES[0];

  useEffect(() => {
    document.documentElement.classList.remove(...THEME_IDS.map((id) => `theme-${id}`));
    document.documentElement.classList.add(`theme-${theme}`);
    document.documentElement.classList.toggle("dark", activeTheme.isDark);
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [activeTheme.isDark, theme]);

  const setTheme = (nextTheme) => {
    if (THEME_IDS.includes(nextTheme)) {
      setThemeState(nextTheme);
    }
  };

  const cycleTheme = () => {
    setThemeState((current) => {
      const currentIndex = THEME_IDS.indexOf(current);
      return THEME_IDS[(currentIndex + 1) % THEME_IDS.length];
    });
  };

  const value = useMemo(
    () => ({
      theme,
      themes: THEMES,
      currentTheme: activeTheme,
      isDark: activeTheme.isDark,
      toggleTheme: cycleTheme,
      setTheme,
    }),
    [activeTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
