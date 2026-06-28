"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeProviderPropsCustom = {
  children: React.ReactNode;
  attribute?: "class" | "data-theme" | string;
  defaultTheme?: string;
  enableSystem?: boolean;
  themes?: string[];
};

type ThemeContextValue = {
  theme: string | null;
  resolvedTheme: string | null;
  setTheme: (t: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  themes = [],
}: ThemeProviderPropsCustom) {
  const [theme, setThemeState] = useState<string | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<string | null>(null);

  const applyTheme = (t: string | null) => {
    if (typeof window === "undefined") return;
    const doc = document.documentElement;
    const themeName = t ?? "";
    if (attribute === "class") {
      // remove known theme classes
      if (Array.isArray(themes) && themes.length > 0) {
        doc.classList.remove(...themes.filter(Boolean));
      }
      if (themeName) doc.classList.add(themeName);
    } else if (attribute === "data-theme") {
      if (themeName) doc.setAttribute("data-theme", themeName);
      else doc.removeAttribute("data-theme");
    } else {
      // generic attribute
      if (themeName) doc.setAttribute(String(attribute), themeName);
      else doc.removeAttribute(String(attribute));
    }

    // update color-scheme for light/dark
    if (themeName === "dark") doc.style.colorScheme = "dark";
    else if (themeName === "light") doc.style.colorScheme = "light";
  };

  useEffect(() => {
    // Initialize theme from localStorage or system
    try {
      const stored = localStorage.getItem("theme");
      let initial = stored ?? null;
      if (!initial) {
        if (defaultTheme === "system" && enableSystem) {
          const m = window.matchMedia("(prefers-color-scheme: dark)");
          initial = m.matches ? "dark" : "light";
        } else {
          initial = defaultTheme ?? null;
        }
      }
      setThemeState(initial);
      setResolvedTheme(initial);
      applyTheme(initial);
    } catch (_e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = (t: string) => {
    try {
      localStorage.setItem("theme", t);
    } catch (_e) {}
    setThemeState(t);
    setResolvedTheme(t);
    applyTheme(t);
  };

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // fallback: provide a minimal API so components don't crash during SSR
    return {
      theme: null,
      resolvedTheme: null,
      setTheme: (_: string) => {},
    };
  }
  return ctx;
}
