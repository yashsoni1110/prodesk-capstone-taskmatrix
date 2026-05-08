"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-md border border-input bg-background/50 animate-pulse" />
    );
  }

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={cn(
        "group relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "active:scale-95"
      )}
      id="theme-toggle-btn"
      title={`Current: ${theme} — click to switch`}
    >
      <div className="relative h-4 w-4 overflow-hidden">
        <div className={cn(
          "absolute inset-0 transition-all duration-500 transform",
          theme === "light" ? "translate-y-0 rotate-0 opacity-100" : "translate-y-4 rotate-90 opacity-0"
        )}>
          <Sun className="h-4 w-4" />
        </div>
        <div className={cn(
          "absolute inset-0 transition-all duration-500 transform",
          theme === "dark" ? "translate-y-0 rotate-0 opacity-100" : (theme === "light" ? "-translate-y-4 -rotate-90 opacity-0" : "translate-y-4 rotate-90 opacity-0")
        )}>
          <Moon className="h-4 w-4" />
        </div>
        <div className={cn(
          "absolute inset-0 transition-all duration-500 transform",
          theme === "system" ? "translate-y-0 rotate-0 opacity-100" : "-translate-y-4 -rotate-90 opacity-0"
        )}>
          <Monitor className="h-4 w-4" />
        </div>
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
