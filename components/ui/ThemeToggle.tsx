"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all hover:scale-110">
        <span className="sr-only">Toggle theme</span>
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
      aria-label={resolvedTheme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      title={resolvedTheme === "light" ? "Switch to dark theme" : "Switch to light theme"}
    >
      {resolvedTheme === "light" ? (
        <Moon className="w-5 h-5" aria-hidden="true" />
      ) : (
        <Sun className="w-5 h-5" aria-hidden="true" />
      )}
      <span className="sr-only">
        {resolvedTheme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      </span>
    </button>
  );
}

