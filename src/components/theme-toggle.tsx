"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch — render nothing until mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  if (!mounted) {
    // Placeholder to prevent layout shift
    return (
      <button
        className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-input bg-background shadow-sm h-9 w-9"
        aria-label="Toggle theme"
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9 relative cursor-pointer"
      id="theme-toggle-btn"
      title={`Current: ${theme} — click to switch`}
    >
      {theme === "light" && (
        <Sun className="h-4 w-4" />
      )}
      {theme === "dark" && (
        <Moon className="h-4 w-4" />
      )}
      {theme === "system" && (
        <Monitor className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme (current: {theme})</span>
    </button>
  );
}
